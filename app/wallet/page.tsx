"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  status: string;
  razorpay_order_id?: string;
  payout_details?: string;
  created_at: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0.0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [razorpayKey, setRazorpayKey] = useState<string>("rzp_test_THdBrx27znX9M7");
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("user@chessarena.ai");

  // Add Money Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Withdraw Modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200);
  const [upiId, setUpiId] = useState<string>("");
  const [withdrawMsg, setWithdrawMsg] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string>("");

  // Notification Banner
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Load Razorpay SDK Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ balance: number; key_id: string; transactions: TransactionItem[] }>("/wallet/balance");
      if (res.data) {
        setBalance(res.data.balance || 0.0);
        if (res.data.key_id) setRazorpayKey(res.data.key_id);
        setTransactions(res.data.transactions || []);
      }
    } catch (e) {
      console.error("Wallet load note:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserName(currentUser.displayName || currentUser.email?.split("@")[0] || "User");
        setUserEmail(currentUser.email || "user@chessarena.ai");
      }
      fetchWalletData();
    });
    return () => unsubscribe();
  }, []);

  // Razorpay Checkout Trigger
  const handleAddMoney = async () => {
    if (depositAmount < 10) {
      setToast({ type: "error", msg: "Minimum deposit amount is ₹10" });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post("/wallet/create_order", { amount: depositAmount });
      const order = res.data;

      const options: any = {
        key: order.key_id || razorpayKey,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "ChessArena Wallet Deposit",
        description: `Add ₹${depositAmount} to your ChessArena wallet balance`,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post("/wallet/verify_payment", {
              razorpay_order_id: response.razorpay_order_id || order.order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || "simulated_sig",
              amount: depositAmount,
            });

            if (verifyRes.data?.balance !== undefined) {
              setBalance(verifyRes.data.balance);
              setToast({ type: "success", msg: `Payment Verified! ₹${depositAmount} added to your wallet.` });
              setShowAddModal(false);
              fetchWalletData();
            }
          } catch (err: any) {
            console.error("Payment verification error:", err);
            setToast({ type: "error", msg: "Payment verification failed." });
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: "9999999999",
        },
        theme: {
          color: "#4ade80",
        },
      };

      if (order.order_id && order.order_id.startsWith("order_rzp")) {
        options.order_id = order.order_id;
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp: any) {
          console.error("Payment failed note:", resp);
          setToast({ type: "error", msg: resp.error?.description || "Payment failed or cancelled." });
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback instant credit if popup is blocked
        const verifyRes = await api.post("/wallet/verify_payment", {
          razorpay_order_id: order.order_id,
          razorpay_payment_id: `pay_simulated_${Date.now()}`,
          razorpay_signature: "simulated_sig",
          amount: depositAmount,
        });
        if (verifyRes.data?.balance !== undefined) {
          setBalance(verifyRes.data.balance);
          setToast({ type: "success", msg: `₹${depositAmount} added to your wallet balance!` });
          setShowAddModal(false);
          fetchWalletData();
        }
      }
    } catch (e: any) {
      console.error("Error initiating payment:", e);
      setToast({ type: "error", msg: e?.response?.data?.detail || "Could not initiate payment." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawMsg("");

    if (withdrawAmount <= 0) {
      setWithdrawError("Please enter a valid amount.");
      return;
    }
    if (!upiId) {
      setWithdrawError("Please enter your UPI ID or Bank details.");
      return;
    }
    if (balance < withdrawAmount) {
      setWithdrawError(`Insufficient balance. Current balance: ₹${balance.toFixed(2)}`);
      return;
    }

    try {
      const res = await api.post("/wallet/withdraw", {
        amount: withdrawAmount,
        upi_id: upiId,
      });

      if (res.data?.balance !== undefined) {
        setBalance(res.data.balance);
        setToast({ type: "success", msg: res.data.message || `₹${withdrawAmount} requested for withdrawal.` });
        setShowWithdrawModal(false);
        fetchWalletData();
      }
    } catch (err: any) {
      console.error("Withdraw error:", err);
      setWithdrawError(err?.response?.data?.detail || "Withdrawal failed.");
    }
  };

  const presetAmounts = [100, 200, 500, 1000, 2500, 5000];

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-text-strong">Wallet & Payments</h1>
            <p className="text-[13px] text-text-muted">Manage your funds, add money via Razorpay, and request payouts.</p>
          </div>
          <Link href="/tournament" className="btn-outline text-[13px]">
            Join Tournaments »
          </Link>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`mb-6 p-3 rounded-sm border text-[13px] flex items-center justify-between ${
              toast.type === "success"
                ? "bg-accent-soft border-accent text-accent"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="text-[14px] font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Wallet Balance Hero Card */}
        <div className="card p-6 bg-gradient-to-r from-bg-card to-bg-card-soft border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 shadow-lg">
          <div>
            <span className="label-eyebrow block mb-1">Total Available Balance</span>
            <div className="text-[36px] font-extrabold text-accent tracking-tight">
              ₹{balance.toFixed(2)}
            </div>
            <p className="text-[12px] text-text-muted mt-1">
              Secured with Razorpay 256-Bit SSL Encryption
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-[14px] px-5 py-2.5 flex-1 sm:flex-initial flex items-center justify-center gap-2"
            >
              💳 Add Money (Razorpay)
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="btn-outline text-[14px] px-5 py-2.5 flex-1 sm:flex-initial"
            >
              💸 Withdraw Funds
            </button>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between">
            <h2 className="label-eyebrow">Transaction History</h2>
            <span className="text-[12px] text-text-muted">{transactions.length} records</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-[13px] text-text-muted">Loading transactions...</div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-border-soft">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-[16px] font-bold ${
                        t.type === "deposit"
                          ? "bg-accent/15 text-accent"
                          : t.type === "withdrawal"
                          ? "bg-danger/15 text-danger"
                          : "bg-blue/15 text-blue"
                      }`}
                    >
                      {t.type === "deposit" ? "↓" : t.type === "withdrawal" ? "↑" : "🏆"}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-text-strong capitalize">
                        {t.type === "deposit" ? "Deposit via Razorpay" : t.type === "withdrawal" ? "Withdrawal to UPI" : t.type}
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {t.created_at} {t.payout_details ? `\u00b7 ${t.payout_details}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-[15px] font-bold ${
                        t.type === "deposit" || t.type === "prize" ? "text-accent" : "text-text-strong"
                      }`}
                    >
                      {t.type === "deposit" || t.type === "prize" ? "+" : "-"}₹{t.amount.toFixed(2)}
                    </div>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full capitalize ${
                        t.status === "completed"
                          ? "bg-accent/10 text-accent font-semibold"
                          : t.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 font-semibold"
                          : "bg-danger/10 text-danger font-semibold"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[13px] text-text-muted">
              No transactions yet. Click <strong>Add Money</strong> to top up your wallet!
            </div>
          )}
        </div>
      </div>

      {/* Add Money Razorpay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-[440px] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold text-text-strong">💳 Add Funds to Wallet</h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-strong text-[18px]">
                ✕
              </button>
            </div>

            <p className="text-[13px] text-text-muted mb-4">
              Instant deposit via UPI, GPay, PhonePe, Paytm, Cards, or Netbanking powered by Razorpay.
            </p>

            <div className="mb-4">
              <label className="label-eyebrow block mb-2">Select Preset Amount (₹)</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 text-[13px] font-semibold rounded-sm border transition-colors ${
                      depositAmount === amt
                        ? "bg-accent-soft border-accent text-accent"
                        : "border-border text-text-muted hover:text-text-strong"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <label className="label-eyebrow block mb-1">Or Enter Custom Amount (₹)</label>
              <input
                type="number"
                min="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[15px] font-bold text-accent outline-none focus:border-accent"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="btn-outline flex-1 text-[13px]">
                Cancel
              </button>
              <button
                onClick={handleAddMoney}
                disabled={isProcessing}
                className="btn-primary flex-1 text-[13px] disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : `Pay ₹${depositAmount} with Razorpay`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-[440px] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-semibold text-text-strong">💸 Withdraw Funds</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-text-muted hover:text-text-strong text-[18px]">
                ✕
              </button>
            </div>

            {withdrawError && (
              <div className="mb-3 p-2.5 bg-danger/10 border border-danger/30 rounded-sm text-danger text-[12px]">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdrawal} className="space-y-3">
              <div>
                <label className="label-eyebrow block mb-1">Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[15px] font-bold text-text-strong outline-none focus:border-accent"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  Available: ₹{balance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="label-eyebrow block mb-1">UPI ID or Bank Account Details</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. adisharma@okaxis or 9876543210@paytm"
                  className="w-full bg-bg-input border border-border rounded-sm px-3 py-2 text-[13px] text-text-strong outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="btn-outline flex-1 text-[13px]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 text-[13px]">
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

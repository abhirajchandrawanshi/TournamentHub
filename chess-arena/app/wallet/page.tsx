export default function WalletPage() {
  return (
    <div className="container py-24">

      <h1 className="text-5xl font-bold">
        Wallet
      </h1>

      <div className="bg-[#141922] rounded-2xl border border-gray-800 p-10 mt-10">

        <h2 className="text-2xl">
          Current Balance
        </h2>

        <h3 className="text-5xl text-green-400 font-bold mt-4">
          ₹500
        </h3>

        <div className="flex gap-4 mt-10">

          <button className="bg-green-500 text-black px-8 py-4 rounded-xl font-bold">
            Deposit
          </button>

          <button className="border border-green-500 px-8 py-4 rounded-xl">
            Withdraw
          </button>

        </div>

      </div>

    </div>
  );
}
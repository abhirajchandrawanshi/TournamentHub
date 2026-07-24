"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { Chess, Square } from "chess.js";
import ChessBoard from "@/components/ChessBoard";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

function fenToPosition(fen: string): Record<string, string> {
  const position: Record<string, string> = {};
  const boardPart = fen.split(" ")[0];
  const rows = boardPart.split("/");
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  rows.forEach((row, rowIndex) => {
    const rank = 8 - rowIndex;
    let fileIndex = 0;

    for (let char of row) {
      if (/\d/.test(char)) {
        fileIndex += parseInt(char, 10);
      } else {
        const square = `${files[fileIndex]}${rank}`;
        const color = char === char.toUpperCase() ? "w" : "b";
        const pieceType = char.toUpperCase();
        position[square] = `${color}${pieceType}`;
        fileIndex++;
      }
    }
  });

  return position;
}

function PlayerRow({
  name,
  rating,
  color,
  clock,
  active,
}: {
  name: string;
  rating: number;
  color: "w" | "b";
  clock: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 card w-full">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-3 h-3 rounded-full border border-border-soft shrink-0"
          style={{ background: color === "w" ? "#f0eeec" : "#232323" }}
        />
        <span className="text-[14px] text-text-strong truncate">{name}</span>
        <span className="text-[12px] text-text-muted shrink-0">({rating})</span>
      </div>
      <span
        className={`font-mono text-[16px] sm:text-[18px] px-2.5 py-1 rounded-sm shrink-0 ${
          active ? "bg-accent text-[#10230a] font-semibold" : "bg-bg-input text-text"
        }`}
      >
        {clock}
      </span>
    </div>
  );
}

function GameComponent() {
  const searchParams = useSearchParams();
  const queryGameId = searchParams.get("gameId");

  const [mode, setMode] = useState<"ai" | "online" | "friend">("ai");
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<[string, string] | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("active");
  const [statusText, setStatusText] = useState<string>("White to play");
  const [whiteClock, setWhiteClock] = useState<number>(300);
  const [blackClock, setBlackClock] = useState<number>(300);
  const [gameId, setGameId] = useState<string | null>(queryGameId || null);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [opponentName, setOpponentName] = useState<string>("GM_Arjun_Mehta (AI)");
  const [opponentRating, setOpponentRating] = useState<number>(2400);
  const [myName, setMyName] = useState<string>("Player");
  const [myRating, setMyRating] = useState<number>(1500);
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "init", sender: "System", text: "Welcome to ChessArena! Good luck, have fun!", time: "12:00" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Sync auth profile for myName
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setMyName(currentUser.displayName || currentUser.email?.split("@")[0] || "Player");
      }
      try {
        const res = await api.get<{ user: { name: string; username: string; rating: number } }>("/auth/me");
        if (res.data?.user) {
          setMyName(res.data.user.name || res.data.user.username || currentUser?.displayName || "Player");
          setMyRating(res.data.user.rating || 1500);
        }
      } catch (e) {
        console.error("Auth profile fetch note:", e);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize or join existing game
  useEffect(() => {
    async function initGame() {
      if (queryGameId) {
        setMode("friend");
        try {
          const joinRes = await api.post(`/games/${queryGameId}/join`);
          if (joinRes.data?.color === "b") setPlayerColor("b");
          const gameRes = await api.get(`/games/${queryGameId}`);
          if (gameRes.data) {
            setGameId(queryGameId);
            setOpponentName(joinRes.data?.color === "b" ? gameRes.data.white.name : gameRes.data.black.name);
            setOpponentRating(joinRes.data?.color === "b" ? gameRes.data.white.rating : gameRes.data.black.rating);
          }
        } catch (e) {
          console.error("Error joining shared game:", e);
        }
      } else if (mode === "ai") {
        try {
          const res = await api.post("/games", { opponent_id: "ai-opponent", clock_control: "5+0" });
          if (res.data?.id) setGameId(res.data.id);
        } catch (e) {
          console.error("Session init:", e);
        }
      }
    }
    initGame();
  }, [queryGameId, mode]);

  // Live polling for online human opponents & invited friends & live chat
  useEffect(() => {
    if (mode === "ai" || !gameId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/games/${gameId}`);
        if (res.data) {
          if (res.data.fen && res.data.fen !== game.fen()) {
            const updatedChess = new Chess(res.data.fen);
            setGame(updatedChess);
            setFen(res.data.fen);
            setMoveHistory(res.data.moves || []);
          }
          if (res.data.status && res.data.status !== gameStatus) {
            setGameStatus(res.data.status);
            if (res.data.status === "active") {
              setStatusText("Match started! White to play");
            }
          }
          if (res.data.chat && Array.isArray(res.data.chat)) {
            setChatMessages(res.data.chat);
          }
          if (playerColor === "w" && res.data.black?.name && res.data.black?.id !== "waiting-opponent") {
            setOpponentName(res.data.black.name);
            setOpponentRating(res.data.black.rating);
          } else if (playerColor === "b" && res.data.white?.name) {
            setOpponentName(res.data.white.name);
            setOpponentRating(res.data.white.rating);
          }
        }
      } catch (err) {
        console.error("Live game sync err:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [game, gameId, mode, gameStatus, playerColor]);

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== "active") return;
    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteClock((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setBlackClock((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [game, gameStatus]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const makeMove = useCallback(
    async (from: string, to: string) => {
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (move) {
          const newFen = game.fen();
          setFen(newFen);
          setLastMove([from, to]);
          setMoveHistory((prev) => [...prev, move.san]);
          setSelectedSquare(null);
          setLegalTargets([]);

          // Update status
          if (game.isCheckmate()) {
            const winner = game.turn() === "w" ? "Black" : "White";
            setGameStatus("finished");
            setStatusText(`Checkmate! ${winner} wins!`);
          } else if (game.isDraw()) {
            setGameStatus("finished");
            setStatusText("Game drawn!");
          } else if (game.inCheck()) {
            setStatusText(`${game.turn() === "w" ? "White" : "Black"} is in check!`);
          } else {
            setStatusText(`${game.turn() === "w" ? "White" : "Black"} to play`);
          }

          // Sync move with live API backend
          if (gameId) {
            try {
              await api.post(`/games/${gameId}/move`, {
                fen: newFen,
                move: move.san,
                status: game.isCheckmate() ? (game.turn() === "w" ? "black_won" : "white_won") : undefined,
              });
            } catch (err) {
              console.error("Move sync failed:", err);
            }
          }

          return true;
        }
      } catch (e) {
        console.error("Invalid move:", e);
      }
      return false;
    },
    [game, gameId]
  );

  // Trigger AI move if in AI mode and it's Black's turn
  useEffect(() => {
    if (mode === "ai" && game.turn() === "b" && gameStatus === "active" && !game.isGameOver()) {
      const timer = setTimeout(() => {
        const possibleMoves = game.moves({ verbose: true });
        if (possibleMoves.length > 0) {
          const captures = possibleMoves.filter((m) => m.captured);
          const selectedMove =
            captures.length > 0
              ? captures[Math.floor(Math.random() * captures.length)]
              : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

          makeMove(selectedMove.from, selectedMove.to);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game, fen, gameStatus, makeMove, mode]);

  const handleSquareClick = (square: string) => {
    if (gameStatus !== "active") return;
    if (mode !== "ai" && game.turn() !== playerColor) return;

    if (selectedSquare) {
      if (legalTargets.includes(square)) {
        makeMove(selectedSquare, square);
        return;
      }
    }

    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square: square as Square, verbose: true });
      setLegalTargets(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalTargets([]);
    }
  };

  const switchToAiMode = () => {
    setMode("ai");
    setOpponentName("GM_Arjun_Mehta (AI)");
    setOpponentRating(2400);
    handleNewGame();
  };

  const startOnlineMatchmaking = async () => {
    setMode("online");
    setOpponentName("Searching for Opponent...");
    setOpponentRating(1500);
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setMoveHistory([]);
    setWhiteClock(300);
    setBlackClock(300);

    try {
      const res = await api.post("/games/matchmake");
      if (res.data?.id) {
        setGameId(res.data.id);
        setPlayerColor(res.data.color || "w");
        setOpponentName(res.data.status === "waiting" ? "Searching for Opponent..." : "Online Competitor");
        setGameStatus(res.data.status);
      }
    } catch (e) {
      console.error("Matchmaking error:", e);
    }
  };

  const startInviteGame = async () => {
    setMode("friend");
    setPlayerColor("w");
    setOpponentName("Searching for Opponent...");
    setOpponentRating(1500);
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setMoveHistory([]);
    setWhiteClock(300);
    setBlackClock(300);
    setGameStatus("waiting");

    let newId = `invite-${Math.random().toString(36).substring(2, 10)}`;
    try {
      const res = await api.post("/games/invite");
      if (res.data?.id) {
        newId = res.data.id;
      }
    } catch (e) {
      console.error("Invite API note:", e);
    }

    setGameId(newId);
    const url = `${window.location.origin}/game?gameId=${newId}`;
    setInviteUrl(url);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error("Clipboard error:", e);
    }
    setShowInviteModal(true);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput("");

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: myName,
      text: textToSend,
      time: nowStr
    };

    setChatMessages((prev) => [...prev, userMsg]);

    if (mode === "ai") {
      setTimeout(() => {
        const aiReplies = [
          "Good move!",
          "Interesting tactic!",
          "Good luck, have fun!",
          "Nice play!",
          "Well played!"
        ];
        const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
        setChatMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "GM_Arjun_Mehta (AI)",
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1000);
    } else if (gameId) {
      try {
        const res = await api.post(`/games/${gameId}/chat`, {
          text: textToSend,
          sender: myName
        });
        if (res.data?.chat) {
          setChatMessages(res.data.chat);
        }
      } catch (err) {
        console.error("Chat send error:", err);
      }
    }
  };

  const handleResign = async () => {
    setGameStatus("finished");
    setStatusText("You resigned.");
    if (gameId) {
      try {
        await api.post(`/games/${gameId}/resign`);
      } catch (err) {
        console.error("Resign API call error:", err);
      }
    }
  };

  const handleNewGame = () => {
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setMoveHistory([]);
    setGameStatus("active");
    setStatusText("White to play");
    setWhiteClock(300);
    setBlackClock(300);
    setMode("ai");
  };

  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  return (
    <main className="flex-1 bg-bg">
      <div className="max-w-[1000px] mx-auto px-3 py-4 grid grid-cols-1 lg:grid-cols-[minmax(0,520px)_300px] gap-4 justify-center">
        {/* Board column */}
        <div className="flex flex-col gap-2 items-center lg:items-stretch">
          {/* Mode Selector Header */}
          <div className="flex gap-2 w-full mb-1">
            <button
              onClick={switchToAiMode}
              className={`flex-1 text-[12px] sm:text-[13px] py-1.5 px-2 rounded-sm border transition-colors ${
                mode === "ai"
                  ? "bg-accent-soft border-accent text-accent font-semibold"
                  : "border-border text-text-muted hover:text-text-strong"
              }`}
            >
              🤖 vs Computer AI
            </button>
            <button
              onClick={startOnlineMatchmaking}
              className={`flex-1 text-[12px] sm:text-[13px] py-1.5 px-2 rounded-sm border transition-colors ${
                mode === "online"
                  ? "bg-accent-soft border-accent text-accent font-semibold"
                  : "border-border text-text-muted hover:text-text-strong"
              }`}
            >
              ⚔️ Online Matchmaking
            </button>
          </div>

          <PlayerRow
            name={playerColor === "w" ? opponentName : myName}
            rating={playerColor === "w" ? opponentRating : myRating}
            color="b"
            clock={formatTime(blackClock)}
            active={game.turn() === "b" && gameStatus === "active"}
          />
          
          <div className="flex justify-center my-1">
            <ChessBoard
              position={fenToPosition(fen)}
              size={480}
              orientation={playerColor === "w" ? "white" : "black"}
              interactive={gameStatus === "active" && (mode === "ai" || game.turn() === playerColor)}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
            />
          </div>

          <PlayerRow
            name={playerColor === "w" ? myName : opponentName}
            rating={playerColor === "w" ? myRating : opponentRating}
            color="w"
            clock={formatTime(whiteClock)}
            active={game.turn() === "w" && gameStatus === "active"}
          />

          <div className="flex gap-2 mt-1 w-full">
            {gameStatus === "active" || gameStatus === "waiting" ? (
              <>
                <button onClick={startInviteGame} className="btn-outline text-[13px] flex-1">
                  {copied ? "Link Copied!" : "🔗 Invite Friend"}
                </button>
                <button onClick={handleResign} className="btn-outline text-[13px] flex-1 !border-danger !text-danger">
                  Resign
                </button>
              </>
            ) : (
              <button onClick={handleNewGame} className="btn-primary text-[13px] w-full">
                Play New Game
              </button>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="card p-3">
            <div className="label-eyebrow mb-2">
              {mode === "ai" ? "Vs AI Computer" : mode === "online" ? "Live Online Match" : "Friend Challenge"} &middot; 5+0
            </div>
            <div className="text-[13px] text-text font-medium">
              {statusText}
            </div>
          </div>

          <div className="card flex-1 overflow-hidden flex flex-col min-h-[220px]">
            <div className="px-3 py-2 border-b border-border-soft label-eyebrow">Moves ({moveHistory.length})</div>
            <div className="overflow-y-auto max-h-[260px] text-[13px]">
              {movePairs.length > 0 ? (
                movePairs.map(([w, b], i) => (
                  <div key={i} className="grid grid-cols-[28px_1fr_1fr] px-3 py-1.5 odd:bg-white/[0.02]">
                    <span className="text-text-muted">{i + 1}.</span>
                    <span className="text-text-strong font-mono">{w}</span>
                    <span className="text-text-strong font-mono">{b || ""}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-[12px] text-text-muted text-center italic">
                  Click a piece to start making moves!
                </div>
              )}
            </div>
          </div>

          <div className="card p-3 flex flex-col h-[200px]">
            <div className="label-eyebrow mb-2">Live Chat</div>
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-1.5 mb-2 pr-1 text-[12px]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="leading-tight">
                  <span className="font-semibold text-accent">{msg.sender}: </span>
                  <span className="text-text-strong">{msg.text}</span>
                  <span className="text-[10px] text-text-muted ml-1.5">({msg.time})</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-bg-input border border-border rounded-sm px-2.5 py-1.5 text-[12px] text-text-strong outline-none focus:border-accent"
              />
              <button type="submit" className="btn-primary text-[12px] px-3 py-1.5 shrink-0">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Invite Challenge Link Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="card w-full max-w-[440px] p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-semibold text-text-strong">⚔️ Challenge a Friend</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-text-muted hover:text-text-strong text-[18px]"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-text-muted mb-4">
              Send this custom match link to your friend. As soon as they open it in their browser, your board will automatically sync live!
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-bg-input border border-border rounded-sm px-3 py-2 text-[13px] text-accent font-mono outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-primary text-[13px] shrink-0"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <button
              onClick={() => setShowInviteModal(false)}
              className="btn-outline w-full text-[13px]"
            >
              Close & Wait on Board
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-muted">Loading Game Engine...</div>}>
      <GameComponent />
    </Suspense>
  );
}

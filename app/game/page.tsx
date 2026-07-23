"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { Chess, Square } from "chess.js";
import ChessBoard from "@/components/ChessBoard";
import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";

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
  const [copied, setCopied] = useState(false);

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

  // Live polling for online human opponents
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
          if (res.data.status && res.data.status !== "waiting" && res.data.status !== gameStatus) {
            setGameStatus(res.data.status);
          }
          if (playerColor === "w" && res.data.black?.name) {
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

  const startOnlineMatchmaking = async () => {
    setMode("online");
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

  const copyInviteLink = () => {
    if (!gameId) return;
    const url = `${window.location.origin}/game?gameId=${gameId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              onClick={() => setMode("ai")}
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
            name={playerColor === "w" ? opponentName : "You"}
            rating={playerColor === "w" ? opponentRating : 1967}
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
            name={playerColor === "w" ? "You" : opponentName}
            rating={playerColor === "w" ? 1967 : opponentRating}
            color="w"
            clock={formatTime(whiteClock)}
            active={game.turn() === "w" && gameStatus === "active"}
          />

          <div className="flex gap-2 mt-1 w-full">
            {gameStatus === "active" ? (
              <>
                <button onClick={copyInviteLink} className="btn-outline text-[13px] flex-1">
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

          <div className="card p-3">
            <div className="label-eyebrow mb-2">Live Chat</div>
            <div className="text-[13px] text-text-muted italic mb-2">
              {opponentName}: Good luck, have fun!
            </div>
            <input
              placeholder="Send a message..."
              className="w-full bg-bg-input border border-border rounded-sm px-2.5 py-1.5 text-[13px] text-text-strong outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
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

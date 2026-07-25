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
  // Online matchmaking phase: lobby (show Find Match), searching (polling), connected (playing)
  const [onlinePhase, setOnlinePhase] = useState<"lobby" | "searching" | "connected">("lobby");
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
  const [playerColor, setPlayerColor] = useState<"w" | "b" | "spectator">("w");
  const [opponentName, setOpponentName] = useState<string>("GM_Arjun_Mehta (AI)");
  const [opponentRating, setOpponentRating] = useState<number>(2400);
  const [myName, setMyName] = useState<string>("Player");
  const [myRating, setMyRating] = useState<number>(1500);
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [searchTime, setSearchTime] = useState(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "init", sender: "System", text: "Welcome to ChessArena! Good luck, have fun!", time: "12:00" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

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

  // Initialize or join existing game (AI auto-start, friend link join)
  useEffect(() => {
    async function initGame() {
      if (queryGameId) {
        // Joining via invite link
        setMode("friend");
        setOnlinePhase("connected");
        try {
          const joinRes = await api.post(`/games/${queryGameId}/join`);
          if (joinRes.data?.color === "b") setPlayerColor("b");
          else setPlayerColor("w");
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
        // AI mode auto-starts
        try {
          const res = await api.post("/games", { opponent_id: "ai-opponent", clock_control: "5+0" });
          if (res.data?.id) {
            setGameId(res.data.id);
            // Handle random color from backend
            if (res.data.white_player_id && res.data.black_player_id) {
              if (res.data.black_player_id === "ai-opponent") {
                setPlayerColor("w");
              } else if (res.data.white_player_id === "ai-opponent") {
                setPlayerColor("b");
              }
            }
          }
        } catch (e) {
          console.error("Session init:", e);
        }
      }
    }
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryGameId]);

  // Search time counter during matchmaking
  useEffect(() => {
    if (mode !== "online" || onlinePhase !== "searching") {
      setSearchTime(0);
      return;
    }
    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, onlinePhase]);

  // Poll for opponent during matchmaking search
  useEffect(() => {
    if (mode !== "online" || onlinePhase !== "searching" || !gameId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/games/${gameId}`);
        if (res.data) {
          const isActive = res.data.status === "active";
          const hasRealWhite = res.data.white?.id && res.data.white.id !== "waiting-opponent";
          const hasRealBlack = res.data.black?.id && res.data.black.id !== "waiting-opponent";

          if (isActive && hasRealWhite && hasRealBlack) {
            // Opponent found!
            setOnlinePhase("connected");
            setGameStatus("active");
            setWhiteClock(300);
            setBlackClock(300);

            if (playerColor === "w") {
              setOpponentName(res.data.black.name || "Online Player");
              setOpponentRating(res.data.black.rating || 1500);
            } else {
              setOpponentName(res.data.white.name || "Online Player");
              setOpponentRating(res.data.white.rating || 1500);
            }

            setStatusText("⚔️ Match found! Game started — White to play");
          }
        }
      } catch (err) {
        console.error("Matchmake poll error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mode, onlinePhase, gameId, playerColor]);

  // Live polling for online connected games & invited friends & live chat
  useEffect(() => {
    if (mode === "ai" || !gameId) return;
    if (mode === "online" && onlinePhase !== "connected") return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/games/${gameId}`);
        if (res.data) {
          // Sync FEN & moves if changed
          if (res.data.fen && res.data.fen !== game.fen()) {
            const updatedChess = new Chess(res.data.fen);
            setGame(updatedChess);
            setFen(res.data.fen);
            setMoveHistory(res.data.moves || []);
          }

          // Status transition (waiting -> active means opponent joined)
          if (res.data.status && res.data.status !== gameStatus) {
            setGameStatus(res.data.status);
            if (res.data.status === "active") {
              setStatusText(`⚔️ Match started! ${res.data.moves?.length ? "Game in progress" : "White to play"}`);
              setWhiteClock(300);
              setBlackClock(300);
            } else if (res.data.status === "white_won") {
              setStatusText("White wins!");
            } else if (res.data.status === "black_won") {
              setStatusText("Black wins!");
            } else if (res.data.status === "draw") {
              setStatusText("Game drawn!");
            }
          }

          // Sync chat
          if (res.data.chat && Array.isArray(res.data.chat)) {
            setChatMessages(res.data.chat);
          }

          // Update opponent info (handles both initial load and friend joining)
          if (playerColor === "w" && res.data.black?.id && res.data.black.id !== "waiting-opponent") {
            setOpponentName(res.data.black.name || "Opponent");
            setOpponentRating(res.data.black.rating || 1500);
          } else if (playerColor === "b" && res.data.white?.id && res.data.white.id !== "waiting-opponent") {
            setOpponentName(res.data.white.name || "Opponent");
            setOpponentRating(res.data.white.rating || 1500);
          }
        }
      } catch (err) {
        console.error("Live game sync err:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [game, gameId, mode, gameStatus, playerColor, onlinePhase]);

  const [replayStep, setReplayStep] = useState<number | null>(null);

  // Timer countdown — ONLY when game is truly active with opponent connected
  useEffect(() => {
    if (gameStatus !== "active") return;
    // For online mode, only tick timer when opponent has connected
    if (mode === "online" && onlinePhase !== "connected") return;
    // For friend mode waiting, don't tick
    if (mode === "friend" && (gameStatus as string) === "waiting") return;

    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteClock((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        setBlackClock((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [game, gameStatus, mode, onlinePhase]);

  // Timeout loss detection
  useEffect(() => {
    if (gameStatus !== "active") return;
    if (whiteClock === 0) {
      setGameStatus("finished");
      setStatusText("Black wins on time!");
      if (gameId) api.post(`/games/${gameId}/timeout`, { loser_color: "w" }).catch(() => {});
    } else if (blackClock === 0) {
      setGameStatus("finished");
      setStatusText("White wins on time!");
      if (gameId) api.post(`/games/${gameId}/timeout`, { loser_color: "b" }).catch(() => {});
    }
  }, [whiteClock, blackClock, gameStatus, gameId]);

  const handleReplayStep = (step: "first" | "prev" | "next" | "last") => {
    if (moveHistory.length === 0) return;
    let currentIdx = replayStep !== null ? replayStep : moveHistory.length;
    if (step === "first") currentIdx = 0;
    if (step === "prev") currentIdx = Math.max(0, currentIdx - 1);
    if (step === "next") currentIdx = Math.min(moveHistory.length, currentIdx + 1);
    if (step === "last") currentIdx = moveHistory.length;

    setReplayStep(currentIdx);

    const tempEngine = new Chess();
    for (let i = 0; i < currentIdx; i++) {
      try {
        tempEngine.move(moveHistory[i]);
      } catch (e) {}
    }
    setFen(tempEngine.fen());
  };

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

  // AI move logic
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
    // In online mode, don't allow moves until connected
    if (mode === "online" && onlinePhase !== "connected") return;
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

  // Switch to AI mode
  const switchToAiMode = async () => {
    setMode("ai");
    setOnlinePhase("lobby");
    setOpponentName("GM_Arjun_Mehta (AI)");
    setOpponentRating(2400);
    setPlayerColor("w");
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

    try {
      const res = await api.post("/games", { opponent_id: "ai-opponent", clock_control: "5+0" });
      if (res.data?.id) setGameId(res.data.id);
    } catch (e) {
      console.error("AI game init:", e);
    }
  };

  // Switch to online mode (just show lobby, don't search yet)
  const switchToOnlineMode = () => {
    setMode("online");
    setOnlinePhase("lobby");
    setOpponentName("—");
    setOpponentRating(0);
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setSelectedSquare(null);
    setLegalTargets([]);
    setLastMove(null);
    setMoveHistory([]);
    setGameStatus("waiting");
    setStatusText("Click Find Match to start searching");
    setWhiteClock(300);
    setBlackClock(300);
    setGameId(null);
  };

  // Actually start searching for a match
  const handleFindMatch = async () => {
    setOnlinePhase("searching");
    setSearchTime(0);
    setOpponentName("Searching...");
    setOpponentRating(0);
    setStatusText("Searching for an opponent...");

    try {
      const res = await api.post("/games/matchmake");
      if (res.data?.id) {
        setGameId(res.data.id);
        setPlayerColor(res.data.color || "w");

        if (res.data.status === "active") {
          // Instantly matched! Opponent was already waiting.
          setOnlinePhase("connected");
          setGameStatus("active");
          setWhiteClock(300);
          setBlackClock(300);
          setStatusText("⚔️ Match found instantly! White to play");
          // Opponent details will be filled by polling
        } else {
          // Status is "waiting" — we created a new game, wait for opponent
          setGameStatus("waiting");
          setStatusText("Waiting for an opponent to join...");
        }
      }
    } catch (e) {
      console.error("Matchmaking error:", e);
      setOnlinePhase("lobby");
      setStatusText("Matchmaking failed. Try again.");
    }
  };

  // Cancel search
  const handleCancelSearch = () => {
    setOnlinePhase("lobby");
    setGameStatus("waiting");
    setStatusText("Search cancelled. Click Find Match to try again.");
    setGameId(null);
    setSearchTime(0);
  };

  const startInviteGame = async () => {
    setMode("friend");
    setOnlinePhase("connected");
    setPlayerColor("w");
    setOpponentName("Waiting for Friend...");
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
    setOnlinePhase("lobby");
  };

  const movePairs: [string, string?][] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1]]);
  }

  // Determine if the board should be interactive
  const isBoardInteractive =
    gameStatus === "active" &&
    (mode === "ai" || (mode === "online" && onlinePhase === "connected" && game.turn() === playerColor) || (mode === "friend" && game.turn() === playerColor));

  // Should we show the online lobby/searching overlay?
  const showOnlineOverlay = mode === "online" && onlinePhase !== "connected";

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
              onClick={switchToOnlineMode}
              className={`flex-1 text-[12px] sm:text-[13px] py-1.5 px-2 rounded-sm border transition-colors ${
                mode === "online"
                  ? "bg-accent-soft border-accent text-accent font-semibold"
                  : "border-border text-text-muted hover:text-text-strong"
              }`}
            >
              ⚔️ Online Matchmaking
            </button>
          </div>

          {/* Top row = opponent (their clock, their color) */}
          <PlayerRow
            name={opponentName}
            rating={opponentRating}
            color={playerColor === "w" ? "b" : "w"}
            clock={formatTime(playerColor === "w" ? blackClock : whiteClock)}
            active={game.turn() !== playerColor && gameStatus === "active" && !showOnlineOverlay}
          />

          {/* Board wrapper with overlay */}
          <div className="relative flex justify-center my-1">
            <ChessBoard
              position={fenToPosition(fen)}
              size={480}
              orientation={playerColor === "w" ? "white" : "black"}
              interactive={isBoardInteractive}
              selectedSquare={selectedSquare}
              legalTargets={legalTargets}
              lastMove={lastMove}
              onSquareClick={handleSquareClick}
            />

            {/* Online Lobby / Searching Overlay */}
            {showOnlineOverlay && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
                <div className="text-center p-6 max-w-[360px]">
                  {onlinePhase === "lobby" ? (
                    <>
                      <div className="text-[48px] mb-4">⚔️</div>
                      <h2 className="text-[20px] font-bold text-white mb-2">Online Matchmaking</h2>
                      <p className="text-[14px] text-white/70 mb-6">
                        Find a random opponent and get assigned a random color. Timer starts when both players are connected.
                      </p>
                      <button
                        onClick={handleFindMatch}
                        className="w-full py-3 px-6 rounded-md text-[15px] font-semibold transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, #7ae22e, #5cb91f)",
                          color: "#0a1a04",
                          boxShadow: "0 4px 20px rgba(122, 226, 46, 0.3)"
                        }}
                      >
                        🔍 Find Match
                      </button>
                      <button
                        onClick={startInviteGame}
                        className="w-full mt-3 py-2.5 px-6 rounded-md text-[13px] font-medium border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                      >
                        🔗 Or Invite a Friend
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Searching animation */}
                      <div className="relative mb-4">
                        <div className="w-16 h-16 mx-auto rounded-full border-4 border-transparent border-t-[#7ae22e] border-r-[#7ae22e] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[24px]">♟️</span>
                        </div>
                      </div>
                      <h2 className="text-[18px] font-bold text-white mb-1">Searching for Opponent...</h2>
                      <div className="font-mono text-[24px] text-[#7ae22e] mb-2">
                        {Math.floor(searchTime / 60).toString().padStart(2, "0")}:{(searchTime % 60).toString().padStart(2, "0")}
                      </div>
                      <p className="text-[13px] text-white/50 mb-1">
                        You&apos;ll be randomly assigned ⬜ White or ⬛ Black
                      </p>
                      <p className="text-[12px] text-white/40 mb-5">
                        Waiting for another player to click Find Match...
                      </p>
                      <button
                        onClick={handleCancelSearch}
                        className="py-2 px-6 rounded-md text-[13px] font-medium border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        ✕ Cancel Search
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom row = you (your clock, your color) */}
          <PlayerRow
            name={myName}
            rating={myRating}
            color={playerColor === "w" ? "w" : "b"}
            clock={formatTime(playerColor === "w" ? whiteClock : blackClock)}
            active={game.turn() === playerColor && gameStatus === "active" && !showOnlineOverlay}
          />

          <div className="flex gap-2 mt-1 w-full">
            {gameStatus === "active" || gameStatus === "waiting" ? (
              <>
                <button onClick={startInviteGame} className="btn-outline text-[13px] flex-1">
                  {copied ? "Link Copied!" : "🔗 Invite Friend"}
                </button>
                <button onClick={handleResign} className="btn-outline text-[13px] flex-1 !border-danger !text-danger" disabled={showOnlineOverlay}>
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
            {(mode === "online" || mode === "friend") && gameStatus !== "waiting" && (
              <div className="mt-2 text-[12px] text-accent font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                You are playing as {playerColor === "w" ? "⬜ White" : "⬛ Black"}
              </div>
            )}
            {mode === "friend" && gameStatus === "waiting" && (
              <div className="mt-2 text-[12px] text-yellow-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Waiting for friend to join via invite link...
              </div>
            )}
          </div>

          <div className="card flex-1 overflow-hidden flex flex-col min-h-[220px]">
            <div className="px-3 py-2 border-b border-border-soft label-eyebrow flex justify-between items-center">
              <span>Moves ({moveHistory.length})</span>
              {playerColor === "spectator" && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">👁️ Spectating</span>}
            </div>
            <div className="overflow-y-auto max-h-[200px] text-[13px] flex-1">
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
                  {showOnlineOverlay ? "Find a match to start playing!" : "Click a piece to start making moves!"}
                </div>
              )}
            </div>
            {/* Match Replay Stepper Controls */}
            {moveHistory.length > 0 && (
              <div className="p-2 border-t border-border-soft flex gap-1 bg-bg-input/40 justify-center">
                <button onClick={() => handleReplayStep("first")} title="First move" className="btn-outline text-[11px] px-2 py-1">⏮ First</button>
                <button onClick={() => handleReplayStep("prev")} title="Previous move" className="btn-outline text-[11px] px-2 py-1">◀ Prev</button>
                <button onClick={() => handleReplayStep("next")} title="Next move" className="btn-outline text-[11px] px-2 py-1">▶ Next</button>
                <button onClick={() => handleReplayStep("last")} title="Last move" className="btn-outline text-[11px] px-2 py-1">⏭ Live</button>
              </div>
            )}
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

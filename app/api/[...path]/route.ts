import { NextRequest, NextResponse } from "next/server";
import { getPool, ensureSystemUsers, getUserFromAuth } from "@/lib/db-server";
import crypto from "crypto";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function genId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

// ───── GET handler ─────
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pool = getPool();
  const route = path.join("/");

  try {
    // GET /api/auth/me
    if (route === "auth/me") {
      const user = await getUserFromAuth(req.headers.get("authorization"), pool);
      return json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, rating: user.rating, avatar: user.avatar || null, wallet_balance: user.wallet_balance || 0 } });
    }

    // GET /api/games/user/history
    if (route === "games/user/history") {
      const user = await getUserFromAuth(req.headers.get("authorization"), pool);
      const result = await pool.query(
        `SELECT g.*, 
          wu.name as white_name, wu.rating as white_rating,
          bu.name as black_name, bu.rating as black_rating
         FROM games g
         LEFT JOIN users wu ON g.white_player_id = wu.id
         LEFT JOIN users bu ON g.black_player_id = bu.id
         WHERE g.white_player_id = $1 OR g.black_player_id = $1
         ORDER BY g.created_at DESC LIMIT 20`,
        [user.id]
      );
      const history = result.rows.map((g: any) => {
        const isWhite = g.white_player_id === user.id;
        const oppName = isWhite
          ? (g.black_name || "Opponent")
          : (g.white_name || "Opponent");
        let resultText = "Draw";
        if (g.status === "white_won") resultText = isWhite ? "Victory" : "Defeat";
        else if (g.status === "black_won") resultText = isWhite ? "Defeat" : "Victory";
        else if (g.status === "active") resultText = "In Progress";
        const movesArr = g.moves ? g.moves.split(",") : [];
        return {
          id: g.id, opponent: oppName, color: isWhite ? "White" : "Black",
          result: resultText, status: g.status, clock: g.clock_control,
          moves_count: movesArr.length,
          created_at: g.created_at ? new Date(g.created_at).toISOString().slice(0, 16).replace("T", " ") : "Recently",
        };
      });
      return json(history);
    }

    // GET /api/games/{gameId}
    if (path[0] === "games" && path.length === 2) {
      const gameId = path[1];
      const result = await pool.query(
        `SELECT g.*, 
          wu.id as w_id, wu.name as w_name, wu.rating as w_rating, wu.avatar as w_avatar,
          bu.id as b_id, bu.name as b_name, bu.rating as b_rating, bu.avatar as b_avatar
         FROM games g
         LEFT JOIN users wu ON g.white_player_id = wu.id
         LEFT JOIN users bu ON g.black_player_id = bu.id
         WHERE g.id = $1`,
        [gameId]
      );
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = result.rows[0];
      let chatMessages: any[] = [];
      if (g.chat) { try { chatMessages = JSON.parse(g.chat); } catch {} }
      return json({
        id: g.id, tournament_id: g.tournament_id,
        white: { id: g.w_id || "white-player", name: g.w_name || "White Player", rating: g.w_rating || 1500, avatar: g.w_avatar || null },
        black: { id: g.b_id || "waiting-opponent", name: g.b_name || "Waiting for Opponent...", rating: g.b_rating || 1500, avatar: g.b_avatar || null },
        clock_control: g.clock_control, fen: g.fen,
        moves: g.moves ? g.moves.split(",") : [],
        status: g.status, chat: chatMessages, created_at: g.created_at,
      });
    }

    // GET /api/leaderboard
    if (route === "leaderboard") {
      const result = await pool.query(
        `SELECT id, name, username, rating, avatar FROM users
         WHERE id NOT IN ('waiting-opponent', 'ai-opponent', 'guest-player')
         AND id NOT LIKE 'guest-%'
         ORDER BY rating DESC LIMIT 50`
      );
      return json(result.rows);
    }

    // GET /api/tournaments
    if (route === "tournaments") {
      const result = await pool.query(
        `SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id ORDER BY t.created_at DESC LIMIT 20`
      );
      return json(result.rows);
    }

    // GET /api/tournaments/{id}
    if (path[0] === "tournaments" && path.length === 2) {
      const result = await pool.query(
        `SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id WHERE t.id = $1`,
        [path[1]]
      );
      if (result.rows.length === 0) return json({ detail: "Tournament not found" }, 404);
      return json(result.rows[0]);
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("API GET error:", e);
    return json({ detail: "Internal server error", error: e.message }, 500);
  }
}

// ───── POST handler ─────
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pool = getPool();
  const route = path.join("/");

  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const user = await getUserFromAuth(req.headers.get("authorization"), pool);
    await ensureSystemUsers(pool);

    // POST /api/games/matchmake
    if (route === "games/matchmake") {
      // 1. Check existing waiting game for this user
      const existing = await pool.query(
        `SELECT * FROM games WHERE status = 'waiting' AND (white_player_id = $1 OR black_player_id = $1) LIMIT 1`,
        [user.id]
      );
      if (existing.rows.length > 0) {
        const g = existing.rows[0];
        const color = g.white_player_id === user.id ? "w" : "b";
        return json({ id: g.id, status: "waiting", color });
      }

      // 2. Find another player's waiting game
      const waiting = await pool.query(
        `SELECT * FROM games WHERE status = 'waiting' AND white_player_id != $1 AND black_player_id != $1 ORDER BY created_at ASC LIMIT 1`,
        [user.id]
      );
      if (waiting.rows.length > 0) {
        const g = waiting.rows[0];
        let color: string;
        if (g.white_player_id === "waiting-opponent") {
          await pool.query(`UPDATE games SET white_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
          color = "w";
        } else {
          await pool.query(`UPDATE games SET black_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
          color = "b";
        }
        return json({ id: g.id, status: "active", color });
      }

      // 3. Create new waiting game with random color
      const gameId = genId("game");
      const isWhite = Math.random() > 0.5;
      const whiteId = isWhite ? user.id : "waiting-opponent";
      const blackId = isWhite ? "waiting-opponent" : user.id;
      const color = isWhite ? "w" : "b";
      await pool.query(
        `INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status)
         VALUES ($1, $2, $3, '5+0', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'waiting')`,
        [gameId, whiteId, blackId]
      );
      return json({ id: gameId, status: "waiting", color });
    }

    // POST /api/games/invite
    if (route === "games/invite") {
      const gameId = genId("invite");
      await pool.query(
        `INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status)
         VALUES ($1, $2, 'waiting-opponent', '5+0', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'waiting')`,
        [gameId, user.id]
      );
      return json({ id: gameId, status: "waiting", color: "w" });
    }

    // POST /api/games (create game — for AI or custom)
    if (route === "games") {
      const opponentId = body.opponent_id || "ai-opponent";
      const clockControl = body.clock_control || "5+0";
      const tournamentId = body.tournament_id || null;
      const gameId = genId("game");
      const isWhite = Math.random() > 0.5;
      const whiteId = isWhite ? user.id : opponentId;
      const blackId = isWhite ? opponentId : user.id;
      await pool.query(
        `INSERT INTO games (id, tournament_id, white_player_id, black_player_id, clock_control, fen, moves, status)
         VALUES ($1, $2, $3, $4, $5, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'active')`,
        [gameId, tournamentId, whiteId, blackId, clockControl]
      );
      return json({ id: gameId, white_player_id: whiteId, black_player_id: blackId, status: "active" });
    }

    // POST /api/games/{gameId}/join
    if (path[0] === "games" && path.length === 3 && path[2] === "join") {
      const gameId = path[1];
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [gameId]);
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = result.rows[0];

      if (g.white_player_id === user.id) return json({ id: g.id, color: "w", status: g.status });
      if (g.black_player_id === user.id) return json({ id: g.id, color: "b", status: g.status });
      if (g.black_player_id === "waiting-opponent" && g.white_player_id !== user.id) {
        await pool.query(`UPDATE games SET black_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
        return json({ id: g.id, color: "b", status: "active" });
      }
      if (g.white_player_id === "waiting-opponent" && g.black_player_id !== user.id) {
        await pool.query(`UPDATE games SET white_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
        return json({ id: g.id, color: "w", status: "active" });
      }
      return json({ id: g.id, color: "spectator", status: g.status });
    }

    // POST /api/games/{gameId}/move
    if (path[0] === "games" && path.length === 3 && path[2] === "move") {
      const gameId = path[1];
      const { fen, move, status } = body;
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [gameId]);
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = result.rows[0];
      const existingMoves = g.moves ? g.moves.split(",").filter(Boolean) : [];
      if (move) existingMoves.push(move);
      const newStatus = status || g.status;
      await pool.query(`UPDATE games SET fen = $1, moves = $2, status = $3 WHERE id = $4`, [fen || g.fen, existingMoves.join(","), newStatus, gameId]);
      
      if (newStatus === "white_won" || newStatus === "black_won") {
        try {
          if (newStatus === "white_won") {
            await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [g.white_player_id]);
            await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [g.black_player_id]);
          } else {
            await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [g.black_player_id]);
            await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [g.white_player_id]);
          }
        } catch {}
      }
      return json({ id: gameId, status: newStatus });
    }

    // POST /api/games/{gameId}/chat
    if (path[0] === "games" && path.length === 3 && path[2] === "chat") {
      const gameId = path[1];
      const result = await pool.query("SELECT chat FROM games WHERE id = $1", [gameId]);
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      let chatMessages: any[] = [];
      if (result.rows[0].chat) { try { chatMessages = JSON.parse(result.rows[0].chat); } catch {} }
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      chatMessages.push({ id: `msg-${Date.now()}`, sender: body.sender || user.name, text: body.text, time: now });
      await pool.query(`UPDATE games SET chat = $1 WHERE id = $2`, [JSON.stringify(chatMessages), gameId]);
      return json({ chat: chatMessages });
    }

    // POST /api/games/{gameId}/resign
    if (path[0] === "games" && path.length === 3 && path[2] === "resign") {
      const gameId = path[1];
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [gameId]);
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = result.rows[0];
      const resignedAsWhite = g.white_player_id === user.id;
      const newStatus = resignedAsWhite ? "black_won" : "white_won";
      await pool.query(`UPDATE games SET status = $1 WHERE id = $2`, [newStatus, gameId]);
      return json({ id: gameId, status: newStatus });
    }

    // POST /api/games/{gameId}/timeout
    if (path[0] === "games" && path.length === 3 && path[2] === "timeout") {
      const gameId = path[1];
      const result = await pool.query("SELECT * FROM games WHERE id = $1", [gameId]);
      if (result.rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = result.rows[0];
      if (g.status !== "active") return json({ id: g.id, status: g.status });
      const loserColor = body.loser_color || "w";
      const newStatus = loserColor === "w" ? "black_won" : "white_won";
      await pool.query(`UPDATE games SET status = $1 WHERE id = $2`, [newStatus, gameId]);
      try {
        if (newStatus === "black_won") {
          await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [g.black_player_id]);
          await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [g.white_player_id]);
        } else {
          await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [g.white_player_id]);
          await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [g.black_player_id]);
        }
      } catch {}
      return json({ id: g.id, status: newStatus });
    }

    // POST /api/wallet/create_order
    if (route === "wallet/create_order") {
      const amount = body.amount || 100;
      const amountPaise = Math.round(amount * 100);
      return json({ order_id: null, amount: amountPaise, currency: "INR", key_id: process.env.RAZORPAY_KEY_ID || "" });
    }

    // POST /api/wallet/verify_payment
    if (route === "wallet/verify_payment") {
      const amount = (body.amount || 0) / 100;
      if (amount > 0) {
        await pool.query(`UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`, [amount, user.id]);
      }
      return json({ status: "success", balance: amount });
    }

    // POST /api/tournaments
    if (route === "tournaments") {
      const tId = genId("tournament");
      await pool.query(
        `INSERT INTO tournaments (id, name, description, game_format, max_participants, prize_pool, entry_fee, organizer_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'upcoming')`,
        [tId, body.name || "Tournament", body.description || "", body.game_format || "Swiss", body.max_participants || 8,
         body.prize_pool || 0, body.entry_fee || 0, user.id]
      );
      return json({ id: tId, status: "upcoming" });
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("API POST error:", e);
    return json({ detail: "Internal server error", error: e.message }, 500);
  }
}

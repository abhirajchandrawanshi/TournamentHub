import { NextRequest, NextResponse } from "next/server";
import { getSQL, ensureSystemUsers, getUserFromAuth } from "@/lib/db-server";

// Edge Runtime = instant cold starts (no Node.js boot)
export const runtime = "edge";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function genId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

// ───── GET handler ─────
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const sql = getSQL();
  const route = path.join("/");

  try {
    // GET /api/auth/me
    if (route === "auth/me") {
      const user = await getUserFromAuth(req.headers.get("authorization"));
      return json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, rating: user.rating, avatar: user.avatar || null, wallet_balance: user.wallet_balance || 0 } });
    }

    // GET /api/games/user/history
    if (route === "games/user/history") {
      const user = await getUserFromAuth(req.headers.get("authorization"));
      const rows = await sql`
        SELECT g.*, wu.name as white_name, wu.rating as white_rating,
               bu.name as black_name, bu.rating as black_rating
        FROM games g
        LEFT JOIN users wu ON g.white_player_id = wu.id
        LEFT JOIN users bu ON g.black_player_id = bu.id
        WHERE g.white_player_id = ${user.id} OR g.black_player_id = ${user.id}
        ORDER BY g.created_at DESC LIMIT 20
      `;
      return json(rows.map((g: any) => {
        const isWhite = g.white_player_id === user.id;
        let result = "Draw";
        if (g.status === "white_won") result = isWhite ? "Victory" : "Defeat";
        else if (g.status === "black_won") result = isWhite ? "Defeat" : "Victory";
        else if (g.status === "active") result = "In Progress";
        return {
          id: g.id, opponent: isWhite ? (g.black_name || "Opponent") : (g.white_name || "Opponent"),
          color: isWhite ? "White" : "Black", result, status: g.status, clock: g.clock_control,
          moves_count: g.moves ? g.moves.split(",").length : 0,
          created_at: g.created_at ? new Date(g.created_at).toISOString().slice(0, 16).replace("T", " ") : "Recently",
        };
      }));
    }

    // GET /api/games/{gameId}
    if (path[0] === "games" && path.length === 2) {
      const gameId = path[1];
      const rows = await sql`
        SELECT g.*, wu.id as w_id, wu.name as w_name, wu.rating as w_rating, wu.avatar as w_avatar,
               bu.id as b_id, bu.name as b_name, bu.rating as b_rating, bu.avatar as b_avatar
        FROM games g
        LEFT JOIN users wu ON g.white_player_id = wu.id
        LEFT JOIN users bu ON g.black_player_id = bu.id
        WHERE g.id = ${gameId}
      `;
      if (rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = rows[0];
      let chat: any[] = [];
      if (g.chat) { try { chat = JSON.parse(g.chat); } catch {} }
      return json({
        id: g.id, tournament_id: g.tournament_id,
        white: { id: g.w_id || "white-player", name: g.w_name || "White Player", rating: g.w_rating || 1500, avatar: g.w_avatar },
        black: { id: g.b_id || "waiting-opponent", name: g.b_name || "Waiting...", rating: g.b_rating || 1500, avatar: g.b_avatar },
        clock_control: g.clock_control, fen: g.fen,
        moves: g.moves ? g.moves.split(",") : [], status: g.status, chat, created_at: g.created_at,
      });
    }

    // GET /api/leaderboard
    if (route === "leaderboard") {
      const rows = await sql`
        SELECT id, name, username, rating, avatar FROM users
        WHERE id NOT IN ('waiting-opponent','ai-opponent','guest-player') AND id NOT LIKE 'guest-%'
        ORDER BY rating DESC LIMIT 50
      `;
      return json(rows);
    }

    // GET /api/tournaments
    if (route === "tournaments") {
      const rows = await sql`SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id ORDER BY t.created_at DESC LIMIT 20`;
      return json(rows);
    }

    // GET /api/tournaments/{id}
    if (path[0] === "tournaments" && path.length === 2) {
      const rows = await sql`SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id WHERE t.id = ${path[1]}`;
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      return json(rows[0]);
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("GET error:", e);
    return json({ detail: e.message }, 500);
  }
}

// ───── POST handler ─────
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const sql = getSQL();
  const route = path.join("/");
  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const user = await getUserFromAuth(req.headers.get("authorization"));
    await ensureSystemUsers();

    // POST /api/games/matchmake
    if (route === "games/matchmake") {
      // 1. Existing waiting game?
      const existing = await sql`
        SELECT * FROM games WHERE status = 'waiting' AND (white_player_id = ${user.id} OR black_player_id = ${user.id}) LIMIT 1
      `;
      if (existing.length > 0) {
        const color = existing[0].white_player_id === user.id ? "w" : "b";
        return json({ id: existing[0].id, status: "waiting", color });
      }

      // 2. Join another's waiting game?
      const waiting = await sql`
        SELECT * FROM games WHERE status = 'waiting' AND white_player_id != ${user.id} AND black_player_id != ${user.id} ORDER BY created_at ASC LIMIT 1
      `;
      if (waiting.length > 0) {
        const g = waiting[0];
        if (g.white_player_id === "waiting-opponent") {
          await sql`UPDATE games SET white_player_id = ${user.id}, status = 'active' WHERE id = ${g.id}`;
          return json({ id: g.id, status: "active", color: "w" });
        } else {
          await sql`UPDATE games SET black_player_id = ${user.id}, status = 'active' WHERE id = ${g.id}`;
          return json({ id: g.id, status: "active", color: "b" });
        }
      }

      // 3. Create new with random color
      const gameId = genId("game");
      const isWhite = Math.random() > 0.5;
      await sql`
        INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status)
        VALUES (${gameId}, ${isWhite ? user.id : "waiting-opponent"}, ${isWhite ? "waiting-opponent" : user.id}, '5+0', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'waiting')
      `;
      return json({ id: gameId, status: "waiting", color: isWhite ? "w" : "b" });
    }

    // POST /api/games/invite
    if (route === "games/invite") {
      const gameId = genId("invite");
      await sql`
        INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status)
        VALUES (${gameId}, ${user.id}, 'waiting-opponent', '5+0', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'waiting')
      `;
      return json({ id: gameId, status: "waiting", color: "w" });
    }

    // POST /api/games
    if (route === "games") {
      const opponentId = body.opponent_id || "ai-opponent";
      const clock = body.clock_control || "5+0";
      const tid = body.tournament_id || null;
      const gameId = genId("game");
      const isW = Math.random() > 0.5;
      await sql`
        INSERT INTO games (id, tournament_id, white_player_id, black_player_id, clock_control, fen, moves, status)
        VALUES (${gameId}, ${tid}, ${isW ? user.id : opponentId}, ${isW ? opponentId : user.id}, ${clock}, 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', '', 'active')
      `;
      return json({ id: gameId, white_player_id: isW ? user.id : opponentId, black_player_id: isW ? opponentId : user.id, status: "active" });
    }

    // POST /api/games/{gameId}/join
    if (path[0] === "games" && path.length === 3 && path[2] === "join") {
      const gid = path[1];
      const rows = await sql`SELECT * FROM games WHERE id = ${gid}`;
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      const g = rows[0];
      if (g.white_player_id === user.id) return json({ id: g.id, color: "w", status: g.status });
      if (g.black_player_id === user.id) return json({ id: g.id, color: "b", status: g.status });
      if (g.black_player_id === "waiting-opponent") {
        await sql`UPDATE games SET black_player_id = ${user.id}, status = 'active' WHERE id = ${gid}`;
        return json({ id: g.id, color: "b", status: "active" });
      }
      if (g.white_player_id === "waiting-opponent") {
        await sql`UPDATE games SET white_player_id = ${user.id}, status = 'active' WHERE id = ${gid}`;
        return json({ id: g.id, color: "w", status: "active" });
      }
      return json({ id: g.id, color: "spectator", status: g.status });
    }

    // POST /api/games/{gameId}/move
    if (path[0] === "games" && path.length === 3 && path[2] === "move") {
      const gid = path[1];
      const { fen, move, status } = body;
      if (move) {
        await sql`
          UPDATE games SET fen = ${fen}, moves = CASE WHEN moves = '' THEN ${move} ELSE moves || ',' || ${move} END,
          status = COALESCE(${status || null}, status) WHERE id = ${gid}
        `;
      } else if (fen) {
        await sql`UPDATE games SET fen = ${fen}, status = COALESCE(${status || null}, status) WHERE id = ${gid}`;
      }
      // Handle rating on checkmate
      if (status === "white_won" || status === "black_won") {
        const rows = await sql`SELECT white_player_id, black_player_id FROM games WHERE id = ${gid}`;
        if (rows.length > 0) {
          const winner = status === "white_won" ? rows[0].white_player_id : rows[0].black_player_id;
          const loser = status === "white_won" ? rows[0].black_player_id : rows[0].white_player_id;
          await sql`UPDATE users SET rating = rating + 15 WHERE id = ${winner}`;
          await sql`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = ${loser}`;
        }
      }
      return json({ id: gid, status: status || "active" });
    }

    // POST /api/games/{gameId}/chat
    if (path[0] === "games" && path.length === 3 && path[2] === "chat") {
      const gid = path[1];
      const rows = await sql`SELECT chat FROM games WHERE id = ${gid}`;
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      let msgs: any[] = [];
      if (rows[0].chat) { try { msgs = JSON.parse(rows[0].chat); } catch {} }
      msgs.push({ id: `msg-${Date.now()}`, sender: body.sender || user.name, text: body.text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      await sql`UPDATE games SET chat = ${JSON.stringify(msgs)} WHERE id = ${gid}`;
      return json({ chat: msgs });
    }

    // POST /api/games/{gameId}/resign
    if (path[0] === "games" && path.length === 3 && path[2] === "resign") {
      const gid = path[1];
      const rows = await sql`SELECT * FROM games WHERE id = ${gid}`;
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      const newStatus = rows[0].white_player_id === user.id ? "black_won" : "white_won";
      await sql`UPDATE games SET status = ${newStatus} WHERE id = ${gid}`;
      return json({ id: gid, status: newStatus });
    }

    // POST /api/games/{gameId}/timeout
    if (path[0] === "games" && path.length === 3 && path[2] === "timeout") {
      const gid = path[1];
      const rows = await sql`SELECT * FROM games WHERE id = ${gid}`;
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      if (rows[0].status !== "active") return json({ id: gid, status: rows[0].status });
      const newStatus = (body.loser_color || "w") === "w" ? "black_won" : "white_won";
      await sql`UPDATE games SET status = ${newStatus} WHERE id = ${gid}`;
      const winner = newStatus === "white_won" ? rows[0].white_player_id : rows[0].black_player_id;
      const loser = newStatus === "white_won" ? rows[0].black_player_id : rows[0].white_player_id;
      try {
        await sql`UPDATE users SET rating = rating + 15 WHERE id = ${winner}`;
        await sql`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = ${loser}`;
      } catch {}
      return json({ id: gid, status: newStatus });
    }

    // POST /api/wallet/create_order
    if (route === "wallet/create_order") {
      return json({ order_id: null, amount: Math.round((body.amount || 100) * 100), currency: "INR", key_id: process.env.RAZORPAY_KEY_ID || "" });
    }

    // POST /api/wallet/verify_payment
    if (route === "wallet/verify_payment") {
      const amt = (body.amount || 0) / 100;
      if (amt > 0) await sql`UPDATE users SET wallet_balance = wallet_balance + ${amt} WHERE id = ${user.id}`;
      return json({ status: "success", balance: amt });
    }

    // POST /api/tournaments
    if (route === "tournaments") {
      const tId = genId("tournament");
      await sql`
        INSERT INTO tournaments (id, name, description, game_format, max_participants, prize_pool, entry_fee, organizer_id, status)
        VALUES (${tId}, ${body.name || "Tournament"}, ${body.description || ""}, ${body.game_format || "Swiss"}, ${body.max_participants || 8}, ${body.prize_pool || 0}, ${body.entry_fee || 0}, ${user.id}, 'upcoming')
      `;
      return json({ id: tId, status: "upcoming" });
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("POST error:", e);
    return json({ detail: e.message }, 500);
  }
}

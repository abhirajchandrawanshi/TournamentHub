import { NextRequest, NextResponse } from "next/server";
import { getPool, ensureSystemUsers, getUserFromAuth } from "@/lib/db-server";
import crypto from "crypto";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function genId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 12)}`;
}

// ───── GET ─────
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pool = getPool();
  const route = path.join("/");

  try {
    if (route === "auth/me") {
      const user = await getUserFromAuth(req.headers.get("authorization"));
      return json({ user: { id: user.id, name: user.name, email: user.email, username: user.username, rating: user.rating, avatar: user.avatar || null, wallet_balance: user.wallet_balance || 0 } });
    }

    if (route === "games/user/history") {
      const user = await getUserFromAuth(req.headers.get("authorization"));
      const { rows } = await pool.query(
        `SELECT g.*, wu.name as white_name, wu.rating as white_rating, bu.name as black_name, bu.rating as black_rating
         FROM games g LEFT JOIN users wu ON g.white_player_id = wu.id LEFT JOIN users bu ON g.black_player_id = bu.id
         WHERE g.white_player_id = $1 OR g.black_player_id = $1 ORDER BY g.created_at DESC LIMIT 20`, [user.id]
      );
      return json(rows.map((g: any) => {
        const isW = g.white_player_id === user.id;
        let result = "Draw";
        if (g.status === "white_won") result = isW ? "Victory" : "Defeat";
        else if (g.status === "black_won") result = isW ? "Defeat" : "Victory";
        else if (g.status === "active") result = "In Progress";
        return { id: g.id, opponent: isW ? (g.black_name || "Opponent") : (g.white_name || "Opponent"), color: isW ? "White" : "Black", result, status: g.status, clock: g.clock_control, moves_count: g.moves ? g.moves.split(",").length : 0, created_at: g.created_at ? new Date(g.created_at).toISOString().slice(0, 16).replace("T", " ") : "Recently" };
      }));
    }

    if (path[0] === "games" && path.length === 2) {
      const { rows } = await pool.query(
        `SELECT g.*, wu.id as w_id, wu.name as w_name, wu.rating as w_rating, wu.avatar as w_avatar,
                bu.id as b_id, bu.name as b_name, bu.rating as b_rating, bu.avatar as b_avatar
         FROM games g LEFT JOIN users wu ON g.white_player_id = wu.id LEFT JOIN users bu ON g.black_player_id = bu.id
         WHERE g.id = $1`, [path[1]]
      );
      if (rows.length === 0) return json({ detail: "Game not found" }, 404);
      const g = rows[0];
      let chat: any[] = [];
      if (g.chat) { try { chat = JSON.parse(g.chat); } catch {} }
      return json({
        id: g.id, tournament_id: g.tournament_id,
        white: { id: g.w_id || "white-player", name: g.w_name || "White Player", rating: g.w_rating || 1500, avatar: g.w_avatar },
        black: { id: g.b_id || "waiting-opponent", name: g.b_name || "Waiting...", rating: g.b_rating || 1500, avatar: g.b_avatar },
        clock_control: g.clock_control, fen: g.fen, moves: g.moves ? g.moves.split(",") : [], status: g.status, chat, created_at: g.created_at,
      });
    }

    if (route === "leaderboard") {
      const { rows } = await pool.query(
        `SELECT id, name, username, rating, avatar FROM users WHERE id NOT IN ('waiting-opponent','ai-opponent','guest-player') AND id NOT LIKE 'guest-%' ORDER BY rating DESC LIMIT 50`
      );
      return json(rows);
    }

    if (route === "tournaments") {
      const { rows } = await pool.query(`SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id ORDER BY t.created_at DESC LIMIT 20`);
      return json(rows);
    }

    if (path[0] === "tournaments" && path.length === 2) {
      const { rows } = await pool.query(`SELECT t.*, u.name as organizer_name FROM tournaments t LEFT JOIN users u ON t.organizer_id = u.id WHERE t.id = $1`, [path[1]]);
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      return json(rows[0]);
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("GET error:", e);
    return json({ detail: e.message }, 500);
  }
}

// ───── POST ─────
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pool = getPool();
  const route = path.join("/");
  let body: any = {};
  try { body = await req.json(); } catch {}

  try {
    const user = await getUserFromAuth(req.headers.get("authorization"));
    await ensureSystemUsers();

    if (route === "games/matchmake") {
      const { rows: existing } = await pool.query(
        `SELECT * FROM games WHERE status = 'waiting' AND (white_player_id = $1 OR black_player_id = $1) LIMIT 1`, [user.id]
      );
      if (existing.length > 0) {
        return json({ id: existing[0].id, status: "waiting", color: existing[0].white_player_id === user.id ? "w" : "b" });
      }

      const { rows: waiting } = await pool.query(
        `SELECT * FROM games WHERE status = 'waiting' AND white_player_id != $1 AND black_player_id != $1 ORDER BY created_at ASC LIMIT 1`, [user.id]
      );
      if (waiting.length > 0) {
        const g = waiting[0];
        if (g.white_player_id === "waiting-opponent") {
          await pool.query(`UPDATE games SET white_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
          return json({ id: g.id, status: "active", color: "w" });
        } else {
          await pool.query(`UPDATE games SET black_player_id = $1, status = 'active' WHERE id = $2`, [user.id, g.id]);
          return json({ id: g.id, status: "active", color: "b" });
        }
      }

      const gameId = genId("game");
      const isW = Math.random() > 0.5;
      await pool.query(
        `INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status) VALUES ($1,$2,$3,'5+0','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1','','waiting')`,
        [gameId, isW ? user.id : "waiting-opponent", isW ? "waiting-opponent" : user.id]
      );
      return json({ id: gameId, status: "waiting", color: isW ? "w" : "b" });
    }

    if (route === "games/invite") {
      const gameId = genId("invite");
      await pool.query(
        `INSERT INTO games (id, white_player_id, black_player_id, clock_control, fen, moves, status) VALUES ($1,$2,'waiting-opponent','5+0','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1','','waiting')`,
        [gameId, user.id]
      );
      return json({ id: gameId, status: "waiting", color: "w" });
    }

    if (route === "games") {
      const opp = body.opponent_id || "ai-opponent";
      const clock = body.clock_control || "5+0";
      const tid = body.tournament_id || null;
      const gameId = genId("game");
      const isW = Math.random() > 0.5;
      await pool.query(
        `INSERT INTO games (id,tournament_id,white_player_id,black_player_id,clock_control,fen,moves,status) VALUES ($1,$2,$3,$4,$5,'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1','','active')`,
        [gameId, tid, isW ? user.id : opp, isW ? opp : user.id, clock]
      );
      return json({ id: gameId, white_player_id: isW ? user.id : opp, black_player_id: isW ? opp : user.id, status: "active" });
    }

    if (path[0] === "games" && path.length === 3 && path[2] === "join") {
      const gid = path[1];
      const { rows } = await pool.query(`SELECT * FROM games WHERE id = $1`, [gid]);
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      const g = rows[0];
      if (g.white_player_id === user.id) return json({ id: g.id, color: "w", status: g.status });
      if (g.black_player_id === user.id) return json({ id: g.id, color: "b", status: g.status });
      if (g.black_player_id === "waiting-opponent") {
        await pool.query(`UPDATE games SET black_player_id = $1, status = 'active' WHERE id = $2`, [user.id, gid]);
        return json({ id: g.id, color: "b", status: "active" });
      }
      if (g.white_player_id === "waiting-opponent") {
        await pool.query(`UPDATE games SET white_player_id = $1, status = 'active' WHERE id = $2`, [user.id, gid]);
        return json({ id: g.id, color: "w", status: "active" });
      }
      return json({ id: g.id, color: "spectator", status: g.status });
    }

    if (path[0] === "games" && path.length === 3 && path[2] === "move") {
      const gid = path[1];
      const { fen, move, status } = body;
      if (move) {
        await pool.query(
          `UPDATE games SET fen = $1, moves = CASE WHEN moves = '' THEN $2 ELSE moves || ',' || $2 END, status = COALESCE($3, status) WHERE id = $4`,
          [fen, move, status || null, gid]
        );
      } else if (fen) {
        await pool.query(`UPDATE games SET fen = $1, status = COALESCE($2, status) WHERE id = $3`, [fen, status || null, gid]);
      }
      if (status === "white_won" || status === "black_won") {
        const { rows } = await pool.query(`SELECT white_player_id, black_player_id FROM games WHERE id = $1`, [gid]);
        if (rows.length > 0) {
          const w = status === "white_won" ? rows[0].white_player_id : rows[0].black_player_id;
          const l = status === "white_won" ? rows[0].black_player_id : rows[0].white_player_id;
          await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [w]);
          await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [l]);
        }
      }
      return json({ id: gid, status: status || "active" });
    }

    if (path[0] === "games" && path.length === 3 && path[2] === "chat") {
      const gid = path[1];
      const { rows } = await pool.query(`SELECT chat FROM games WHERE id = $1`, [gid]);
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      let msgs: any[] = [];
      if (rows[0].chat) { try { msgs = JSON.parse(rows[0].chat); } catch {} }
      msgs.push({ id: `msg-${Date.now()}`, sender: body.sender || user.name, text: body.text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      await pool.query(`UPDATE games SET chat = $1 WHERE id = $2`, [JSON.stringify(msgs), gid]);
      return json({ chat: msgs });
    }

    if (path[0] === "games" && path.length === 3 && path[2] === "resign") {
      const gid = path[1];
      const { rows } = await pool.query(`SELECT * FROM games WHERE id = $1`, [gid]);
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      const ns = rows[0].white_player_id === user.id ? "black_won" : "white_won";
      await pool.query(`UPDATE games SET status = $1 WHERE id = $2`, [ns, gid]);
      return json({ id: gid, status: ns });
    }

    if (path[0] === "games" && path.length === 3 && path[2] === "timeout") {
      const gid = path[1];
      const { rows } = await pool.query(`SELECT * FROM games WHERE id = $1`, [gid]);
      if (rows.length === 0) return json({ detail: "Not found" }, 404);
      if (rows[0].status !== "active") return json({ id: gid, status: rows[0].status });
      const ns = (body.loser_color || "w") === "w" ? "black_won" : "white_won";
      await pool.query(`UPDATE games SET status = $1 WHERE id = $2`, [ns, gid]);
      try {
        const w = ns === "white_won" ? rows[0].white_player_id : rows[0].black_player_id;
        const l = ns === "white_won" ? rows[0].black_player_id : rows[0].white_player_id;
        await pool.query(`UPDATE users SET rating = rating + 15 WHERE id = $1`, [w]);
        await pool.query(`UPDATE users SET rating = GREATEST(100, rating - 15) WHERE id = $1`, [l]);
      } catch {}
      return json({ id: gid, status: ns });
    }

    if (route === "wallet/create_order") {
      return json({ order_id: null, amount: Math.round((body.amount || 100) * 100), currency: "INR", key_id: process.env.RAZORPAY_KEY_ID || "" });
    }

    if (route === "wallet/verify_payment") {
      const amt = (body.amount || 0) / 100;
      if (amt > 0) await pool.query(`UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`, [amt, user.id]);
      return json({ status: "success", balance: amt });
    }

    if (route === "tournaments") {
      const tId = genId("tournament");
      await pool.query(
        `INSERT INTO tournaments (id,name,description,game_format,max_participants,prize_pool,entry_fee,organizer_id,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'upcoming')`,
        [tId, body.name || "Tournament", body.description || "", body.game_format || "Swiss", body.max_participants || 8, body.prize_pool || 0, body.entry_fee || 0, user.id]
      );
      return json({ id: tId, status: "upcoming" });
    }

    return json({ detail: "Not found" }, 404);
  } catch (e: any) {
    console.error("POST error:", e);
    return json({ detail: e.message }, 500);
  }
}

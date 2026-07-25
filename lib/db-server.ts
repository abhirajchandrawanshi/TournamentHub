import { Pool } from "pg";

// Cached pool across warm invocations (avoids re-creating per request)
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

// Cache flag — only ensure system users once per warm instance
let systemUsersEnsured = false;

export async function ensureSystemUsers() {
  if (systemUsersEnsured) return;
  const p = getPool();
  try {
    await p.query(`
      INSERT INTO users (id, name, email, username, rating) VALUES
        ('waiting-opponent', 'Searching for Opponent...', 'waiting-opponent@chessarena.ai', 'waiting_opponent_sys', 1500),
        ('ai-opponent', 'GM_Arjun_Mehta (AI)', 'ai-opponent@chessarena.ai', 'ai_opponent_sys', 2400)
      ON CONFLICT (id) DO NOTHING
    `);
    systemUsersEnsured = true;
  } catch {
    // If email/username conflicts, try individually
    for (const u of [
      { id: "waiting-opponent", name: "Searching for Opponent...", rating: 1500 },
      { id: "ai-opponent", name: "GM_Arjun_Mehta (AI)", rating: 2400 },
    ]) {
      try {
        const s = Date.now().toString(36);
        await p.query(
          `INSERT INTO users (id, name, email, username, rating) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, `${u.id}-${s}@chessarena.ai`, `${u.id}_${s}`, u.rating]
        );
      } catch {}
    }
    systemUsersEnsured = true;
  }
}

export async function getUserFromAuth(authHeader: string | null) {
  const p = getPool();

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(Buffer.from(padded, "base64").toString());
        const uid = payload.user_id || payload.sub;
        if (uid) {
          const email = payload.email || `${uid.slice(0, 8)}@chessarena.ai`;
          const name = payload.name || email.split("@")[0];
          const username = email.split("@")[0] + "_" + uid.slice(0, 4);

          // Single upsert + return
          const { rows } = await p.query(
            `INSERT INTO users (id, name, email, username, rating)
             VALUES ($1, $2, $3, $4, 1200)
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
             RETURNING *`,
            [uid, name, email, username]
          );
          if (rows.length > 0) return rows[0];
        }
      }
    } catch (e) {
      console.error("Auth decode:", e);
    }
  }

  // Guest fallback — single query
  const guestId = `guest-${crypto.randomUUID().slice(0, 8)}`;
  try {
    const { rows } = await p.query(
      `INSERT INTO users (id, name, email, username, rating)
       VALUES ($1, $2, $3, $4, 1200)
       ON CONFLICT (id) DO NOTHING RETURNING *`,
      [guestId, `Guest_${guestId.slice(-4)}`, `${guestId}@chessarena.ai`, guestId]
    );
    if (rows.length > 0) return rows[0];
  } catch {}

  return { id: guestId, name: "Guest", email: "guest@chessarena.ai", username: "guest", rating: 1200 };
}

export { getPool };

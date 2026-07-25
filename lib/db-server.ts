import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("neon") || connectionString.includes("supabase")
        ? { rejectUnauthorized: false }
        : undefined,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function ensureSystemUsers(pool: Pool) {
  const systemUsers = [
    { id: "waiting-opponent", name: "Searching for Opponent...", email: "waiting-opponent@chessarena.ai", username: "waiting_opponent_sys", rating: 1500 },
    { id: "ai-opponent", name: "GM_Arjun_Mehta (AI)", email: "ai-opponent@chessarena.ai", username: "ai_opponent_sys", rating: 2400 },
  ];

  for (const u of systemUsers) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, username, rating)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.name, u.email, u.username, u.rating]
      );
    } catch (e) {
      // Ignore conflicts on email/username
      try {
        const exists = await pool.query("SELECT id FROM users WHERE id = $1", [u.id]);
        if (exists.rows.length === 0) {
          // Try with unique email/username
          const uniqueSuffix = Date.now().toString(36);
          await pool.query(
            `INSERT INTO users (id, name, email, username, rating)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [u.id, u.name, `${u.id}-${uniqueSuffix}@chessarena.ai`, `${u.id}_${uniqueSuffix}`, u.rating]
          );
        }
      } catch (e2) {
        console.error(`System user ensure error (${u.id}):`, e2);
      }
    }
  }
}

export async function getUserFromAuth(authHeader: string | null, pool: Pool) {
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      // Decode Firebase JWT payload (base64url) to extract user info
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const payload = JSON.parse(
          Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
        );
        const uid = payload.user_id || payload.sub;
        const email = payload.email || `${uid?.slice(0, 8)}@chessarena.ai`;
        const name = payload.name || email.split("@")[0];

        if (uid) {
          // Find or create user
          let result = await pool.query("SELECT * FROM users WHERE id = $1", [uid]);
          if (result.rows.length === 0) {
            const username = email.split("@")[0] + "_" + uid.slice(0, 4);
            try {
              await pool.query(
                `INSERT INTO users (id, name, email, username, rating)
                 VALUES ($1, $2, $3, $4, 1200)
                 ON CONFLICT (id) DO NOTHING`,
                [uid, name, email, username]
              );
            } catch {
              // email or username conflict — try with unique suffix
              const suffix = Date.now().toString(36);
              await pool.query(
                `INSERT INTO users (id, name, email, username, rating)
                 VALUES ($1, $2, $3, $4, 1200)
                 ON CONFLICT (id) DO NOTHING`,
                [uid, name, `${uid}@chessarena.ai`, `user_${suffix}`]
              ).catch(() => {});
            }
            result = await pool.query("SELECT * FROM users WHERE id = $1", [uid]);
          }
          if (result.rows.length > 0) return result.rows[0];
        }
      }
    } catch (e) {
      console.error("Token decode error:", e);
    }
  }

  // Guest fallback
  const guestId = `guest-${crypto.randomUUID().slice(0, 8)}`;
  try {
    await pool.query(
      `INSERT INTO users (id, name, email, username, rating)
       VALUES ($1, $2, $3, $4, 1200)
       ON CONFLICT (id) DO NOTHING`,
      [guestId, `Guest_${guestId.slice(-4)}`, `${guestId}@chessarena.ai`, guestId]
    );
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [guestId]);
    if (result.rows.length > 0) return result.rows[0];
  } catch {
    // Final fallback
  }

  return { id: "guest-fallback", name: "Guest", email: "guest@chessarena.ai", username: "guest", rating: 1200 };
}

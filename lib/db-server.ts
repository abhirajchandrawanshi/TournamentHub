import { neon } from "@neondatabase/serverless";

// Neon's HTTP driver — zero TCP connection overhead, instant queries
function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// Cache flag so we only ensure system users once per cold start
let systemUsersEnsured = false;

export async function ensureSystemUsers() {
  if (systemUsersEnsured) return;
  const sql = getSQL();
  try {
    await sql`
      INSERT INTO users (id, name, email, username, rating)
      VALUES 
        ('waiting-opponent', 'Searching for Opponent...', 'waiting-opponent@chessarena.ai', 'waiting_opponent_sys', 1500),
        ('ai-opponent', 'GM_Arjun_Mehta (AI)', 'ai-opponent@chessarena.ai', 'ai_opponent_sys', 2400)
      ON CONFLICT (id) DO NOTHING
    `;
    systemUsersEnsured = true;
  } catch (e) {
    // If email/username conflicts, try individually with unique suffixes
    for (const u of [
      { id: "waiting-opponent", name: "Searching for Opponent...", rating: 1500 },
      { id: "ai-opponent", name: "GM_Arjun_Mehta (AI)", rating: 2400 },
    ]) {
      try {
        const s = Date.now().toString(36);
        await sql`
          INSERT INTO users (id, name, email, username, rating)
          VALUES (${u.id}, ${u.name}, ${u.id + '-' + s + '@chessarena.ai'}, ${u.id + '_' + s}, ${u.rating})
          ON CONFLICT (id) DO NOTHING
        `;
      } catch {}
    }
    systemUsersEnsured = true;
  }
}

export async function getUserFromAuth(authHeader: string | null) {
  const sql = getSQL();

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const payloadB64 = token.split(".")[1];
      if (payloadB64) {
        const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(padded));
        const uid = payload.user_id || payload.sub;
        if (uid) {
          const email = payload.email || `${uid.slice(0, 8)}@chessarena.ai`;
          const name = payload.name || email.split("@")[0];
          const username = email.split("@")[0] + "_" + uid.slice(0, 4);

          // Single upsert + return in one query
          const rows = await sql`
            INSERT INTO users (id, name, email, username, rating)
            VALUES (${uid}, ${name}, ${email}, ${username}, 1200)
            ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
            RETURNING *
          `;
          if (rows.length > 0) return rows[0];

          // Fallback: just select
          const existing = await sql`SELECT * FROM users WHERE id = ${uid}`;
          if (existing.length > 0) return existing[0];
        }
      }
    } catch (e) {
      console.error("Auth decode:", e);
    }
  }

  // Guest fallback — single query
  const guestId = `guest-${crypto.randomUUID().slice(0, 8)}`;
  try {
    const rows = await sql`
      INSERT INTO users (id, name, email, username, rating)
      VALUES (${guestId}, ${"Guest_" + guestId.slice(-4)}, ${guestId + "@chessarena.ai"}, ${guestId}, 1200)
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `;
    if (rows.length > 0) return rows[0];
  } catch {}

  return { id: guestId, name: "Guest", email: "guest@chessarena.ai", username: "guest", rating: 1200 };
}

export { getSQL };

import { cookies } from "next/headers";
import { getDb } from "./db";

const SESSION_COOKIE = "flux_session";

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.first_name, u.last_name, u.profile_image_url
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.sid = ${sessionId} AND s.expire > NOW()
  `;

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    profileImageUrl: row.profile_image_url,
  };
}

export async function createSession(userId: string): Promise<string> {
  const sql = getDb();
  const sessionId = crypto.randomUUID();
  const expire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await sql`
    INSERT INTO sessions (sid, user_id, expire)
    VALUES (${sessionId}, ${userId}, ${expire.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return sessionId;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    const sql = getDb();
    await sql`DELETE FROM sessions WHERE sid = ${sessionId}`;
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

import { query } from './db';
import { UserIdentity } from '@/types/architecture';

export async function upsertUserIdentity(firebaseUid: string, email: string): Promise<UserIdentity | null> {
  try {
    const res = await query(
      `INSERT INTO users (firebase_uid, email)
       VALUES ($1, $2)
       ON CONFLICT (firebase_uid)
       DO UPDATE SET email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [firebaseUid, email]
    );
    return res.rows[0] as UserIdentity;
  } catch (err) {
    console.error('Failed to upsert user identity', err);
    return null;
  }
}

export async function getUserIdentity(firebaseUid: string): Promise<UserIdentity | null> {
  try {
    const res = await query(`SELECT * FROM users WHERE firebase_uid = $1`, [firebaseUid]);
    return res.rows[0] as UserIdentity || null;
  } catch (err) {
    console.error('Failed to fetch user identity', err);
    return null;
  }
}

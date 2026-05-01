import { query } from './db';

/**
 * Zero-Orphan Policy: Recursively checks for telemetry entries
 * that are no longer actively indexed or linked to valid users.
 * Instead of hard deletion, flags them as archived to preserve
 * historical system integrity.
 */
export async function executeZeroOrphanPolicy(): Promise<number> {
  try {
    const res = await query(`
      UPDATE telemetry
      SET is_archived = TRUE
      WHERE is_archived = FALSE
      AND (
        user_id IS NULL OR
        user_id NOT IN (SELECT id FROM users)
      )
      RETURNING id;
    `);

    if (res.rowCount && res.rowCount > 0) {
      console.log(`[Zero-Orphan Policy] Archived ${res.rowCount} orphan telemetry bytes.`);
    }

    return res.rowCount || 0;
  } catch (err) {
    console.error('[Zero-Orphan Policy] Failed to execute cleanup worker', err);
    return 0;
  }
}

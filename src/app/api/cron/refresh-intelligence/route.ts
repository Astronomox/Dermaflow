import { NextResponse } from 'next/server';
import { refreshMaterializedView } from '@/lib/materialized-view';
import { query } from '@/lib/db';
import { executeZeroOrphanPolicy } from '@/lib/zero-orphan-policy';

export async function GET(request: Request) {
  try {
    // 1. Refresh primary telemetry stats
    await refreshMaterializedView();

    // 2. Refresh intelligence blocks (which depend on telemetry stats)
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY predictive_intelligence_blocks;');

    // 3. Run the Zero-Orphan cleanup worker
    const archivedCount = await executeZeroOrphanPolicy();

    return NextResponse.json({
      status: 'success',
      message: 'Intelligence blocks refreshed and zero-orphan policy executed',
      archived_orphans: archivedCount
    }, { status: 200 });

  } catch (error: any) {
    console.error('CRON Refresh Intelligence Failed', error);
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 });
  }
}

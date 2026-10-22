import { stockRefreshAuthError } from '@/lib/stock-refresh-auth.mjs';
import { NextResponse } from 'next/server';
import { saveBernatStock } from '@/lib/bernat-stock';

export async function POST(request: Request) {
  const authError = stockRefreshAuthError(request.headers.get('authorization'), process.env, 'BERNAT_STOCK_SECRET');
  if (authError) return NextResponse.json({ error: authError === 503 ? 'Stock updates are not configured' : 'Unauthorized' }, { status: authError });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 }); }
  try {
    await saveBernatStock(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Bernat stock update rejected', error);
    return NextResponse.json({ error: 'Stock could not be saved' }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

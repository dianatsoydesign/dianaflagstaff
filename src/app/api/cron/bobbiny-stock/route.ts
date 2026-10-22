import { NextResponse } from 'next/server';
import { saveBobbinyStock } from '@/lib/bobbiny-stock';

export async function POST(request: Request) {
  const secret = process.env.BOBBINY_STOCK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Stock updates are not configured' }, { status: 503 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 }); }
  try {
    await saveBobbinyStock(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Bobbiny stock update rejected', error);
    return NextResponse.json({ error: 'Stock could not be saved' }, { status: 400 });
  }
}

export const dynamic = 'force-dynamic';

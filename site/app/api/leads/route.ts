import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(()=>({}));
  // In production, send email to provider and store lead in DB.
  console.log('Lead', body);
  return NextResponse.json({ ok: true })
}


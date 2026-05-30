import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  if (!/^[a-zA-Z0-9_-]{6,32}$/.test(code)) {
    return NextResponse.redirect(new URL('/sign-up', req.nextUrl.origin))
  }
  const res = NextResponse.redirect(new URL('/sign-up', req.nextUrl.origin))
  res.cookies.set('dtref', code, { maxAge: 60 * 60 * 24 * 7, path: '/', sameSite: 'lax' })
  return res
}

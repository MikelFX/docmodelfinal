import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const assetlinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'com.docthink.app',
      sha256_cert_fingerprints: [
        '84:EB:6A:A1:E8:B4:08:45:D4:EA:77:C3:44:41:49:E9:EF:B2:5C:AD:73:5A:3A:E1:F2:5A:EE:69:AB:A6:48:88',
        '68:56:17:E9:8E:61:39:73:D6:58:3C:B0:8C:91:86:F3:E8:A3:DE:EE:91:9F:09:0B:6F:22:84:D9:30:99:67:F3',
      ],
    },
  },
]

const isPublicRoute = createRouteMatcher([
  '/',
  '/app',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/koupit(.*)',
  '/api/docguard(.*)',
  '/api/stripe/webhook(.*)',
  '/api/stripe/verify(.*)',
  '/manifest.json',
  '/sw.js',
  '/icon(.*)',
])

export default clerkMiddleware(async (auth, request: NextRequest) => {
  if (request.nextUrl.pathname === '/.well-known/assetlinks.json') {
    return new NextResponse(JSON.stringify(assetlinks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

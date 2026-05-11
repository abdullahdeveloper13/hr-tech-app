import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disabled to fix login issues
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match only dashboard and API routes
     */
    '/dashboard/:path*',
    '/api/:path*',
  ],
} 

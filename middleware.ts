import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/signin',
    '/auth/signup',
    '/',
  ]

  // API routes for authentication
  const authApiRoutes = [
    '/api/auth',
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route)
  const isAuthApiRoute = authApiRoutes.some(route => pathname.startsWith(route))

  // Allow public routes and auth API routes
  if (isPublicRoute || isAuthApiRoute) {
    return NextResponse.next()
  }

  // Get the token to check if user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
  })

  // If not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated, allow the request
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

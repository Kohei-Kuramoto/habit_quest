import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isLoginPage      = pathname.startsWith('/login')
  const isOnboardingPage = pathname.startsWith('/onboarding')
  const isApiRoute       = pathname.startsWith('/api')

  // APIルートはそのまま通す
  if (isApiRoute) return

  // 未ログインでログインページ以外にアクセスした場合
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // ログイン済みでログインページにアクセスした場合
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
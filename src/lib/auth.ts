import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, profileUrl: user.image },
        create: {
          email: user.email,
          name: user.name,
          profileUrl: user.image,
        },
      })
      return true
    },

    // JWTにユーザー情報を保存する（DBを使わない）
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
      }
      return token
    },

    // JWTからセッションを作る（DBを使わない）
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email as string
      }
      return session
    },
  },
})
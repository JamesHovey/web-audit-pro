import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username and password required')
        }

        // Normalize username for case-insensitive login
        const normalizedUsername = credentials.username.toLowerCase()

        // Find user by normalized username (all usernames stored as lowercase)
        const user = await prisma.user.findUnique({
          where: {
            username: normalizedUsername
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only set user data on initial sign in
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).username = token.username as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-in-production',
}
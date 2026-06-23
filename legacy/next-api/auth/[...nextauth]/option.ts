import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import { verifyPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password

        if (!email || !password) {
          console.error("Missing email or password")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { employee: true },
          })

          if (!user) {
            console.error(`User not found: ${email}`)
            return null
          }

          const isPasswordCorrect = await verifyPassword(password, user.password)
          if (!isPasswordCorrect) {
            console.error(`Invalid password for user: ${email}`)
            return null
          }

          console.log(`User authorized: ${email}`)

          // Return user object - convert id to string
          return {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
            employee: user.employee ?? null,
          } as any
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store user info in token
        token.id = user.id
        token.role = (user as any).role
        token.employee = (user as any).employee
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        // Transfer token data to session
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).employee = token.employee
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to /dashboard after successful login
      // Allow relative URLs like /dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Only allow redirect to same origin
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
}
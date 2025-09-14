import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email ve şifre gerekli")
        }

        // Demo mode - bypass database for demo credentials
        if (credentials.email === "admin@afitek.com" && credentials.password === "admin123") {
          return {
            id: "demo-admin-id",
            email: "admin@afitek.com",
            name: "Admin User",
            role: "ADMIN",
            tenantId: "demo-tenant",
            tenantName: "Afitek Demo",
          }
        }

        // Try database connection for real users
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { tenant: true },
          })

          if (!user || !user.password) {
            throw new Error("Kullanıcı bulunamadı")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Hatalı şifre")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            tenantName: user.tenant.name,
          }
        } catch (error) {
          console.error("Database error, but demo mode is available:", error)
          throw new Error("Giriş başarısız. Demo hesabı: admin@afitek.com / admin123")
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.tenantName = (user as any).tenantName
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
        (session.user as any).tenantId = token.tenantId as string
        (session.user as any).tenantName = token.tenantName as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}
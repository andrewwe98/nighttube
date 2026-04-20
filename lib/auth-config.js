import bcrypt from "bcryptjs"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

import { createUser, findUserByEmail, updateUser } from "@/lib/user-store"

const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim()
      const password = credentials?.password

      if (!email || !password) {
        return null
      }

      const user = await findUserByEmail(email)

      if (!user?.password) {
        return null
      }

      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image || null,
      }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

export const authConfig = {
  providers,
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        return false
      }

      const existingUser = await findUserByEmail(user.email)

      if (!existingUser) {
        const createdUser = await createUser({
          name: user.name || "Google User",
          email: user.email,
          image: user.image || "",
          provider: account?.provider || "google",
          savedVideos: [],
        })
        user.id = createdUser.id
      } else if (account?.provider === "google") {
        const updatedUser = await updateUser({
          email: user.email,
          name: user.name || existingUser.name,
          image: user.image || existingUser.image,
          provider: "google",
        })
        user.id = updatedUser?.id || existingUser.id
      } else {
        user.id = existingUser.id
      }

      return true
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
      }

      if (!token.id && token.email) {
        const dbUser = await findUserByEmail(token.email)

        if (dbUser?.id) {
          token.id = dbUser.id
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
      }

      return session
    },
  },
}

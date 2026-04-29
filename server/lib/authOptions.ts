import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: `${process.env.FRONTEND_URL || "http://localhost:8080"}/admin/login`,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        // Use secure cookies in non-development environments. Browsers require
        // Secure when SameSite=None. Keep Lax for development for local testing.
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
        secure: process.env.NODE_ENV !== 'development',
        path: "/",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.hashedPassword) return null;

        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.id;
        session.user.role = (token.role as string) || session.user.role;
      }
      return session;
    },
    async redirect() {
      return `${process.env.FRONTEND_URL || "http://localhost:8080"}/admin`;
    },
  },
};

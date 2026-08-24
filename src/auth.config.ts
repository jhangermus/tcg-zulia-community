import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = auth?.user?.role === "ADMIN" || auth?.user?.role === "SUPER_ADMIN";
      const isOnAdminPage = nextUrl.pathname.startsWith("/admin");
      const isOnLoginPage = nextUrl.pathname === "/admin/login";

      if (isOnAdminPage) {
        if (isOnLoginPage) return true; // Allow access to login page always
        if (isLoggedIn) return true; // Logged in users can access admin
        return false; // Redirect to login
      }
      return true; // Allow all public routes
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [], // configured in auth.ts
} satisfies NextAuthConfig;

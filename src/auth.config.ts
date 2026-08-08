import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/login", "/signup"];

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isPublic = PUBLIC_PATHS.some((p) =>
        request.nextUrl.pathname.startsWith(p)
      );
      const isLoggedIn = !!auth?.user;

      if (isPublic) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;

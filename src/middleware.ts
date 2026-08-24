import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect all /admin routes except /admin/login
  matcher: ["/admin/((?!login).*)"],
};

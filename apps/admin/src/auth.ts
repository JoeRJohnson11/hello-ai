/**
 * Auth.js (NextAuth v5) configuration.
 * Google sign-in for admin access.
 */

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/',
  },
  trustHost: true,
});

/** Check if the given email is the configured admin. */
export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) return false;
  return email?.trim().toLowerCase() === adminEmail;
}

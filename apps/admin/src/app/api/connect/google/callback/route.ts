/**
 * Google OAuth callback. Exchanges code for tokens and stores them.
 * Admin only.
 */

import { getTokensFromCode } from '@hello-ai/google-calendar';
import { upsertOAuthToken } from '@hello-ai/data-persistence';
import { NextRequest, NextResponse } from 'next/server';
import { auth, isAdminEmail } from '../../../../../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    console.error('/api/connect/google/callback error:', error);
    return NextResponse.redirect(new URL('/?error=google_denied', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=google_no_code', req.url));
  }

  try {
    const { refreshToken, accessToken, expiresAt } = await getTokensFromCode(code);
    await upsertOAuthToken('google', refreshToken, accessToken, expiresAt);
    return NextResponse.redirect(new URL('/?success=google', req.url));
  } catch (e) {
    console.error('/api/connect/google/callback:', e);
    return NextResponse.redirect(new URL('/?error=google_failed', req.url));
  }
}

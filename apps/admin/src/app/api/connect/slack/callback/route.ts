/**
 * Slack OAuth callback. Exchanges code for tokens and stores them.
 * Also stores slack_user_id in person_facts for presence API.
 * Admin only.
 */

import { getTokensFromCode } from '@hello-ai/slack';
import { upsertOAuthToken, upsertPersonFact } from '@hello-ai/data-persistence';
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
    console.error('/api/connect/slack/callback error:', error);
    return NextResponse.redirect(new URL('/?error=slack_denied', req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=slack_no_code', req.url));
  }

  try {
    const { accessToken, userId } = await getTokensFromCode(code);
    await upsertOAuthToken('slack', accessToken, accessToken, null);
    if (userId) {
      await upsertPersonFact('slack_user_id', userId, 'integrations');
    }
    return NextResponse.redirect(new URL('/?success=slack', req.url));
  } catch (e) {
    console.error('/api/connect/slack/callback:', e);
    return NextResponse.redirect(new URL('/?error=slack_failed', req.url));
  }
}

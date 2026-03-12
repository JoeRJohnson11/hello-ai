/**
 * Initiate Slack OAuth.
 * GET /api/connect/slack → redirects to Slack consent.
 * Admin only.
 */

import { getAuthUrl } from '@hello-ai/slack';
import { NextResponse } from 'next/server';
import { auth, isAdminEmail } from '../../../../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (e) {
    console.error('/api/connect/slack:', e);
    return NextResponse.json(
      { error: 'Slack OAuth not configured. Set SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI.' },
      { status: 500 }
    );
  }
}

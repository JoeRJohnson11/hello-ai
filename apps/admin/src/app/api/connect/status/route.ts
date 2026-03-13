/**
 * GET /api/connect/status — returns connection status for Google and Slack.
 * Admin only.
 */

import { getOAuthToken } from '@hello-ai/data-persistence';
import { NextResponse } from 'next/server';
import { auth, isAdminEmail } from '../../../../auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const [google, slack] = await Promise.all([
    getOAuthToken('google'),
    getOAuthToken('slack'),
  ]);
  return NextResponse.json({
    google: !!google,
    slack: !!slack,
  });
}

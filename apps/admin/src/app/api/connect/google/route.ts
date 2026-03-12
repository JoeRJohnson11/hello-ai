/**
 * Initiate Google OAuth for Calendar.
 * GET /api/connect/google → redirects to Google consent.
 * Admin only.
 */

import { getAuthUrl } from '@hello-ai/google-calendar';
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
    console.error('/api/connect/google:', e);
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI.' },
      { status: 500 }
    );
  }
}

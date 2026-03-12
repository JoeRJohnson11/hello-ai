import Image from 'next/image';
import Link from 'next/link';
import { auth, isAdminEmail } from '../auth';
import { AppHeader, Button } from '@hello-ai/shared-ui';
import { tokens } from '@hello-ai/shared-design';
import { AdminConnectUI } from './AdminConnectUI';
import { SignInButton } from './SignInButton';

const joeBotUrl = process.env.NEXT_PUBLIC_JOE_BOT_URL || 'http://localhost:3010';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main
        className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100"
        style={{ borderRadius: tokens.radius.md }}
      >
        <div className="px-4 py-4">
          <AppHeader appName="admin" />
        </div>
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-4 py-16">
          <Image
            src="/joe-head.png"
            alt="Joe"
            width={64}
            height={64}
            className="rounded-full border border-zinc-800"
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold">Admin</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Sign in with your admin account to connect Calendar and Slack.
            </p>
          </div>
          <SignInButton />
          <Link
            href={joeBotUrl}
            className="text-sm text-zinc-400 underline underline-offset-2 hover:text-zinc-200"
          >
            ← Back to Joe-bot
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main
        className="flex min-h-[100dvh] flex-col bg-zinc-950 text-zinc-100"
        style={{ borderRadius: tokens.radius.md }}
      >
        <div className="px-4 py-4">
          <AppHeader appName="admin" />
        </div>
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-4 py-16">
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/40 px-6 py-4 text-center">
            <h1 className="text-lg font-semibold text-amber-200">You don&apos;t have access</h1>
            <p className="mt-2 text-sm text-amber-200/80">
              This area is for the admin only. You can still use Joe-bot to chat.
            </p>
          </div>
          <Link href={joeBotUrl}>
            <Button variant="secondary" size="sm">
              ← Back to Joe-bot
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return <AdminConnectUI />;
}

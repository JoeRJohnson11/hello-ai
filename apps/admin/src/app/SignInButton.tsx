'use client';

import Link from 'next/link';
import { Button } from '@hello-ai/shared-ui';

export function SignInButton() {
  return (
    <Link href="/api/auth/signin/google?callbackUrl=/">
      <Button variant="primary" size="md">
        Sign in with Google
      </Button>
    </Link>
  );
}

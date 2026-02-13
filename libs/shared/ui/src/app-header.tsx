'use client';

import { HomeLink } from './home-link';

export type AppHeaderProps = {
  appName: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function AppHeader({ appName, children, actions, className }: AppHeaderProps) {
  return (
    <header className={`mb-4 flex items-start justify-between gap-3 ${className ?? ''}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <HomeLink />
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            HELLO-AI / {appName}
          </div>
        </div>
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

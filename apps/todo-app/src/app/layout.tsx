import './global.css';

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo app built with Next.js and Nx',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

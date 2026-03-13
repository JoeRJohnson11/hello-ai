import './global.css';

export const metadata = {
  title: 'Admin',
  description: 'Admin panel for connecting Calendar and Slack',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full overflow-x-hidden">{children}</body>
    </html>
  );
}

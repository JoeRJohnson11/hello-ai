import './global.css';

export const metadata = {
  title: "Joe-bot",
  description: "Chat with Joe-bot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

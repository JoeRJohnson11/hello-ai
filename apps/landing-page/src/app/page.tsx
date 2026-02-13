import { tokens } from '@hello-ai/shared';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-12 text-zinc-100">
          Current Projects
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Joe-bot Card */}
          <Link
            href="https://hello-ai.vercel.app"
            className="group"
          >
            <div
              className="bg-zinc-800 rounded-2xl p-8 hover:bg-zinc-750 transition-colors cursor-pointer h-full flex flex-col items-center justify-center gap-6"
              style={{
                borderRadius: tokens.radius.xl,
                boxShadow: tokens.shadow.lg,
              }}
            >
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-semibold text-center">Joe-bot</h2>
              <p className="text-zinc-400 text-center text-sm">
                AI chatbot assistant
              </p>
            </div>
          </Link>

          {/* Todo App Card */}
          <Link
            href="https://todo-app-joe.vercel.app"
            className="group"
          >
            <div
              className="bg-zinc-800 rounded-2xl p-8 hover:bg-zinc-750 transition-colors cursor-pointer h-full flex flex-col items-center justify-center gap-6"
              style={{
                borderRadius: tokens.radius.xl,
                boxShadow: tokens.shadow.lg,
              }}
            >
              <div className="text-6xl">✓</div>
              <h2 className="text-2xl font-semibold text-center">Todo App</h2>
              <p className="text-zinc-400 text-center text-sm">
                Task management
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

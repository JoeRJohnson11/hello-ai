/** nx-agents full-run test */
import { ProjectLinks } from './project-links';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-12 text-zinc-100">
          Current Projects
        </h1>
        <ProjectLinks />
      </div>
    </div>
  );
}

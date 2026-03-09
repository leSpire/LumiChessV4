import { ChessWorkspace } from '@/components/chess/ChessWorkspace';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <ChessWorkspace />
    </main>
  );
}

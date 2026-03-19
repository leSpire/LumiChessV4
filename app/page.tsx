import { ChessWorkspace } from '@/components/chess/ChessWorkspace';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-6 sm:px-6 lg:px-10">
      <ChessWorkspace />
    </main>
  );
}

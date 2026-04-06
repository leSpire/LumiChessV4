export default function MerciPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col items-center justify-center gap-4 px-4 text-center text-white">
      <h1 className="text-3xl font-semibold">Merci 🙌</h1>
      <p className="text-slate-300">
        Ton inscription à la newsletter est bien enregistrée.
      </p>
      <a
        href="/"
        className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-400"
      >
        Retour à l&apos;accueil
      </a>
    </main>
  );
}

import { ChessWorkspace } from '@/components/chess/ChessWorkspace';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-center gap-8 px-4 py-6 sm:px-6 lg:px-10">
      <ChessWorkspace />

      <section className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900/60 p-4 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-white">Newsletter</h2>
        <form
          name="newsletter"
          action="/merci"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          className="space-y-3"
        >
          <input type="hidden" name="form-name" value="newsletter" />

          <p className="hidden">
            <label>
              Ne remplis pas ça :
              <input name="bot-field" />
            </label>
          </p>

          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Email
            <input
              type="email"
              name="email"
              placeholder="Ton email"
              required
              className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-400"
          >
            S’inscrire
          </button>
        </form>
      </section>
    </main>
  );
}

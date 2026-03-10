const STOCKFISH_CANDIDATE_SCRIPTS = [
  '/stockfish/stockfish.js',
  'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js'
];

function waitWorkerBoot(worker: Worker, timeoutMs = 3500): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Délai dépassé lors du démarrage du moteur.'));
    }, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      const text = String(event.data ?? '');
      if (text.includes('uciok') || text.includes('Stockfish')) {
        cleanup();
        resolve();
      }
    };

    const onError = () => {
      cleanup();
      reject(new Error('Erreur au chargement du worker Stockfish.'));
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    worker.postMessage('uci');
  });
}

export async function createStockfishWorker(): Promise<Worker> {
  let lastError: Error | null = null;

  for (const scriptUrl of STOCKFISH_CANDIDATE_SCRIPTS) {
    try {
      const worker = new Worker(scriptUrl);
      await waitWorkerBoot(worker);
      return worker;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('Impossible de démarrer Stockfish.');
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Color } from 'chess.js';
import { createStockfishWorker } from '@/lib/engine/stockfishWorkerFactory';
import { parseBestMove, parseUciInfo } from '@/lib/engine/uci';
import type { EngineOutput, EngineRequestOptions, EngineStatus } from '@/types/engine';

interface PendingSearch {
  fen: string;
  perspective: Color;
  snapshot: EngineOutput;
  resolve: (output: EngineOutput | null) => void;
}

const INITIAL_OUTPUT: EngineOutput = {
  fen: '',
  depth: 0
};

export function useChessEngine() {
  const workerRef = useRef<Worker | null>(null);
  const searchRef = useRef<PendingSearch | null>(null);

  const [status, setStatus] = useState<EngineStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<EngineOutput>(INITIAL_OUTPUT);

  const send = useCallback((command: string) => {
    workerRef.current?.postMessage(command);
  }, []);

  const cancelCurrentSearch = useCallback((reason?: string) => {
    if (!searchRef.current) return;

    send('stop');
    searchRef.current.resolve(null);
    searchRef.current = null;
    if (reason) setError(reason);
    setStatus((current) => (current === 'error' ? current : 'ready'));
  }, [send]);

  const stop = useCallback(() => {
    cancelCurrentSearch();
    workerRef.current?.terminate();
    workerRef.current = null;
    setStatus('stopped');
  }, [cancelCurrentSearch]);

  const start = useCallback(async () => {
    if (workerRef.current) return;

    setStatus('initializing');
    setError(null);

    try {
      const worker = await createStockfishWorker();
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<string>) => {
        const line = String(event.data ?? '').trim();
        const pending = searchRef.current;

        if (!line) return;
        if (line === 'readyok') {
          setStatus((current) => (current === 'thinking' ? current : 'ready'));
          return;
        }

        if (line.startsWith('info ') && pending) {
          const parsed = parseUciInfo(line, pending.perspective);
          if (!parsed) return;

          const nextSnapshot: EngineOutput = {
            ...pending.snapshot,
            ...parsed,
            fen: pending.fen
          };

          pending.snapshot = nextSnapshot;
          setOutput(nextSnapshot);
          return;
        }

        const bestMove = parseBestMove(line);
        if (bestMove !== null && pending) {
          const completed: EngineOutput = {
            ...pending.snapshot,
            bestMove,
            fen: pending.fen
          };
          setOutput(completed);
          pending.resolve(completed);
          searchRef.current = null;
          setStatus('ready');
        }
      };

      worker.onerror = () => {
        setStatus('error');
        setError('Erreur du worker moteur.');
      };

      send('uci');
      send('isready');
    } catch (engineError) {
      setStatus('error');
      setError(engineError instanceof Error ? engineError.message : 'Impossible de démarrer le moteur.');
    }
  }, [send]);

  const restart = useCallback(async () => {
    stop();
    await start();
  }, [start, stop]);

  const search = useCallback(
    async ({ fen, depth, moveTimeMs, skillLevel }: EngineRequestOptions): Promise<EngineOutput | null> => {
      if (!workerRef.current) {
        await start();
      }

      if (!workerRef.current) return null;

      cancelCurrentSearch();

      const perspective = (fen.split(' ')[1] === 'b' ? 'b' : 'w') as Color;

      setStatus('thinking');
      setError(null);

      const initialSnapshot: EngineOutput = {
        fen,
        depth: 0
      };

      const promise = new Promise<EngineOutput | null>((resolve) => {
        searchRef.current = {
          fen,
          perspective,
          snapshot: initialSnapshot,
          resolve
        };
      });

      send(`setoption name Skill Level value ${Math.max(0, Math.min(20, skillLevel))}`);
      send('ucinewgame');
      send('isready');
      send(`position fen ${fen}`);
      send(`go depth ${depth} movetime ${moveTimeMs}`);

      return promise;
    },
    [cancelCurrentSearch, send, start]
  );

  useEffect(() => {
    void start();
    return () => stop();
  }, [start, stop]);

  return {
    status,
    error,
    output,
    start,
    stop,
    restart,
    search,
    cancelCurrentSearch
  };
}

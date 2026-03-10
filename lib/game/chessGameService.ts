import { Chess, DEFAULT_POSITION, type Color, type Move } from 'chess.js';
import type {
  FenString,
  GameRecord,
  ImportedGame,
  ImportedPosition,
  MoveHistoryRow,
  MoveInput,
  PgnMetadata,
  PositionSnapshot,
  ServiceResult,
  TimelineMove
} from '@/types/game/state';

const STANDARD_HEADERS = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'] as const;

function parseFenState(fen: string): Pick<PositionSnapshot, 'turn' | 'halfmoveClock' | 'fullmoveNumber'> {
  const parts = fen.split(' ');
  return {
    turn: (parts[1] === 'b' ? 'b' : 'w') as Color,
    halfmoveClock: Number(parts[4] ?? 0),
    fullmoveNumber: Number(parts[5] ?? 1)
  };
}

function toSnapshot(fen: string, index: number): PositionSnapshot {
  const parsed = parseFenState(fen);
  return {
    index,
    fen,
    ...parsed
  };
}

function toTimelineMove(plies: Move[]): TimelineMove[] {
  return plies.map((move, idx) => ({
    ply: idx + 1,
    color: move.color,
    from: move.from,
    to: move.to,
    san: move.san,
    lan: move.lan,
    promotion: move.promotion,
    fenAfter: move.after
  }));
}

function extractMetadata(headers: Record<string, string>): PgnMetadata {
  const metadata: PgnMetadata = {};

  for (const key of STANDARD_HEADERS) {
    if (headers[key]) metadata[key] = headers[key];
  }

  for (const [key, value] of Object.entries(headers)) {
    if (!metadata[key]) metadata[key] = value;
  }

  return metadata;
}

export function validateFen(fen: string): ServiceResult<ImportedPosition> {
  try {
    const board = new Chess(fen);
    return {
      ok: true,
      data: {
        source: 'fen',
        fen: board.fen() as FenString
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'INVALID_FEN',
        message: 'FEN invalide. Vérifiez les 6 champs standards (pièces, trait, roques, en passant, demi-coups, numéro de coup).',
        raw: error instanceof Error ? error.message : 'Unknown FEN parsing error'
      }
    };
  }
}

export function createInitialRecord(initialFen: string = DEFAULT_POSITION): GameRecord {
  const game = new Chess(initialFen);
  const fen = game.fen();

  return {
    initialFen: fen,
    currentFen: fen,
    currentIndex: 0,
    positions: [toSnapshot(fen, 0)],
    moves: [],
    metadata: {}
  };
}

export function createRecordFromFen(fen: string): ServiceResult<GameRecord> {
  const validation = validateFen(fen);
  if (!validation.ok || !validation.data) {
    return {
      ok: false,
      error: validation.error
    };
  }

  return {
    ok: true,
    data: createInitialRecord(validation.data.fen)
  };
}

export function createRecordFromPgn(pgn: string): ServiceResult<GameRecord & { imported: ImportedGame }> {
  try {
    const game = new Chess();
    game.loadPgn(pgn.trim(), { strict: false });

    const moves = toTimelineMove(game.history({ verbose: true }));

    const replay = new Chess();
    const positions: PositionSnapshot[] = [toSnapshot(replay.fen(), 0)];

    for (const move of moves) {
      replay.move(move.lan, { strict: false });
      positions.push(toSnapshot(replay.fen(), positions.length));
    }

    const metadata = extractMetadata(game.getHeaders() as Record<string, string>);

    const record: GameRecord = {
      initialFen: positions[0].fen,
      currentFen: positions[positions.length - 1].fen,
      currentIndex: positions.length - 1,
      positions,
      moves,
      metadata
    };

    return {
      ok: true,
      data: {
        ...record,
        imported: {
          source: 'pgn',
          pgn: game.pgn(),
          metadata
        }
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'INVALID_PGN',
        message: 'PGN invalide ou incomplet. Vérifiez la notation des coups.',
        raw: error instanceof Error ? error.message : 'Unknown PGN parsing error'
      }
    };
  }
}

export function toHistoryRows(moves: TimelineMove[]): MoveHistoryRow[] {
  const rows: MoveHistoryRow[] = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1]
    });
  }

  return rows;
}

export function jumpToIndex(record: GameRecord, index: number): ServiceResult<GameRecord> {
  if (index < 0 || index >= record.positions.length) {
    return {
      ok: false,
      error: {
        code: 'OUT_OF_RANGE',
        message: `Index hors limites: ${index}.`
      }
    };
  }

  return {
    ok: true,
    data: {
      ...record,
      currentIndex: index,
      currentFen: record.positions[index].fen
    }
  };
}

export function navigateRecord(record: GameRecord, action: 'start' | 'prev' | 'next' | 'end'): GameRecord {
  if (action === 'start') return { ...record, currentIndex: 0, currentFen: record.positions[0].fen };
  if (action === 'end') {
    const index = record.positions.length - 1;
    return { ...record, currentIndex: index, currentFen: record.positions[index].fen };
  }

  const nextIndex = action === 'prev' ? Math.max(0, record.currentIndex - 1) : Math.min(record.positions.length - 1, record.currentIndex + 1);

  return {
    ...record,
    currentIndex: nextIndex,
    currentFen: record.positions[nextIndex].fen
  };
}

export function applyMove(record: GameRecord, input: MoveInput): ServiceResult<GameRecord> {
  try {
    const game = new Chess(record.currentFen);
    const result = game.move(input);

    if (!result) {
      return {
        ok: false,
        error: {
          code: 'INVALID_MOVE',
          message: 'Coup illégal pour la position actuelle.'
        }
      };
    }

    const baseMoves = record.moves.slice(0, record.currentIndex);
    const basePositions = record.positions.slice(0, record.currentIndex + 1);

    const timelineMove: TimelineMove = {
      ply: baseMoves.length + 1,
      color: result.color,
      from: result.from,
      to: result.to,
      san: result.san,
      lan: result.lan,
      promotion: result.promotion,
      fenAfter: result.after
    };

    const moves = [...baseMoves, timelineMove];
    const positions = [...basePositions, toSnapshot(result.after, basePositions.length)];

    return {
      ok: true,
      data: {
        ...record,
        currentIndex: positions.length - 1,
        currentFen: result.after,
        moves,
        positions
      }
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'INVALID_MOVE',
        message: 'Impossible de jouer ce coup.',
        raw: error instanceof Error ? error.message : 'Unknown move error'
      }
    };
  }
}

export function exportPgn(record: GameRecord): string {
  const game = new Chess(record.initialFen);

  Object.entries(record.metadata).forEach(([key, value]) => {
    if (value) game.setHeader(key, value);
  });

  for (const move of record.moves) {
    game.move(move.lan, { strict: false });
  }

  return game.pgn();
}

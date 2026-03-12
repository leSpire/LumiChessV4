import type { Puzzle } from '@/types/puzzle';

export const DEMO_PUZZLES: Puzzle[] = [
  {
    id: 'mate-1-001',
    title: 'Finale précise · Mat en 1',
    description: 'Trouve le mat immédiat avec la dame.',
    startFen: '6k1/8/5K2/8/8/8/8/3Q4 w - - 0 1',
    playerToMove: 'w',
    orientation: 'w',
    themes: ['mateIn1'],
    rating: 650,
    solution: [{ role: 'player', lan: 'd1d8', san: 'Qd8#' }],
    explanation: 'La dame coupe toute la 8e rangée et le roi noir n’a plus de case.'
  },
  {
    id: 'mate-2-001',
    title: 'Coordination tour + dame · Mat en 2',
    description: 'Forcer le roi puis conclure au coup suivant.',
    startFen: '6k1/5ppp/8/8/8/5Q2/6PP/5RK1 w - - 0 1',
    playerToMove: 'w',
    orientation: 'w',
    themes: ['mateIn2'],
    rating: 1180,
    solution: [
      { role: 'player', lan: 'f3a8', san: 'Qa8+' },
      { role: 'opponent', lan: 'g8h7', san: 'Kh7' },
      { role: 'player', lan: 'f1e1', san: 'Re1' }
    ],
    explanation: 'Le premier échec force le roi et la tour rejoint la colonne e pour finir le filet.'
  },
  {
    id: 'fork-001',
    title: 'Fourchette de cavalier',
    description: 'Le cavalier attaque roi et dame en même temps.',
    startFen: '4k3/8/8/3q4/8/8/4N3/4K3 w - - 0 1',
    playerToMove: 'w',
    themes: ['fork', 'doubleAttack'],
    rating: 930,
    solution: [{ role: 'player', lan: 'e2c3', san: 'Nc3' }],
    explanation: 'Le cavalier saute sur c3 et touche simultanément le roi et la dame noire.'
  },
  {
    id: 'pin-001',
    title: 'Clouage exploité',
    description: 'Exploite le clouage sur la colonne e.',
    startFen: '4k3/4r3/8/8/8/8/4Q3/4K3 w - - 0 1',
    playerToMove: 'w',
    themes: ['pin'],
    rating: 980,
    solution: [{ role: 'player', lan: 'e2b5', san: 'Qb5+' }],
    explanation: 'La pression sur e8 empêche une défense propre et crée un clouage fonctionnel.'
  },
  {
    id: 'double-attack-001',
    title: 'Attaque double de dame',
    description: 'Trouve le coup qui crée deux menaces immédiates.',
    startFen: '4k3/8/8/8/8/8/3Q4/4K2r w - - 0 1',
    playerToMove: 'w',
    themes: ['doubleAttack', 'attraction'],
    rating: 1020,
    solution: [{ role: 'player', lan: 'd2d8', san: 'Qd8+' }],
    explanation: 'La dame donne échec tout en forçant une défense qui perd la tour h1.'
  },
  {
    id: 'deflection-001',
    title: 'Déviation',
    description: 'Dévie la pièce défensive et gagne du matériel.',
    startFen: '4k3/8/8/3r4/8/8/3Q4/4K3 w - - 0 1',
    playerToMove: 'w',
    themes: ['deflection'],
    rating: 1100,
    solution: [{ role: 'player', lan: 'd2d5', san: 'Qxd5' }],
    explanation: 'La dame attire la tour noire sur une case défavorable et simplifie gagnant.'
  }
];

import type { Puzzle, PuzzleCategory } from '@/types/puzzle';

export const PUZZLE_CATEGORIES: PuzzleCategory[] = [
  { id: 'mateIn1', label: 'Mat en 1', description: 'Trouver le mat immédiat.' },
  { id: 'mateIn2', label: 'Mat en 2', description: 'Forcer une séquence de mat en deux coups.' },
  { id: 'fork', label: 'Fourchette', description: 'Attaquer deux cibles avec une seule pièce.' },
  { id: 'pin', label: 'Clouage', description: 'Exploiter une pièce immobilisée.' },
  { id: 'doubleAttack', label: 'Attaque double', description: 'Créer deux menaces simultanées.' },
  { id: 'deflection', label: 'Déviation', description: 'Écarter un défenseur de sa case clé.' },
  { id: 'attraction', label: 'Attraction', description: 'Attirer une pièce adverse sur une mauvaise case.' },
  { id: 'discoveredAttack', label: 'Attaque découverte', description: 'Libérer une ligne d’attaque cachée.' },
  { id: 'endgameTactic', label: 'Tactique de finale', description: 'Transformer un avantage technique en finale.' }
];

export const LOCAL_PUZZLE_CATALOG: Puzzle[] = [
  {
    id: 'mate-in-1-back-rank',
    title: 'Couloir fermé',
    description: 'Les Noirs sont étouffés sur la 8e rangée.',
    category: 'mateIn1',
    themes: ['mateIn1'],
    rating: 760,
    startFen: '6k1/5ppp/8/8/8/5Q2/6PP/6K1 w - - 0 1',
    sideToMove: 'w',
    orientation: 'w',
    solution: [{ role: 'player', uci: 'f3a8', san: 'Qa8#' }],
    explanation: 'Le roi noir ne possède aucune case de fuite et aucune interposition possible.'
  },
  {
    id: 'mate-in-2-ladder',
    title: 'Échelle décisive',
    description: 'Forcer le roi et conclure au coup suivant.',
    category: 'mateIn2',
    themes: ['mateIn2'],
    rating: 1180,
    startFen: '7k/6p1/8/8/8/6Q1/6PP/6RK w - - 0 1',
    sideToMove: 'w',
    orientation: 'w',
    solution: [
      { role: 'player', uci: 'g3b8', san: 'Qb8+' },
      { role: 'opponent', uci: 'h8h7', san: 'Kh7' },
      { role: 'player', uci: 'g1b1', san: 'Rb1#' }
    ],
    explanation: 'La dame force le roi en h7 puis la tour donne un mat de couloir sur la colonne b.'
  },
  {
    id: 'fork-knight-royal',
    title: 'Saut de cavalier',
    description: 'Le cavalier crée une fourchette roi + dame.',
    category: 'fork',
    themes: ['fork', 'doubleAttack'],
    rating: 980,
    startFen: '4k3/8/8/3q4/8/8/4N3/4K3 w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'e2c3', san: 'Nc3+' }],
    explanation: 'Depuis c3, le cavalier attaque le roi e4? et la dame d5: gain matériel immédiat.'
  },
  {
    id: 'pin-on-file',
    title: 'Clouage sur la colonne e',
    description: 'Le roi noir derrière la tour ne peut pas défendre.',
    category: 'pin',
    themes: ['pin'],
    rating: 1040,
    startFen: '4k3/4r3/8/8/8/8/4Q3/6K1 w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'e2b5', san: 'Qb5+' }],
    explanation: 'Le clouage de la tour e7 limite les défenses et laisse les Noirs sous forte pression.'
  },
  {
    id: 'double-attack-queen',
    title: 'Double menace de dame',
    description: 'Échec et attaque de la tour en même temps.',
    category: 'doubleAttack',
    themes: ['doubleAttack', 'attraction'],
    rating: 1020,
    startFen: '4k3/8/8/8/8/8/3Q2K1/7r w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'd2d8', san: 'Qd8+' }],
    explanation: 'Après l’échec, les Noirs ne peuvent pas conserver la tour h1.'
  },
  {
    id: 'deflection-rook-guard',
    title: 'Dévier le défenseur',
    description: 'Le défenseur principal est forcé de quitter sa tâche.',
    category: 'deflection',
    themes: ['deflection'],
    rating: 1100,
    startFen: '4k3/8/8/3r4/8/8/3Q4/4K3 w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'd2d5', san: 'Qxd5' }],
    explanation: 'La tour est détournée et la structure noire se désorganise.'
  },
  {
    id: 'attraction-king-net',
    title: 'Attirer le roi',
    description: 'Le roi noir est attiré sur une case de mat.',
    category: 'attraction',
    themes: ['attraction', 'mateIn2'],
    rating: 1210,
    startFen: '6k1/6p1/8/8/8/6Q1/6PP/5RK1 w - - 0 1',
    sideToMove: 'w',
    solution: [
      { role: 'player', uci: 'g3b8', san: 'Qb8+' },
      { role: 'opponent', uci: 'g8h7', san: 'Kh7' },
      { role: 'player', uci: 'f1b1', san: 'Rb1' }
    ],
    explanation: 'Le roi noir est attiré vers h7, ce qui rend la pénétration de la tour possible.'
  },
  {
    id: 'discovered-attack-bishop',
    title: 'Rayon X sur la dame',
    description: 'Déplacer le cavalier pour révéler l’attaque du fou.',
    category: 'discoveredAttack',
    themes: ['discoveredAttack', 'doubleAttack'],
    rating: 1240,
    startFen: '4k3/8/8/3q4/2N5/8/1B6/4K3 w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'c4e3', san: 'Ne3' }],
    explanation: 'Le cavalier libère la diagonale b2-e5: la dame noire devient tactiquement vulnérable.'
  },
  {
    id: 'endgame-opposition-break',
    title: 'Finale de pions active',
    description: 'Trouver la percée qui gagne la course.',
    category: 'endgameTactic',
    themes: ['endgameTactic'],
    rating: 1320,
    startFen: '8/8/8/3k4/3P4/4K3/8/8 w - - 0 1',
    sideToMove: 'w',
    solution: [{ role: 'player', uci: 'e3d3', san: 'Kd3' }],
    explanation: 'Le roi prend l’opposition et prépare l’escorte du pion passé.'
  }
];

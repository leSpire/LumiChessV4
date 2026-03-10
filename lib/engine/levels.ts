import type { AiDifficultyConfig, AiSkillLevel } from '@/types/engine';

export const AI_LEVELS: Record<AiSkillLevel, AiDifficultyConfig> = {
  beginner: {
    id: 'beginner',
    label: 'Débutant',
    description: 'Jeu simple et rapide, idéal pour progresser.',
    depth: 8,
    moveTimeMs: 250,
    skillLevel: 4
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermédiaire',
    description: 'Niveau équilibré pour parties compétitives.',
    depth: 12,
    moveTimeMs: 500,
    skillLevel: 10
  },
  advanced: {
    id: 'advanced',
    label: 'Avancé',
    description: 'Niveau exigeant avec calcul plus profond.',
    depth: 16,
    moveTimeMs: 900,
    skillLevel: 18
  },
  custom: {
    id: 'custom',
    label: 'Personnalisé',
    description: 'Configuration pilotée côté produit.',
    depth: 14,
    moveTimeMs: 700,
    skillLevel: 14
  }
};

export const DEFAULT_AI_LEVEL: AiSkillLevel = 'intermediate';

import clsx from 'clsx';
import type { PuzzleCategoryDefinition, PuzzleUiCategory } from '@/types/puzzle';

interface PuzzleCategoryTabsProps {
  categories: PuzzleCategoryDefinition[];
  activeCategory: PuzzleUiCategory;
  onSelect: (category: PuzzleUiCategory) => void;
}

export function PuzzleCategoryTabs({ categories, activeCategory, onSelect }: PuzzleCategoryTabsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]">Catégories</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={clsx(
              'rounded-full border px-3 py-1.5 text-xs transition',
              activeCategory === category.id
                ? 'border-[#d9b36c] bg-[#d9ab5d2f] text-[#f8e7c5]'
                : 'border-[#c6933d4f] text-[#d8c1a1] hover:bg-[#d9ab5d17]'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}

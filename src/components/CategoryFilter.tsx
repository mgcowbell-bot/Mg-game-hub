import React from 'react';
import { GameCategory } from '../types/game';
import { 
  Sparkles, 
  Swords, 
  ShieldAlert, 
  Car, 
  Joystick, 
  BrainCircuit, 
  Coffee, 
  Rocket, 
  Users2,
  ArrowUpDown
} from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  categoryCounts,
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'action':
        return <Swords className="w-3.5 h-3.5 text-rose-400" />;
      case 'rpg':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
      case 'racing':
        return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case 'arcade':
        return <Joystick className="w-3.5 h-3.5 text-emerald-400" />;
      case 'strategy':
        return <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />;
      case 'casual':
        return <Coffee className="w-3.5 h-3.5 text-teal-400" />;
      case 'sci-fi':
        return <Rocket className="w-3.5 h-3.5 text-cyan-400" />;
      case 'multiplayer':
        return <Users2 className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
      
      {/* Category Pills Slider / Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-bold scale-105'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isSelected ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort selection dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400 font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort games by"
          className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          <option value="latest">Latest Releases</option>
          <option value="popular">Most Downloaded</option>
          <option value="rating">Highest Rated</option>
          <option value="title">Alphabetical (A-Z)</option>
        </select>
      </div>

    </div>
  );
};

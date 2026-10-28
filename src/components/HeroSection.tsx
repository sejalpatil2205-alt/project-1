import React from 'react';
import {
  Search,
  Utensils,
  IndianRupee,
  Star,
  ArrowLeftRight,
} from 'lucide-react';
import type { MessSummaryStats } from '../types';

interface HeroSectionProps {
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onExecuteSearch: () => void;
  stats: MessSummaryStats;
  onStatAction: (action: 'all' | 'lowest_price' | 'top_rated' | 'compare') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchInput,
  onSearchInputChange,
  onExecuteSearch,
  stats,
  onStatAction,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch();
  };

  return (
    <section className="bg-[#191919] text-[#FFF4E3] py-12 sm:py-16 lg:py-20 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Badge, Headline, Description, Search */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-[#FFD400] text-[#191919] px-3.5 py-1 rounded-md text-xs font-extrabold tracking-wider">
              FOR COLLEGE STUDENTS
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight text-[#FFF4E3]"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              Find a mess that{' '}
              <span className="font-serif italic text-[#F0442B] font-semibold">
                feels like home.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#FFF4E3]/75 max-w-2xl leading-relaxed">
              Discover nearby messes with full menu, pricing, timings, and honest student reviews
              — all in one place. Stop eating bad food.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl pt-1"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#191919]/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => onSearchInputChange(e.target.value)}
                  placeholder="Search by name, area, or cuisine..."
                  aria-label="Search messes by name, area, or cuisine"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-white text-[#191919] placeholder:text-[#191919]/45 text-sm sm:text-base font-medium focus:outline-2 focus:outline-[#FFD400] border-0"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-7 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white font-bold text-sm sm:text-base transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Column: 2x2 Colourful Statistic Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {/* Card 1: 10 Messes (Primary Orange) */}
            <button
              type="button"
              onClick={() => onStatAction('all')}
              className="text-left p-5 sm:p-6 rounded-2xl bg-[#F0442B] text-white hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer flex flex-col justify-between min-h-[148px]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight">
                  {stats.totalMesses} Messes
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/90 mt-1">
                  Maharashtrian near campus
                </div>
              </div>
            </button>

            {/* Card 2: ₹2,300+ (Green) */}
            <button
              type="button"
              onClick={() => onStatAction('lowest_price')}
              className="text-left p-5 sm:p-6 rounded-2xl bg-[#19B783] text-[#191919] hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer flex flex-col justify-between min-h-[148px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#191919]/12 flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5 text-[#191919]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight">
                  ₹{stats.minMonthlyPrice.toLocaleString('en-IN')}+
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#191919]/80 mt-1">
                  Starting monthly
                </div>
              </div>
            </button>

            {/* Card 3: 4.2 Avg (Bright Yellow) */}
            <button
              type="button"
              onClick={() => onStatAction('top_rated')}
              className="text-left p-5 sm:p-6 rounded-2xl bg-[#FFD400] text-[#191919] hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer flex flex-col justify-between min-h-[148px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#191919]/12 flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-[#191919] fill-[#191919]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight">
                  {stats.avgRating.toFixed(1)} Avg
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#191919]/80 mt-1">
                  Student rating
                </div>
              </div>
            </button>

            {/* Card 4: Compare (Royal Blue) */}
            <button
              type="button"
              onClick={() => onStatAction('compare')}
              className="text-left p-5 sm:p-6 rounded-2xl bg-[#304FFE] text-white hover:-translate-y-0.5 transition-transform duration-150 cursor-pointer flex flex-col justify-between min-h-[148px]"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Compare
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/90 mt-1">
                  Side-by-side messes
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { MessCard } from './MessCard';
import type { MessListing } from '../types';

interface SavedMessesViewProps {
  allMesses: MessListing[];
  favouriteMessIds: number[];
  comparedIds: number[];
  onToggleFavourite: (messId: number) => void;
  onToggleCompare: (messId: number) => void;
  onOpenDetails: (mess: MessListing, tab?: 'menu' | 'enquire' | 'reviews') => void;
  onBackToDiscover: () => void;
}

export const StudentActivityView: React.FC<SavedMessesViewProps> = ({
  allMesses,
  favouriteMessIds,
  comparedIds,
  onToggleFavourite,
  onToggleCompare,
  onOpenDetails,
  onBackToDiscover,
}) => {
  const savedMesses = allMesses.filter((m) => favouriteMessIds.includes(m.id));

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#191919]/10 pb-6">
        <div>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#F0442B] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Messes</span>
          </button>
          <div className="flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-[#F0442B] fill-[#F0442B]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191919]">
              Your Saved Messes ({savedMesses.length})
            </h1>
          </div>
          <p className="text-sm text-[#6B6860] mt-1">
            Shortlist your favourite Maharashtrian messes near campus — saved directly in your
            browser with no student login required.
          </p>
        </div>
      </div>

      {savedMesses.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-[#191919]/10 text-center space-y-4">
          <Heart className="w-10 h-10 text-[#F0442B] mx-auto" />
          <h2 className="text-lg font-extrabold text-[#191919]">No Saved Messes Yet</h2>
          <p className="text-sm text-[#6B6860] max-w-md mx-auto">
            Tap the heart icon on any mess card to bookmark your top choices here for quick menu
            and price comparison.
          </p>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="px-6 py-2.5 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            Browse All Messes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedMesses.map((mess) => (
            <MessCard
              key={mess.id}
              mess={mess}
              isFavourite={favouriteMessIds.includes(mess.id)}
              isCompared={comparedIds.includes(mess.id)}
              onToggleFavourite={onToggleFavourite}
              onToggleCompare={onToggleCompare}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </main>
  );
};

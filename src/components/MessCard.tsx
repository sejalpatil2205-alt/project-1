import React from 'react';
import {
  Heart,
  Star,
  MapPin,
  Clock,
  Users,
  Scale,
  Check,
} from 'lucide-react';
import { MessImage } from '../assets/MessImage';
import type { MessListing } from '../types';

interface MessCardProps {
  mess: MessListing;
  isFavourite: boolean;
  isCompared: boolean;
  onToggleFavourite: (messId: number) => void;
  onToggleCompare: (messId: number) => void;
  onOpenDetails: (mess: MessListing, defaultTab?: 'menu' | 'enquire' | 'reviews') => void;
}

export const MessCard: React.FC<MessCardProps> = ({
  mess,
  isFavourite,
  isCompared,
  onToggleFavourite,
  onToggleCompare,
  onOpenDetails,
}) => {
  const ctaStyles =
    mess.buttonColor === 'blue'
      ? 'bg-[#304FFE] hover:bg-[#233fe0] text-white'
      : mess.buttonColor === 'green'
      ? 'bg-[#19B783] hover:bg-[#149a6e] text-[#191919]'
      : 'bg-[#F0442B] hover:bg-[#d93820] text-white';

  const categoryAccent =
    mess.buttonColor === 'blue'
      ? 'text-[#304FFE]'
      : mess.buttonColor === 'green'
      ? 'text-[#148A61]'
      : 'text-[#F0442B]';

  return (
    <article className="bg-white rounded-2xl border border-[#191919]/10 overflow-hidden flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
      {/* 4:3 Food Photography Header */}
      <div className="relative aspect-[4/3] bg-[#191919] overflow-hidden">
        <button
          type="button"
          onClick={() => onOpenDetails(mess, 'menu')}
          className="w-full h-full block text-left cursor-pointer group"
        >
          <MessImage
            imageKey={mess.imageKey}
            customImageUrl={mess.customImageUrl}
            alt={`${mess.name} — ${mess.speciality}`}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
        </button>

        {/* Favourite Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleFavourite(mess.id)}
          aria-label={isFavourite ? `Remove ${mess.name} from favourites` : `Save ${mess.name} to favourites`}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isFavourite
              ? 'bg-[#F0442B] text-white shadow-sm'
              : 'bg-[#191919]/75 text-white hover:bg-[#191919]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavourite ? 'fill-white' : ''}`} />
        </button>

        {/* Bottom Overlay Price & Rating */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white pointer-events-none">
          <div>
            <div className="text-xs font-medium text-white/80">Monthly Pass</div>
            <div className="text-2xl font-extrabold font-mono tabular-nums tracking-tight">
              ₹{mess.monthlyPrice.toLocaleString('en-IN')}
              <span className="text-xs font-sans font-normal text-white/80">/mo</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm font-bold tabular-nums text-[#FFD400]">
            <Star className="w-4 h-4 fill-[#FFD400] text-[#FFD400]" />
            <span>{mess.rating.toFixed(1)}</span>
            <span className="text-xs font-normal text-white/80">({mess.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Quiet 1-line Kicker & Diet Info */}
          <div className="flex items-center justify-between gap-2 text-xs font-bold tracking-wider">
            <span className={categoryAccent}>{mess.category}</span>
            <span className="text-[#6B6860] font-semibold">
              {mess.dietType}
              {mess.tiffinDelivery ? ' · Dabba Available' : ''}
            </span>
          </div>

          {/* Mess Name */}
          <h3 className="text-xl font-extrabold text-[#191919] leading-snug">
            <button
              type="button"
              onClick={() => onOpenDetails(mess, 'menu')}
              className="hover:text-[#F0442B] transition-colors text-left cursor-pointer"
            >
              {mess.name}
            </button>
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-[#6B6860] leading-relaxed">
            <MapPin className="w-3.5 h-3.5 text-[#F0442B] shrink-0 mt-0.5" />
            <span className="line-clamp-2">{mess.location}</span>
          </div>

          {/* Speciality */}
          <div className="pt-1 text-sm text-[#191919]">
            <span className="font-semibold text-[#6B6860]">Speciality: </span>
            <span className="font-semibold">{mess.speciality}</span>
          </div>

          {/* Clean Unboxed Metadata Tags */}
          {mess.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#6B6860]">
              {mess.tags.map((tag, idx) => (
                <React.Fragment key={tag}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span>{tag}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Timings & Seats Divider */}
        <div className="pt-3 border-t border-[#191919]/10 space-y-3">
          <div className="grid grid-cols-1 gap-1 text-xs text-[#57544E]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#6B6860]" />
                Lunch
              </span>
              <span className="font-mono tabular-nums font-medium text-[#191919]">
                {mess.lunchTiming}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#6B6860]" />
                Dinner
              </span>
              <span className="font-mono tabular-nums font-medium text-[#191919]">
                {mess.dinnerTiming}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1.5 font-bold text-[#191919] tabular-nums">
              <Users className="w-3.5 h-3.5 text-[#19B783]" />
              {mess.availableSeats > 0
                ? `${mess.availableSeats} seats available`
                : 'Waitlist only (0 seats)'}
            </span>

            <button
              type="button"
              onClick={() => onToggleCompare(mess.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isCompared
                  ? 'bg-[#304FFE] text-white'
                  : 'bg-[#FFF4E3] text-[#191919] hover:bg-[#191919]/10'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
              <span>{isCompared ? 'Comparing' : 'Compare'}</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenDetails(mess, 'menu')}
              className="py-2.5 px-3 rounded-xl border border-[#191919]/15 text-xs sm:text-sm font-bold text-[#191919] hover:bg-[#FFF4E3] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Full Menu
            </button>
            <button
              type="button"
              onClick={() => onOpenDetails(mess, 'enquire')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${ctaStyles}`}
            >
              Enquire Seat
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

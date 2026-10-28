import React from 'react';
import { X, Star, Scale, Plus, Trash2 } from 'lucide-react';
import { MessImage } from '../assets/MessImage';
import type { MessListing } from '../types';

interface CompareModalProps {
  allMesses: MessListing[];
  comparedIds: number[];
  onToggleCompare: (messId: number) => void;
  onClearCompare: () => void;
  onSelectForEnquiry: (mess: MessListing) => void;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  allMesses,
  comparedIds,
  onToggleCompare,
  onClearCompare,
  onSelectForEnquiry,
  onClose,
}) => {
  const selectedMesses = comparedIds
    .map((id) => allMesses.find((m) => m.id === id))
    .filter((m): m is MessListing => Boolean(m));

  const unselectedMesses = allMesses.filter((m) => !comparedIds.includes(m.id));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF4E3] text-[#191919] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#191919]/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#191919] text-[#FFF4E3] px-5 sm:px-6 py-4 flex items-center justify-between border-b-2 border-[#304FFE] shrink-0">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#FFD400]" />
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Compare Messes Side-by-Side
              </h2>
              <p className="text-xs text-[#FFF4E3]/70">
                Compare up to 3 Maharashtrian messes on monthly price, seats, timings, and menu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedMesses.length > 0 && (
              <button
                type="button"
                onClick={onClearCompare}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#FFF4E3]/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              className="w-9 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Add Selector if < 3 selected */}
          {selectedMesses.length < 3 && unselectedMesses.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#191919]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-bold text-[#191919]">
                Add a mess to compare ({selectedMesses.length}/3 selected):
              </div>
              <div className="flex flex-wrap gap-2">
                {unselectedMesses.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onToggleCompare(m.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF4E3] hover:bg-[#FFD400] text-xs font-bold text-[#191919] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{m.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedMesses.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center space-y-3 border border-[#191919]/10">
              <Scale className="w-10 h-10 text-[#304FFE] mx-auto" />
              <h3 className="text-lg font-extrabold">No Messes Selected Yet</h3>
              <p className="text-sm text-[#6B6860] max-w-md mx-auto">
                Click any mess button above or tap “Compare” on mess cards to compare monthly fees,
                specialities, and timings side-by-side.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#191919]/10 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-[#191919]/10">
                    <th className="p-4 w-44 bg-[#FFF4E3]/50 text-xs font-extrabold uppercase tracking-wider text-[#6B6860]">
                      Feature
                    </th>
                    {selectedMesses.map((m) => (
                      <th key={m.id} className="p-4 align-top w-64">
                        <div className="relative h-28 rounded-xl overflow-hidden mb-3 bg-[#191919]">
                          <MessImage
                            imageKey={m.imageKey}
                            customImageUrl={m.customImageUrl}
                            alt={m.name}
                          />
                          <button
                            type="button"
                            onClick={() => onToggleCompare(m.id)}
                            title="Remove from comparison"
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#191919]/80 text-white hover:bg-[#F0442B] flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] font-bold text-[#F0442B]">{m.category}</div>
                        <div className="text-base font-extrabold text-[#191919]">{m.name}</div>
                        <div className="text-xs font-normal text-[#6B6860] mt-0.5 line-clamp-1">
                          {m.area}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#191919]/10 text-sm">
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Full Monthly (2-Time)
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 font-mono font-extrabold text-lg tabular-nums">
                        ₹{m.monthlyPrice.toLocaleString('en-IN')}/mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Half Monthly / Single Plate
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 font-mono tabular-nums text-xs font-semibold">
                        ₹{m.halfMonthlyPrice.toLocaleString('en-IN')}/mo · ₹{m.singlePlatePrice}/plate
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Student Rating
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4">
                        <span className="inline-flex items-center gap-1 font-bold tabular-nums">
                          <Star className="w-4 h-4 fill-[#FFD400] text-[#FFD400]" />
                          {m.rating.toFixed(1)}
                          <span className="text-xs font-normal text-[#6B6860]">
                            ({m.reviewCount} reviews)
                          </span>
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Available Seats
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 font-bold tabular-nums text-[#148A61]">
                        {m.availableSeats} / {m.totalSeats} seats open
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Diet & Dabba Service
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 text-xs font-semibold">
                        {m.dietType} · {m.tiffinDelivery ? 'Dabba Delivery Yes' : 'Dine-In Only'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Speciality Dishes
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 text-xs leading-relaxed font-medium">
                        {m.speciality}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Meal Timings
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4 text-xs font-mono tabular-nums space-y-1">
                        <div>L: {m.lunchTiming}</div>
                        <div>D: {m.dinnerTiming}</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 bg-[#FFF4E3]/50 font-bold text-xs text-[#57544E]">
                      Action
                    </td>
                    {selectedMesses.map((m) => (
                      <td key={m.id} className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectForEnquiry(m);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          Enquire at {m.name}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

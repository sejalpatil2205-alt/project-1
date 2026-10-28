import React, { useEffect, useState } from 'react';
import {
  Heart,
  Send,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from '../lib/api';
import { MessCard } from './MessCard';
import type { MessListing, StudentEnquiry, UserProfile } from '../types';

interface StudentActivityViewProps {
  user: UserProfile;
  favouriteMessIds: number[];
  comparedIds: number[];
  onToggleFavourite: (messId: number) => void;
  onToggleCompare: (messId: number) => void;
  onOpenDetails: (mess: MessListing, tab?: 'menu' | 'enquire' | 'reviews') => void;
  onBackToDiscover: () => void;
}

export const StudentActivityView: React.FC<StudentActivityViewProps> = ({
  user,
  favouriteMessIds,
  comparedIds,
  onToggleFavourite,
  onToggleCompare,
  onOpenDetails,
  onBackToDiscover,
}) => {
  const [savedMesses, setSavedMesses] = useState<MessListing[]>([]);
  const [enquiries, setEnquiries] = useState<StudentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getFavourites(), api.getStudentEnquiries()])
      .then(([favRes, enqRes]) => {
        if (!active) return;
        setSavedMesses(favRes.messes);
        setEnquiries(enqRes.enquiries);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [favouriteMessIds]);

  const renderStatus = (status: StudentEnquiry['status']) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0F7A56]">
          <CheckCircle2 className="w-4 h-4" />
          Seat Approved
        </span>
      );
    }
    if (status === 'contacted') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#304FFE]">
          <MessageSquare className="w-4 h-4" />
          Owner Contacted
        </span>
      );
    }
    if (status === 'declined') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#F0442B]">
          <XCircle className="w-4 h-4" />
          Seats Full / Declined
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#8A6D00]">
        <Clock className="w-4 h-4" />
        Pending Owner Reply
      </span>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Header */}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191919]">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-[#6B6860] mt-0.5">
            {user.collegeOrMess} · {user.email}
          </p>
        </div>
      </div>

      {/* Section 1: Subscription Enquiries */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5 text-[#304FFE]" />
          <h2 className="text-xl font-extrabold text-[#191919]">
            My Subscription Enquiries ({enquiries.length})
          </h2>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-sm text-[#6B6860]">
            Loading your enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-center space-y-3">
            <p className="text-sm text-[#6B6860]">
              You have not sent any subscription enquiries yet.
            </p>
            <button
              type="button"
              onClick={onBackToDiscover}
              className="px-5 py-2.5 rounded-xl bg-[#F0442B] text-white text-xs font-bold cursor-pointer"
            >
              Browse Messes Near Campus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white p-5 rounded-2xl border border-[#191919]/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#191919]">{enq.messName}</h3>
                    <div className="text-xs text-[#6B6860]">{enq.planType}</div>
                  </div>
                  {renderStatus(enq.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-[#57544E] font-mono tabular-nums">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joining: {enq.startDate}
                  </span>
                  <span>Sent: {new Date(enq.createdAt).toLocaleDateString('en-IN')}</span>
                </div>

                <p className="text-xs text-[#3F3C37] bg-[#FFF4E3]/60 p-3 rounded-xl">
                  “{enq.message}”
                </p>

                {enq.ownerNote && (
                  <div className="p-3 rounded-xl bg-[#19B783]/12 border border-[#19B783]/30 text-xs text-[#191919]">
                    <strong className="text-[#0F7A56]">Mess Owner Reply: </strong>
                    {enq.ownerNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Saved Messes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#F0442B] fill-[#F0442B]" />
          <h2 className="text-xl font-extrabold text-[#191919]">
            Saved Messes ({savedMesses.length})
          </h2>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-sm text-[#6B6860]">
            Loading saved messes...
          </div>
        ) : savedMesses.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-center space-y-3">
            <p className="text-sm text-[#6B6860]">
              Tap the heart icon on any mess card to bookmark your top choices here.
            </p>
            <button
              type="button"
              onClick={onBackToDiscover}
              className="px-5 py-2.5 rounded-xl bg-[#191919] text-white text-xs font-bold cursor-pointer"
            >
              Explore 10 Messes
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
      </section>
    </main>
  );
};

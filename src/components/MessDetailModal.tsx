import React, { useEffect, useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Users,
  Heart,
  CheckCircle2,
  Send,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { MessImage } from '../assets/MessImage';
import type { MessListing, MessSummaryStats } from '../types';

interface MessDetailModalProps {
  messId: number;
  initialMess: MessListing;
  initialTab?: 'menu' | 'enquire' | 'reviews';
  isFavourite: boolean;
  onToggleFavourite: (messId: number) => void;
  onClose: () => void;
  onMessDataUpdated: (updated: MessListing, stats?: MessSummaryStats) => void;
}

export const MessDetailModal: React.FC<MessDetailModalProps> = ({
  messId,
  initialMess,
  initialTab = 'menu',
  isFavourite,
  onToggleFavourite,
  onClose,
  onMessDataUpdated,
}) => {
  const [mess, setMess] = useState<MessListing>(initialMess);
  const [activeTab, setActiveTab] = useState<'menu' | 'enquire' | 'reviews'>(initialTab);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Enquiry Form State
  const defaultJoinDate = new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [planType, setPlanType] = useState('Full Monthly (Lunch + Dinner)');
  const [startDate, setStartDate] = useState(defaultJoinDate);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');
  const [enquirySuccess, setEnquirySuccess] = useState('');

  // Open Student Review Form State (No Login Needed)
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [foodQualityRating, setFoodQualityRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoadingDetails(true);
    api
      .getMessById(messId)
      .then((res) => {
        if (mounted) {
          setMess(res.mess);
          setLoadingDetails(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingDetails(false);
      });
    return () => {
      mounted = false;
    };
  }, [messId]);

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryError('');
    setEnquirySuccess('');
    setEnquirySubmitting(true);

    try {
      const res = await api.submitEnquiry(mess.id, {
        studentName,
        studentEmail,
        studentPhone,
        planType,
        startDate,
        message: enquiryMessage,
      });
      setEnquirySuccess(res.message);
      setEnquiryMessage('');
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : 'Could not send enquiry.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setReviewSubmitting(true);

    try {
      const res = await api.submitReview(mess.id, {
        studentName: reviewerName,
        rating,
        foodQualityRating,
        hygieneRating,
        comment: reviewComment,
      });
      setMess(res.mess);
      onMessDataUpdated(res.mess, res.stats);
      setReviewerName('');
      setReviewComment('');
      setReviewSuccess('Thank you! Your student review is now live.');
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#FFF4E3] text-[#191919] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#191919]/15"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner with Image */}
        <div className="relative h-56 sm:h-64 bg-[#191919] shrink-0">
          <MessImage
            imageKey={mess.imageKey}
            customImageUrl={mess.customImageUrl}
            alt={mess.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-[#191919]/45 to-black/25" />

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavourite(mess.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFavourite
                  ? 'bg-[#F0442B] text-white'
                  : 'bg-[#191919]/80 text-white hover:bg-[#191919]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavourite ? 'fill-white' : ''}`} />
              <span>{isFavourite ? 'Saved' : 'Save Mess'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-xl bg-[#191919]/80 text-white hover:bg-[#191919] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="text-xs font-bold tracking-wider text-[#FFD400] mb-1">
                {mess.category} · {mess.dietType}
                {mess.tiffinDelivery ? ' · DABBA DELIVERY' : ''}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{mess.name}</h2>
              <p className="text-xs sm:text-sm text-white/80 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#F0442B] shrink-0" />
                <span>{mess.location}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xs text-white/75">Monthly Full</div>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-[#FFD400]">
                  ₹{mess.monthlyPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-xs rounded-xl px-3 py-2 text-center">
                <div className="flex items-center gap-1 text-base font-extrabold tabular-nums text-[#FFD400]">
                  <Star className="w-4 h-4 fill-[#FFD400]" />
                  <span>{mess.rating.toFixed(1)}</span>
                </div>
                <div className="text-[11px] text-white/80 tabular-nums">
                  {mess.reviewCount} reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#191919] px-5 py-2.5 flex items-center gap-2 border-b border-white/10 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#F0442B] text-white'
                : 'text-[#FFF4E3]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Overview & 7-Day Menu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enquire')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'enquire'
                ? 'bg-[#FFD400] text-[#191919]'
                : 'text-[#FFF4E3]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Subscription Enquiry ({mess.availableSeats} Seats Open)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#19B783] text-[#191919]'
                : 'text-[#FFF4E3]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Student Reviews ({mess.reviews?.length || mess.reviewCount})
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'menu' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#191919]/10 space-y-3">
                  <h3 className="text-base font-extrabold text-[#191919]">About This Mess</h3>
                  <p className="text-sm text-[#4A4741] leading-relaxed">{mess.description}</p>
                  <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#191919]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#F0442B]" />
                      Lunch: {mess.lunchTiming}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#304FFE]" />
                      Dinner: {mess.dinnerTiming}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-[#19B783]" />
                      +91 {mess.contactPhone} ({mess.ownerName})
                    </span>
                  </div>

                  {mess.hygieneHighlights.length > 0 && (
                    <div className="pt-2 border-t border-[#191919]/10 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#148A61] font-semibold">
                      {mess.hygieneHighlights.map((item) => (
                        <span key={item} className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Plans Box */}
                <div className="bg-white p-5 rounded-2xl border border-[#191919]/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h3 className="text-base font-extrabold text-[#191919]">Meal Plans</h3>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-[#191919]/10">
                      <span className="text-[#57544E]">2-Time Monthly</span>
                      <span className="font-mono font-bold tabular-nums text-[#191919]">
                        ₹{mess.monthlyPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-[#191919]/10">
                      <span className="text-[#57544E]">1-Time Monthly</span>
                      <span className="font-mono font-bold tabular-nums text-[#191919]">
                        ₹{mess.halfMonthlyPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 border-b border-[#191919]/10">
                      <span className="text-[#57544E]">Single Trial Thali</span>
                      <span className="font-mono font-bold tabular-nums text-[#191919]">
                        ₹{mess.singlePlatePrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 font-bold text-[#148A61] tabular-nums">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Seat Availability
                      </span>
                      <span>
                        {mess.availableSeats} / {mess.totalSeats} open
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('enquire')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    Reserve / Enquire Now
                  </button>
                </div>
              </div>

              {mess.photos && mess.photos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-[#191919]">
                    Mess Kitchen & Thali Gallery
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {mess.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-xl overflow-hidden border border-[#191919]/10"
                      >
                        <div className="aspect-[4/3] bg-[#191919]">
                          <img
                            src={photo.imageData}
                            alt={photo.caption}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-3 py-2 text-xs font-semibold text-[#191919] truncate">
                          {photo.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#191919]/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#191919]/10 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#191919]">
                      Weekly Maharashtrian Menu
                    </h3>
                    <p className="text-xs text-[#6B6860]">
                      Speciality: <strong className="text-[#191919]">{mess.speciality}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#F0442B]">
                    Today is {currentDayName}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#FFF4E3]/70 text-xs font-bold text-[#57544E] border-b border-[#191919]/10">
                        <th className="py-3 px-4 w-32">Day</th>
                        <th className="py-3 px-4">Lunch ({mess.lunchTiming})</th>
                        <th className="py-3 px-4">Dinner ({mess.dinnerTiming})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#191919]/10">
                      {mess.weeklyMenu.map((row) => {
                        const isToday = row.day.toLowerCase() === currentDayName.toLowerCase();
                        return (
                          <tr
                            key={row.day}
                            className={isToday ? 'bg-[#FFD400]/20' : 'hover:bg-[#FFF4E3]/40'}
                          >
                            <td className="py-3 px-4 font-bold text-[#191919] whitespace-nowrap">
                              {row.day}
                              {isToday && (
                                <span className="block text-[10px] font-extrabold text-[#F0442B]">
                                  TODAY
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#2C2A27]">{row.lunch}</td>
                            <td className="py-3 px-4 text-[#2C2A27]">
                              {row.dinner}
                              {row.special && (
                                <span className="block text-xs font-bold text-[#304FFE] mt-0.5">
                                  Feast Highlight: {row.special}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'enquire' && (
            <div className="bg-white p-6 rounded-2xl border border-[#191919]/10 max-w-2xl mx-auto">
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-[#191919]">
                  Send Subscription Enquiry to {mess.name}
                </h3>
                <p className="text-sm text-[#6B6860] mt-1">
                  No login required — enter your details below and {mess.ownerName} will reach out
                  to confirm your seat.
                </p>
              </div>

              {enquirySuccess ? (
                <div className="p-5 rounded-xl bg-[#19B783]/15 border border-[#19B783]/40 space-y-3">
                  <div className="flex items-center gap-2 text-[#0F7A56] font-extrabold text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{enquirySuccess}</span>
                  </div>
                  <p className="text-sm text-[#191919]/80">
                    Your enquiry has been sent directly to the Mess Owner Dashboard and System
                    Admin Panel.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEnquirySuccess('')}
                    className="px-4 py-2 rounded-lg bg-[#191919] text-white text-xs font-bold cursor-pointer"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {enquiryError && (
                    <div className="p-3 rounded-lg bg-[#F0442B]/10 border border-[#F0442B]/30 text-xs font-bold text-[#F0442B]">
                      {enquiryError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g., Arjun Patil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        Mobile Number (WhatsApp / Call) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="e.g., 9890123456"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        College Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="arjun@college.edu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        Preferred Joining Date *
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#6B6860] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Select Subscription Plan *
                    </label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm bg-white focus:outline-2 focus:outline-[#F0442B]"
                    >
                      <option value="Full Monthly (Lunch + Dinner)">
                        Full Monthly (Lunch + Dinner) — ₹{mess.monthlyPrice.toLocaleString('en-IN')}/mo
                      </option>
                      <option value="One Time Daily (Lunch Only)">
                        One Time Daily (Lunch Only) — ₹{mess.halfMonthlyPrice.toLocaleString('en-IN')}/mo
                      </option>
                      <option value="One Time Daily (Dinner Only)">
                        One Time Daily (Dinner Only) — ₹{mess.halfMonthlyPrice.toLocaleString('en-IN')}/mo
                      </option>
                      <option value="Trial Week (7 Days)">
                        Trial Week (7 Days) — ₹{mess.singlePlatePrice * 12}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Note for Mess Owner (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Ask about tiffin delivery to your hostel, spice level, or group joining discount..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#F0442B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquirySubmitting}
                    className="w-full py-3 px-6 rounded-xl bg-[#F0442B] hover:bg-[#d93820] disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{enquirySubmitting ? 'Sending Enquiry...' : 'Submit Subscription Enquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Direct Student Review Form (No Student Login Required) */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#191919]/10 h-fit space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#191919]">
                    Rate & Review This Mess
                  </h3>
                  <p className="text-xs text-[#6B6860] mt-0.5">
                    Share your honest meal feedback to help fellow college students
                  </p>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                  {reviewError && (
                    <div className="p-2.5 rounded-lg bg-[#F0442B]/10 text-xs font-bold text-[#F0442B]">
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div className="p-2.5 rounded-lg bg-[#19B783]/15 text-xs font-bold text-[#0F7A56]">
                      {reviewSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Your Name & College / Branch *
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g., Sneha Patil (CSE TY)"
                      className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#19B783]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1.5">
                      Overall Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= rating
                                ? 'fill-[#FFD400] text-[#FFD400]'
                                : 'text-[#191919]/20'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-mono font-bold">{rating}/5</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        Taste & Quality
                      </label>
                      <select
                        value={foodQualityRating}
                        onChange={(e) => setFoodQualityRating(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#191919]/20 text-xs font-semibold bg-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} / 5 Stars
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#191919] mb-1">
                        Hygiene & Hall
                      </label>
                      <select
                        value={hygieneRating}
                        onChange={(e) => setHygieneRating(Number(e.target.value))}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#191919]/20 text-xs font-semibold bg-white"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} / 5 Stars
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Your Honest Review *
                    </label>
                    <textarea
                      rows={3}
                      required
                      minLength={8}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How are the chapatis/bhakris, rassa taste, and cleanliness?"
                      className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm focus:outline-2 focus:outline-[#19B783]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#19B783] hover:bg-[#149a6e] text-[#191919] font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    {reviewSubmitting ? 'Posting Review...' : 'Post Student Review'}
                  </button>
                </form>
              </div>

              {/* Reviews Feed */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-base font-extrabold text-[#191919]">
                  Student Feedback ({mess.reviews?.length || 0})
                </h3>
                {loadingDetails ? (
                  <div className="bg-white p-6 rounded-2xl text-sm text-[#6B6860]">
                    Loading student reviews...
                  </div>
                ) : mess.reviews && mess.reviews.length > 0 ? (
                  mess.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-[#191919]/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm text-[#191919]">{rev.studentName}</div>
                        <div className="flex items-center gap-1 text-xs font-bold tabular-nums text-[#191919]">
                          <Star className="w-3.5 h-3.5 fill-[#FFD400] text-[#FFD400]" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#3F3C37] leading-relaxed">{rev.comment}</p>
                      <div className="text-[11px] text-[#6B6860] flex items-center gap-2 pt-1">
                        <span>Taste: {rev.foodQualityRating}/5</span>
                        <span>·</span>
                        <span>Hygiene: {rev.hygieneRating}/5</span>
                        <span>·</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-6 rounded-2xl text-sm text-[#6B6860]">
                    No written reviews yet. Be the first student to share your meal experience!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

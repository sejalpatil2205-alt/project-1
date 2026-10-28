import React, { useEffect, useState } from 'react';
import {
  Save,
  Upload,
  Trash2,
  Users,
  IndianRupee,
  Star,
  Inbox,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { api, compressImageFile } from '../lib/api';
import { MessImage } from '../assets/MessImage';
import type {
  DailyMenu,
  EnquiryStatus,
  MessListing,
  MessSummaryStats,
  StudentEnquiry,
  UserProfile,
} from '../types';

interface OwnerDashboardProps {
  user: UserProfile;
  onBackToDiscover: () => void;
  onGlobalMessUpdated: (updated: MessListing, stats?: MessSummaryStats) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  user,
  onBackToDiscover,
  onGlobalMessUpdated,
}) => {
  const [mess, setMess] = useState<MessListing | null>(null);
  const [enquiries, setEnquiries] = useState<StudentEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enquiries' | 'details' | 'menu' | 'photos'>(
    'enquiries'
  );

  // Editable Form States
  const [monthlyPrice, setMonthlyPrice] = useState(2800);
  const [halfMonthlyPrice, setHalfMonthlyPrice] = useState(1550);
  const [singlePlatePrice, setSinglePlatePrice] = useState(70);
  const [availableSeats, setAvailableSeats] = useState(20);
  const [totalSeats, setTotalSeats] = useState(60);
  const [lunchTiming, setLunchTiming] = useState('');
  const [dinnerTiming, setDinnerTiming] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [dietType, setDietType] = useState<'Pure Veg' | 'Veg & Non-Veg'>('Pure Veg');
  const [tiffinDelivery, setTiffinDelivery] = useState(true);
  const [tagsText, setTagsText] = useState('');
  const [weeklyMenu, setWeeklyMenu] = useState<DailyMenu[]>([]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Photo Upload States
  const [photoCaption, setPhotoCaption] = useState('');
  const [setAsCover, setSetAsCover] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Enquiry Note Drafts
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const syncFormState = (m: MessListing) => {
    setMess(m);
    setMonthlyPrice(m.monthlyPrice);
    setHalfMonthlyPrice(m.halfMonthlyPrice);
    setSinglePlatePrice(m.singlePlatePrice);
    setAvailableSeats(m.availableSeats);
    setTotalSeats(m.totalSeats);
    setLunchTiming(m.lunchTiming);
    setDinnerTiming(m.dinnerTiming);
    setSpeciality(m.speciality);
    setLocation(m.location);
    setContactPhone(m.contactPhone);
    setDescription(m.description);
    setDietType(m.dietType);
    setTiffinDelivery(m.tiffinDelivery);
    setTagsText(m.tags.join(', '));
    setWeeklyMenu(m.weeklyMenu);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getOwnerDashboard()
      .then((res) => {
        if (!mounted) return;
        syncFormState(res.mess);
        setEnquiries(res.enquiries);
        const notes: Record<number, string> = {};
        for (const e of res.enquiries) {
          notes[e.id] = e.ownerNote || '';
        }
        setNoteDrafts(notes);
        setLoading(false);
      })
      .catch((err) => {
        if (mounted) {
          setFeedback({
            type: 'error',
            text: err instanceof Error ? err.message : 'Could not load owner dashboard.',
          });
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mess) return;
    setSaving(true);
    setFeedback(null);

    try {
      const parsedTags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.updateOwnerMess(mess.id, {
        monthlyPrice,
        halfMonthlyPrice,
        singlePlatePrice,
        availableSeats,
        totalSeats,
        lunchTiming,
        dinnerTiming,
        speciality,
        location,
        description,
        contactPhone,
        dietType,
        tiffinDelivery,
        tags: parsedTags,
        weeklyMenu,
      });

      syncFormState(res.mess);
      onGlobalMessUpdated(res.mess, res.stats);
      setFeedback({ type: 'success', text: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMenuChange = (index: number, field: keyof DailyMenu, value: string) => {
    setWeeklyMenu((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !mess) return;

    setUploadingPhoto(true);
    setFeedback(null);
    try {
      const compressedDataUrl = await compressImageFile(file, 1000);
      const res = await api.uploadOwnerPhoto(mess.id, {
        caption: photoCaption.trim() || `${mess.name} Fresh Thali`,
        imageData: compressedDataUrl,
        setAsCover,
      });
      syncFormState(res.mess);
      onGlobalMessUpdated(res.mess);
      setPhotoCaption('');
      setFeedback({ type: 'success', text: 'Food photograph uploaded to your mess listing!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not upload photograph.',
      });
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const res = await api.deleteOwnerPhoto(photoId);
      syncFormState(res.mess);
      onGlobalMessUpdated(res.mess);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete photograph.',
      });
    }
  };

  const handleEnquiryAction = async (enquiryId: number, status: EnquiryStatus) => {
    setFeedback(null);
    try {
      const res = await api.updateEnquiryStatus(enquiryId, {
        status,
        ownerNote: noteDrafts[enquiryId] || '',
      });
      syncFormState(res.mess);
      setEnquiries(res.enquiries);
      onGlobalMessUpdated(res.mess, res.stats);
      setFeedback({
        type: 'success',
        text: `Enquiry marked as ${status.toUpperCase()}. Seat availability synced.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update enquiry.',
      });
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-sm font-semibold text-[#6B6860]">
          Loading Mess Owner Dashboard...
        </div>
      </main>
    );
  }

  if (!mess) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 space-y-4">
          <p className="text-sm font-bold text-[#F0442B]">
            {feedback?.text || 'Could not find a mess listing for this account.'}
          </p>
          <button
            type="button"
            onClick={onBackToDiscover}
            className="px-4 py-2 rounded-xl bg-[#191919] text-white text-xs font-bold cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </main>
    );
  }

  const pendingCount = enquiries.filter((e) => e.status === 'pending').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-[#191919] text-[#FFF4E3] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-[#FFD400]">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onBackToDiscover}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD400] hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Public Discovery Page</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {mess.name} — Owner Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF4E3]/75">
            Managed by {user.name} · {mess.location}
          </p>
        </div>

        {/* 4 Live KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#FFD400]" />
              Monthly Fee
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-white mt-1">
              ₹{mess.monthlyPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#19B783]" />
              Open Seats
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#19B783] mt-1">
              {mess.availableSeats}/{mess.totalSeats}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#FFD400]" />
              Rating
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#FFD400] mt-1">
              {mess.rating.toFixed(1)} ({mess.reviewCount})
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5 text-[#F0442B]" />
              Pending
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-white mt-1">
              {pendingCount} New
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-[#19B783]/20 text-[#0B6345] border border-[#19B783]/40'
              : 'bg-[#F0442B]/15 text-[#F0442B] border border-[#F0442B]/30'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#191919]/15 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            activeTab === 'enquiries'
              ? 'bg-[#191919] text-[#FFD400]'
              : 'bg-white text-[#191919] hover:bg-[#191919]/10'
          }`}
        >
          Student Enquiries ({enquiries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'bg-[#191919] text-[#FFD400]'
              : 'bg-white text-[#191919] hover:bg-[#191919]/10'
          }`}
        >
          Prices, Timings & Seats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            activeTab === 'menu'
              ? 'bg-[#191919] text-[#FFD400]'
              : 'bg-white text-[#191919] hover:bg-[#191919]/10'
          }`}
        >
          Manage 7-Day Menu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
            activeTab === 'photos'
              ? 'bg-[#191919] text-[#FFD400]'
              : 'bg-white text-[#191919] hover:bg-[#191919]/10'
          }`}
        >
          Upload Food Photos ({mess.photos?.length || 0})
        </button>
      </div>

      {/* TAB 1: Student Enquiries Management */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-[#191919]/10 text-center text-sm text-[#6B6860]">
              No student subscription enquiries received yet.
            </div>
          ) : (
            enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-[#191919]/10 flex flex-col lg:flex-row justify-between gap-6"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-extrabold text-[#191919]">
                      {enq.studentName}
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#304FFE]">
                      {enq.planType}
                    </span>
                    <span className="text-xs font-bold text-[#6B6860]">
                      Status: <strong className="text-[#191919] uppercase">{enq.status}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#57544E] font-medium">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#19B783]" />
                      {enq.studentPhone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#F0442B]" />
                      {enq.studentEmail}
                    </span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#304FFE]" />
                      Start Date: {enq.startDate}
                    </span>
                  </div>

                  <p className="text-sm text-[#2C2A27] bg-[#FFF4E3]/70 p-3.5 rounded-xl">
                    “{enq.message}”
                  </p>
                </div>

                <div className="lg:w-80 space-y-3 shrink-0">
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      Reply Note for Student
                    </label>
                    <input
                      type="text"
                      value={noteDrafts[enq.id] ?? ''}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({ ...prev, [enq.id]: e.target.value }))
                      }
                      placeholder="e.g., Seat reserved! Visit at 1 PM for trial thali."
                      className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-xs focus:outline-2 focus:outline-[#304FFE]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEnquiryAction(enq.id, 'approved')}
                      className="py-2 px-2.5 rounded-lg bg-[#19B783] hover:bg-[#149a6e] text-[#191919] font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnquiryAction(enq.id, 'contacted')}
                      className="py-2 px-2.5 rounded-lg bg-[#304FFE] hover:bg-[#233fe0] text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Contacted</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnquiryAction(enq.id, 'declined')}
                      className="py-2 px-2.5 rounded-lg bg-[#F0442B]/15 hover:bg-[#F0442B] text-[#F0442B] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Prices, Timings & Seat Availability */}
      {activeTab === 'details' && (
        <form
          onSubmit={handleSaveMess}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-[#191919]/10 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Full Monthly Price (₹) *
              </label>
              <input
                type="number"
                min={1000}
                max={10000}
                required
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                1-Time Monthly Price (₹) *
              </label>
              <input
                type="number"
                min={500}
                max={8000}
                required
                value={halfMonthlyPrice}
                onChange={(e) => setHalfMonthlyPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Single Trial Plate (₹) *
              </label>
              <input
                type="number"
                min={30}
                max={500}
                required
                value={singlePlatePrice}
                onChange={(e) => setSinglePlatePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 font-mono text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Available Seats *
              </label>
              <input
                type="number"
                min={0}
                max={300}
                required
                value={availableSeats}
                onChange={(e) => setAvailableSeats(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Total Seat Capacity *
              </label>
              <input
                type="number"
                min={1}
                max={300}
                required
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Lunch Timings *
              </label>
              <input
                type="text"
                required
                value={lunchTiming}
                onChange={(e) => setLunchTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Dinner Timings *
              </label>
              <input
                type="text"
                required
                value={dinnerTiming}
                onChange={(e) => setDinnerTiming(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Signature Speciality Dishes *
              </label>
              <input
                type="text"
                required
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Full Address & Landmark *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1.5">Kitchen Type</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as 'Pure Veg' | 'Veg & Non-Veg')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm bg-white"
              >
                <option value="Pure Veg">Pure Veg</option>
                <option value="Veg & Non-Veg">Veg & Non-Veg</option>
              </select>
            </div>
            <label className="flex items-center gap-3 pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={tiffinDelivery}
                onChange={(e) => setTiffinDelivery(e.target.checked)}
                className="w-4 h-4 accent-[#F0442B]"
              />
              <span className="text-sm font-bold text-[#191919]">
                Offer Dabba / Tiffin Delivery to Nearby Hostels
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191919] mb-1.5">
              Mess Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white font-extrabold text-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Updates...' : 'Save Listing Details'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: Manage 7-Day Weekly Menu */}
      {activeTab === 'menu' && (
        <form
          onSubmit={handleSaveMess}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-[#191919]/10 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#191919]">
                Weekly Lunch & Dinner Menu Editor
              </h2>
              <p className="text-xs text-[#6B6860]">
                Update daily dishes so students see accurate live menus before walking over
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#19B783] hover:bg-[#149a6e] text-[#191919] font-extrabold text-xs sm:text-sm cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Menu...' : 'Publish Weekly Menu'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {weeklyMenu.map((dayRow, idx) => (
              <div
                key={dayRow.day}
                className="p-4 rounded-xl bg-[#FFF4E3]/55 border border-[#191919]/10 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center"
              >
                <div className="lg:col-span-2 font-extrabold text-sm text-[#191919]">
                  {dayRow.day}
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-[11px] font-bold text-[#6B6860] mb-1">Lunch</label>
                  <input
                    type="text"
                    value={dayRow.lunch}
                    onChange={(e) => handleMenuChange(idx, 'lunch', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#191919]/15 text-xs sm:text-sm"
                  />
                </div>
                <div className="lg:col-span-5">
                  <label className="block text-[11px] font-bold text-[#6B6860] mb-1">Dinner</label>
                  <input
                    type="text"
                    value={dayRow.dinner}
                    onChange={(e) => handleMenuChange(idx, 'dinner', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#191919]/15 text-xs sm:text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      {/* TAB 4: Upload Food Photographs */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#191919]/10 space-y-4 h-fit">
            <h2 className="text-lg font-extrabold text-[#191919]">Upload Fresh Food Photograph</h2>
            <p className="text-xs text-[#6B6860] leading-relaxed">
              Upload real photographs of your thali, kitchen hygiene, or Sunday special feast.
              Images are automatically optimized and stored in the database.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#191919] mb-1">Photo Caption</label>
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="e.g., Hot Jowar Bhakri & Bharli Vangi Thali"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#191919]/20 text-sm"
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsCover}
                onChange={(e) => setSetAsCover(e.target.checked)}
                className="w-4 h-4 accent-[#F0442B]"
              />
              <span className="text-xs font-bold text-[#191919]">
                Also set as main card cover photo
              </span>
            </label>

            <label className="w-full py-3.5 px-5 rounded-xl bg-[#FFD400] hover:bg-[#ffe033] text-[#191919] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploadingPhoto ? 'Uploading Photo...' : 'Choose Image File (JPEG / PNG)'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-[#191919]/10 space-y-3">
              <h3 className="text-sm font-extrabold text-[#191919]">Current Listing Cover</h3>
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#191919]">
                <MessImage
                  imageKey={mess.imageKey}
                  customImageUrl={mess.customImageUrl}
                  alt={mess.name}
                />
              </div>
            </div>

            {mess.photos && mess.photos.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-[#191919]/10 space-y-3">
                <h3 className="text-sm font-extrabold text-[#191919]">
                  Uploaded Gallery Photos ({mess.photos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mess.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl overflow-hidden border border-[#191919]/10 bg-[#FFF4E3]/40"
                    >
                      <div className="relative aspect-[4/3] bg-[#191919]">
                        <img
                          src={photo.imageData}
                          alt={photo.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          title="Delete photo"
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#191919]/80 text-white hover:bg-[#F0442B] flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-2 text-xs font-semibold truncate">{photo.caption}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Star,
  Users,
  Inbox,
  Store,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  AdminDashboardData,
  ButtonColorVariant,
  EnquiryStatus,
  MessListing,
  UserProfile,
} from '../types';

interface AdminDashboardProps {
  user: UserProfile;
  onBackToDiscover: () => void;
  onRefreshGlobalMesses: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onBackToDiscover,
  onRefreshGlobalMesses,
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messes' | 'enquiries' | 'reviews' | 'owners'>(
    'messes'
  );
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Add New Mess Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('POPULAR');
  const [newPrice, setNewPrice] = useState(2600);
  const [newSeats, setNewSeats] = useState(20);
  const [newTotalSeats, setNewTotalSeats] = useState(50);
  const [newLocation, setNewLocation] = useState('');
  const [newSpeciality, setNewSpeciality] = useState('');
  const [newDiet, setNewDiet] = useState<'Pure Veg' | 'Veg & Non-Veg'>('Pure Veg');
  const [newTiffin, setNewTiffin] = useState(true);
  const [newLunch, setNewLunch] = useState('12:30 PM – 2:45 PM');
  const [newDinner, setNewDinner] = useState('7:30 PM – 9:30 PM');
  const [newButtonColor, setNewButtonColor] = useState<ButtonColorVariant>('orange');
  const [newImageKey, setNewImageKey] = useState('pithla_bhakri');
  const [creatingMess, setCreatingMess] = useState(false);

  // Inline Edit Mess State
  const [editingMessId, setEditingMessId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    category: string;
    monthlyPrice: number;
    availableSeats: number;
    totalSeats: number;
    lunchTiming: string;
    dinnerTiming: string;
    speciality: string;
    location: string;
    contactPhone: string;
    dietType: 'Pure Veg' | 'Veg & Non-Veg';
    tiffinDelivery: boolean;
  } | null>(null);

  // Inline Delete Confirmation State
  const [confirmDeleteMessId, setConfirmDeleteMessId] = useState<number | null>(null);

  // Enquiry Filter & Reply Drafts
  const [enquiryFilter, setEnquiryFilter] = useState<'all' | EnquiryStatus>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard();
      setData(res);
      const notes: Record<number, string> = {};
      for (const e of res.enquiries) {
        notes[e.id] = e.ownerNote || '';
      }
      setNoteDrafts(notes);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load Admin Dashboard.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const startEditMess = (m: MessListing) => {
    setEditingMessId(m.id);
    setEditDraft({
      name: m.name,
      category: m.category,
      monthlyPrice: m.monthlyPrice,
      availableSeats: m.availableSeats,
      totalSeats: m.totalSeats,
      lunchTiming: m.lunchTiming,
      dinnerTiming: m.dinnerTiming,
      speciality: m.speciality,
      location: m.location,
      contactPhone: m.contactPhone,
      dietType: m.dietType,
      tiffinDelivery: m.tiffinDelivery,
    });
  };

  const handleSaveEditedMess = async (mess: MessListing) => {
    if (!editDraft) return;
    setFeedback(null);
    try {
      await api.updateOwnerMess(mess.id, {
        name: editDraft.name,
        category: editDraft.category,
        monthlyPrice: editDraft.monthlyPrice,
        halfMonthlyPrice: Math.round(editDraft.monthlyPrice * 0.55),
        singlePlatePrice: mess.singlePlatePrice,
        availableSeats: editDraft.availableSeats,
        totalSeats: editDraft.totalSeats,
        lunchTiming: editDraft.lunchTiming,
        dinnerTiming: editDraft.dinnerTiming,
        speciality: editDraft.speciality,
        location: editDraft.location,
        description: mess.description,
        contactPhone: editDraft.contactPhone,
        dietType: editDraft.dietType,
        tiffinDelivery: editDraft.tiffinDelivery,
        tags: mess.tags,
        weeklyMenu: mess.weeklyMenu,
      });
      setEditingMessId(null);
      setEditDraft(null);
      await loadDashboard();
      onRefreshGlobalMesses();
      setFeedback({ type: 'success', text: `Updated ${editDraft.name} successfully!` });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not update mess.',
      });
    }
  };

  const handleCreateMess = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingMess(true);
    setFeedback(null);

    try {
      const res = await api.adminCreateMess({
        name: newName,
        ownerName: newOwnerName,
        ownerEmail: newOwnerEmail,
        contactPhone: newPhone,
        category: newCategory,
        monthlyPrice: newPrice,
        availableSeats: newSeats,
        totalSeats: newTotalSeats,
        location: newLocation,
        speciality: newSpeciality,
        dietType: newDiet,
        tiffinDelivery: newTiffin,
        lunchTiming: newLunch,
        dinnerTiming: newDinner,
        buttonColor: newButtonColor,
        imageKey: newImageKey,
      });
      setData(res);
      onRefreshGlobalMesses();
      setShowAddForm(false);
      setNewName('');
      setNewOwnerName('');
      setNewOwnerEmail('');
      setNewPhone('');
      setNewLocation('');
      setNewSpeciality('');
      setFeedback({ type: 'success', text: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to add mess listing.',
      });
    } finally {
      setCreatingMess(false);
    }
  };

  const handleDeleteMess = async (messId: number) => {
    try {
      const res = await api.adminDeleteMess(messId);
      setData(res);
      setConfirmDeleteMessId(null);
      onRefreshGlobalMesses();
      setFeedback({ type: 'success', text: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete mess listing.',
      });
    }
  };

  const handleEnquiryStatus = async (enquiryId: number, status: EnquiryStatus) => {
    try {
      await api.updateEnquiryStatus(enquiryId, {
        status,
        ownerNote: noteDrafts[enquiryId] || '',
      });
      await loadDashboard();
      onRefreshGlobalMesses();
      setFeedback({
        type: 'success',
        text: `Enquiry #${enquiryId} updated to ${status.toUpperCase()}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update enquiry.',
      });
    }
  };

  const handleDeleteEnquiry = async (enquiryId: number) => {
    try {
      const res = await api.adminDeleteEnquiry(enquiryId);
      setData(res);
      setFeedback({ type: 'success', text: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete enquiry.',
      });
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const res = await api.adminDeleteReview(reviewId);
      setData(res);
      onRefreshGlobalMesses();
      setFeedback({ type: 'success', text: res.message });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete review.',
      });
    }
  };

  if (loading || !data) {
    return (
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-sm font-bold text-[#6B6860]">
          Loading System Administrator Panel...
        </div>
      </main>
    );
  }

  const filteredEnquiries =
    enquiryFilter === 'all'
      ? data.enquiries
      : data.enquiries.filter((e) => e.status === enquiryFilter);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 flex-1">
      {/* Admin Header Banner */}
      <div className="bg-[#191919] text-[#FFF4E3] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b-4 border-[#304FFE]">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onBackToDiscover}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD400] hover:underline mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </button>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#304FFE]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Admin Control Panel
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#FFF4E3]/75">
            Signed in as {user.name} ({user.email}) · Complete Platform Governance
          </p>
        </div>

        {/* 4 System KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-[#F0442B]" />
              Active Messes
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-white mt-1">
              {data.stats.totalMesses}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#19B783]" />
              Open Seats
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#19B783] mt-1">
              {data.stats.totalAvailableSeats}
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5 text-[#FFD400]" />
              Enquiries
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-[#FFD400] mt-1">
              {data.stats.totalEnquiries}{' '}
              <span className="text-xs font-sans font-normal text-white/75">
                ({data.stats.pendingEnquiries} new)
              </span>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5">
            <div className="text-[11px] text-[#FFF4E3]/70 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#FFD400]" />
              Platform Rating
            </div>
            <div className="text-xl font-extrabold font-mono tabular-nums text-white mt-1">
              {data.stats.avgRating.toFixed(1)} ({data.stats.totalReviews})
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Notification */}
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

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#191919]/15 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('messes')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === 'messes'
                ? 'bg-[#304FFE] text-white'
                : 'bg-white text-[#191919] hover:bg-[#191919]/10'
            }`}
          >
            All Mess Listings ({data.messes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === 'enquiries'
                ? 'bg-[#304FFE] text-white'
                : 'bg-white text-[#191919] hover:bg-[#191919]/10'
            }`}
          >
            All Student Enquiries ({data.enquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#304FFE] text-white'
                : 'bg-white text-[#191919] hover:bg-[#191919]/10'
            }`}
          >
            Moderate Reviews ({data.reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('owners')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${
              activeTab === 'owners'
                ? 'bg-[#304FFE] text-white'
                : 'bg-white text-[#191919] hover:bg-[#191919]/10'
            }`}
          >
            Mess Owners ({data.owners.length})
          </button>
        </div>

        {activeTab === 'messes' && (
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F0442B] hover:bg-[#d93820] text-white text-xs sm:text-sm font-extrabold cursor-pointer"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cancel' : 'Add New Mess'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: Manage All Mess Listings */}
      {activeTab === 'messes' && (
        <div className="space-y-6">
          {showAddForm && (
            <form
              onSubmit={handleCreateMess}
              className="bg-white p-6 rounded-2xl border-2 border-[#304FFE] space-y-5"
            >
              <div>
                <h2 className="text-lg font-extrabold text-[#191919]">
                  Add New Maharashtrian Mess Listing
                </h2>
                <p className="text-xs text-[#6B6860]">
                  Creates both the public mess listing and the Mess Owner login account
                  (default owner password: <code className="font-mono font-bold">Owner@123</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Mess Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Gokul Gharghuti Mess"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="e.g., Smt. Kavita Patil"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Owner Login Email *</label>
                  <input
                    type="email"
                    required
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    placeholder="gokul@messowner.in"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Available Seats *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Total Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTotalSeats}
                    onChange={(e) => setNewTotalSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Contact Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="9823011222"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Near DY Patil College, Kasba Bawda, Kolhapur"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Speciality Dishes *</label>
                  <input
                    type="text"
                    required
                    value={newSpeciality}
                    onChange={(e) => setNewSpeciality(e.target.value)}
                    placeholder="Bhakri, Pithla, Masala Bhat, Taak"
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Category Label</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Diet Type</label>
                  <select
                    value={newDiet}
                    onChange={(e) => setNewDiet(e.target.value as 'Pure Veg' | 'Veg & Non-Veg')}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm bg-white"
                  >
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Veg & Non-Veg">Veg & Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Card Theme Colour</label>
                  <select
                    value={newButtonColor}
                    onChange={(e) => setNewButtonColor(e.target.value as ButtonColorVariant)}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm bg-white"
                  >
                    <option value="orange">Red-Orange</option>
                    <option value="blue">Royal Blue</option>
                    <option value="green">Green</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Default Thali Photo</label>
                  <select
                    value={newImageKey}
                    onChange={(e) => setNewImageKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm bg-white"
                  >
                    <option value="pithla_bhakri">Pithla Bhakri Thali</option>
                    <option value="kolhapuri_thali">Kolhapuri Rassa Thali</option>
                    <option value="akkha_masoor">Akkha Masoor Meal</option>
                    <option value="varan_bhat">Pure Veg Varan Bhat</option>
                    <option value="sunday_feast">Sunday Thalipeeth Feast</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold mb-1">Lunch Timing</label>
                  <input
                    type="text"
                    value={newLunch}
                    onChange={(e) => setNewLunch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Dinner Timing</label>
                  <input
                    type="text"
                    value={newDinner}
                    onChange={(e) => setNewDinner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTiffin}
                    onChange={(e) => setNewTiffin(e.target.checked)}
                    className="w-4 h-4 accent-[#304FFE]"
                  />
                  <span className="text-xs font-bold">Dabba Delivery Available</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={creatingMess}
                className="py-3 px-6 rounded-xl bg-[#304FFE] hover:bg-[#233fe0] text-white font-extrabold text-sm cursor-pointer"
              >
                {creatingMess ? 'Creating Listing...' : 'Create Mess Listing'}
              </button>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-[#191919]/10 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px] text-sm">
              <thead>
                <tr className="bg-[#FFF4E3]/70 border-b border-[#191919]/10 text-xs font-extrabold text-[#57544E]">
                  <th className="py-3.5 px-4">Mess & Location</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Monthly Fee</th>
                  <th className="py-3.5 px-4">Open Seats</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#191919]/10">
                {data.messes.map((m) => {
                  const isEditing = editingMessId === m.id && editDraft !== null;
                  return (
                    <tr key={m.id} className="hover:bg-[#FFF4E3]/30 align-top">
                      <td className="py-4 px-4 max-w-xs">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft({ ...editDraft, name: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#191919]/25 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={editDraft.location}
                              onChange={(e) =>
                                setEditDraft({ ...editDraft, location: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#191919]/25 text-xs"
                            />
                            <input
                              type="text"
                              value={editDraft.speciality}
                              onChange={(e) =>
                                setEditDraft({ ...editDraft, speciality: e.target.value })
                              }
                              placeholder="Speciality"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-[#191919]/25 text-xs"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-extrabold text-[#191919]">{m.name}</div>
                            <div className="text-xs text-[#6B6860] mt-0.5">{m.location}</div>
                            <div className="text-xs text-[#57544E] mt-1">
                              Owner: <strong>{m.ownerName}</strong> ({m.contactPhone})
                            </div>
                          </>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDraft.category}
                            onChange={(e) =>
                              setEditDraft({ ...editDraft, category: e.target.value })
                            }
                            className="w-28 px-2.5 py-1.5 rounded-lg border border-[#191919]/25 text-xs font-bold uppercase"
                          />
                        ) : (
                          <span className="text-xs font-extrabold text-[#F0442B]">
                            {m.category}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono tabular-nums font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editDraft.monthlyPrice}
                            onChange={(e) =>
                              setEditDraft({
                                ...editDraft,
                                monthlyPrice: Number(e.target.value),
                              })
                            }
                            className="w-24 px-2.5 py-1.5 rounded-lg border border-[#191919]/25 text-xs font-mono"
                          />
                        ) : (
                          `₹${m.monthlyPrice.toLocaleString('en-IN')}`
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono tabular-nums">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editDraft.availableSeats}
                              onChange={(e) =>
                                setEditDraft({
                                  ...editDraft,
                                  availableSeats: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1.5 rounded-lg border border-[#191919]/25 text-xs"
                            />
                            <span>/</span>
                            <input
                              type="number"
                              value={editDraft.totalSeats}
                              onChange={(e) =>
                                setEditDraft({
                                  ...editDraft,
                                  totalSeats: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1.5 rounded-lg border border-[#191919]/25 text-xs"
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-[#148A61]">
                            {m.availableSeats} / {m.totalSeats}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-mono tabular-nums">
                        <span className="inline-flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#FFD400] text-[#FFD400]" />
                          {m.rating.toFixed(1)} ({m.reviewCount})
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEditedMess(m)}
                              className="px-3 py-1.5 rounded-lg bg-[#19B783] text-[#191919] text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMessId(null);
                                setEditDraft(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#191919]/10 text-xs font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : confirmDeleteMessId === m.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDeleteMess(m.id)}
                              className="px-3 py-1.5 rounded-lg bg-[#F0442B] text-white text-xs font-extrabold cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#191919]/10 text-xs font-bold cursor-pointer"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEditMess(m)}
                              className="px-3 py-1.5 rounded-lg bg-[#FFF4E3] hover:bg-[#FFD400] text-[#191919] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessId(m.id)}
                              className="p-1.5 rounded-lg text-[#F0442B] hover:bg-[#F0442B]/15 cursor-pointer"
                              title="Delete Mess"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: All Student Enquiries Across Platform */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'pending', 'approved', 'contacted', 'declined'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setEnquiryFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                  enquiryFilter === st
                    ? 'bg-[#191919] text-[#FFD400]'
                    : 'bg-white text-[#57544E] hover:text-[#191919]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredEnquiries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#191919]/10 text-center text-sm text-[#6B6860]">
              No enquiries found for this filter.
            </div>
          ) : (
            filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white p-5 rounded-2xl border border-[#191919]/10 flex flex-col lg:flex-row justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-extrabold text-[#F0442B] uppercase">
                      {enq.messName}
                    </span>
                    <span>·</span>
                    <span className="text-base font-extrabold text-[#191919]">
                      {enq.studentName}
                    </span>
                    <span className="text-xs font-bold text-[#304FFE]">{enq.planType}</span>
                    <span className="text-xs font-mono uppercase text-[#6B6860]">
                      [{enq.status}]
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#57544E]">
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
                      Start: {enq.startDate}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#2C2A27] bg-[#FFF4E3]/60 p-3 rounded-xl">
                    “{enq.message}”
                  </p>
                </div>

                <div className="lg:w-80 space-y-2.5 shrink-0">
                  <input
                    type="text"
                    value={noteDrafts[enq.id] ?? ''}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({ ...prev, [enq.id]: e.target.value }))
                    }
                    placeholder="Admin / Owner note..."
                    className="w-full px-3 py-2 rounded-xl border border-[#191919]/20 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEnquiryStatus(enq.id, 'approved')}
                      className="flex-1 py-2 px-2.5 rounded-lg bg-[#19B783] text-[#191919] text-xs font-extrabold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEnquiryStatus(enq.id, 'contacted')}
                      className="flex-1 py-2 px-2.5 rounded-lg bg-[#304FFE] text-white text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Contacted
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEnquiry(enq.id)}
                      title="Delete Enquiry"
                      className="p-2 rounded-lg text-[#F0442B] hover:bg-[#F0442B]/15 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Moderate Student Reviews */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-2xl border border-[#191919]/10 flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-[#304FFE] uppercase">
                      {rev.messName}
                    </div>
                    <div className="text-sm font-extrabold text-[#191919]">{rev.studentName}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-[#FFD400] text-[#FFD400]" />
                      {rev.rating}.0
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      title="Remove review"
                      className="p-1.5 rounded-lg text-[#F0442B] hover:bg-[#F0442B]/15 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[#3F3C37] leading-relaxed">{rev.comment}</p>
              </div>

              <div className="text-[11px] text-[#6B6860] flex items-center gap-2 pt-2 border-t border-[#191919]/10">
                <span>Taste: {rev.foodQualityRating}/5</span>
                <span>·</span>
                <span>Hygiene: {rev.hygieneRating}/5</span>
                <span>·</span>
                <span>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Mess Owners Directory */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-2xl border border-[#191919]/10 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px] text-sm">
            <thead>
              <tr className="bg-[#FFF4E3]/70 border-b border-[#191919]/10 text-xs font-extrabold text-[#57544E]">
                <th className="py-3.5 px-4">Owner Name</th>
                <th className="py-3.5 px-4">Assigned Mess</th>
                <th className="py-3.5 px-4">Login Email</th>
                <th className="py-3.5 px-4">Contact Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#191919]/10">
              {data.owners.map((o) => (
                <tr key={o.id} className="hover:bg-[#FFF4E3]/30">
                  <td className="py-3.5 px-4 font-extrabold text-[#191919]">{o.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#304FFE]">{o.collegeOrMess}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{o.email}</td>
                  <td className="py-3.5 px-4 font-mono text-xs">{o.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

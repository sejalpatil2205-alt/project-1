/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Scale,
  UtensilsCrossed,
} from 'lucide-react';
import {
  api,
  getLocalSavedMessIds,
  getStoredToken,
  setLocalSavedMessIds,
  setStoredToken,
} from './lib/api';
import { Navbar, type ActiveView } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MessCard } from './components/MessCard';
import { MessDetailModal } from './components/MessDetailModal';
import { CompareModal } from './components/CompareModal';
import { AuthModal } from './components/AuthModal';
import { StudentActivityView } from './components/StudentActivityView';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import type { MessListing, MessSummaryStats, UserProfile, UserRole } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('discover');
  const [allMesses, setAllMesses] = useState<MessListing[]>([]);
  const [stats, setStats] = useState<MessSummaryStats>({
    totalMesses: 10,
    minMonthlyPrice: 2300,
    avgRating: 4.2,
    totalAvailableSeats: 188,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter Controls
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'Pure Veg' | 'Veg & Non-Veg'>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(0);
  const [tiffinOnly, setTiffinOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Auth State (Admin & Mess Owner Only) + Browser-Saved Student Favourites
  const [user, setUser] = useState<UserProfile | null>(null);
  const [favouriteMessIds, setFavouriteMessIds] = useState<number[]>(() =>
    getLocalSavedMessIds()
  );
  const [authModalRole, setAuthModalRole] = useState<UserRole | null>(null);

  // Modals & Compare State
  const [comparedIds, setComparedIds] = useState<number[]>([1, 2]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedMessModal, setSelectedMessModal] = useState<{
    mess: MessListing;
    tab: 'menu' | 'enquire' | 'reviews';
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const listingsSectionRef = useRef<HTMLElement | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const fetchAllMesses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getMesses();
      setAllMesses(res.messes);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load mess listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMesses();

    const token = getStoredToken();
    if (token) {
      api
        .getCurrentUser()
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          setStoredToken(null);
        });
    }
  }, [fetchAllMesses]);

  const filteredMesses = useMemo(() => {
    let result = [...allMesses];

    const q = appliedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter((m) => {
        const text = [
          m.name,
          m.location,
          m.area,
          m.speciality,
          m.category,
          m.dietType,
          ...m.tags,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }

    if (dietFilter !== 'all') {
      result = result.filter((m) => m.dietType === dietFilter);
    }

    if (maxPriceFilter > 0) {
      result = result.filter((m) => m.monthlyPrice <= maxPriceFilter);
    }

    if (tiffinOnly) {
      result = result.filter((m) => m.tiffinDelivery);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    } else if (sortBy === 'rating_desc') {
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'seats_desc') {
      result.sort((a, b) => b.availableSeats - a.availableSeats);
    }

    return result;
  }, [allMesses, appliedSearch, dietFilter, maxPriceFilter, tiffinOnly, sortBy]);

  const scrollToListings = () => {
    listingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExecuteSearch = () => {
    setAppliedSearch(searchInput);
    scrollToListings();
  };

  const handleHeroStatAction = (action: 'all' | 'lowest_price' | 'top_rated' | 'compare') => {
    if (action === 'compare') {
      setCompareOpen(true);
      return;
    }
    setAppliedSearch('');
    setSearchInput('');
    setDietFilter('all');
    setMaxPriceFilter(0);
    setTiffinOnly(false);

    if (action === 'lowest_price') {
      setSortBy('price_asc');
    } else if (action === 'top_rated') {
      setSortBy('rating_desc');
    } else {
      setSortBy('featured');
    }
    scrollToListings();
  };

  const resetFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setDietFilter('all');
    setMaxPriceFilter(0);
    setTiffinOnly(false);
    setSortBy('featured');
  };

  // Instant browser-saved favourites without student login
  const handleToggleFavourite = (messId: number) => {
    setFavouriteMessIds((prev) => {
      const exists = prev.includes(messId);
      const next = exists ? prev.filter((id) => id !== messId) : [...prev, messId];
      setLocalSavedMessIds(next);
      showToast(exists ? 'Removed from saved messes.' : 'Saved to your shortlist!');
      return next;
    });
  };

  const handleToggleCompare = (messId: number) => {
    setComparedIds((prev) => {
      if (prev.includes(messId)) {
        return prev.filter((id) => id !== messId);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 messes at a time.');
        return prev;
      }
      return [...prev, messId];
    });
  };

  const handleAuthSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setAuthModalRole(null);
    if (loggedInUser.role === 'admin') {
      setActiveView('admin_dashboard');
      showToast('Signed in as System Administrator.');
    } else {
      setActiveView('owner_dashboard');
      showToast(`Welcome ${loggedInUser.name}! Opened Mess Owner Dashboard.`);
    }
    fetchAllMesses();
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    setActiveView('discover');
    showToast('Signed out successfully.');
  };

  const handleMessDataUpdated = (updatedMess: MessListing, updatedStats?: MessSummaryStats) => {
    setAllMesses((prev) => {
      const exists = prev.some((m) => m.id === updatedMess.id);
      if (exists) {
        return prev.map((m) => (m.id === updatedMess.id ? { ...m, ...updatedMess } : m));
      }
      return [...prev, updatedMess];
    });
    if (updatedStats) {
      setStats(updatedStats);
    }
  };

  const hasActiveFilters =
    Boolean(appliedSearch.trim()) ||
    dietFilter !== 'all' ||
    maxPriceFilter > 0 ||
    tiffinOnly ||
    sortBy !== 'featured';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF4E3] text-[#191919]">
      {/* Compact Dark Navigation Bar */}
      <Navbar
        activeView={activeView}
        onNavigate={setActiveView}
        user={user}
        favouriteCount={favouriteMessIds.length}
        compareCount={comparedIds.length}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenAuth={(role) => setAuthModalRole(role)}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#191919] text-[#FFF4E3] border-2 border-[#FFD400] px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-bold">
          {toastMessage}
        </div>
      )}

      {/* Active View */}
      {activeView === 'discover' && (
        <>
          <HeroSection
            searchInput={searchInput}
            onSearchInputChange={(val) => {
              setSearchInput(val);
              setAppliedSearch(val);
            }}
            onExecuteSearch={handleExecuteSearch}
            stats={stats}
            onStatAction={handleHeroStatAction}
          />

          {/* Discovery & Filter Workspace */}
          <main
            ref={listingsSectionRef}
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8"
          >
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#191919]">
                    Maharashtrian Messes Near Campus
                  </h2>
                  <p className="text-sm text-[#6B6860] mt-1">
                    Showing <strong className="text-[#191919]">{filteredMesses.length}</strong> of{' '}
                    <strong className="text-[#191919]">{allMesses.length}</strong> verified student
                    messes around Kasba Bawda, Kolhapur
                  </p>
                </div>

                {comparedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCompareOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#304FFE] hover:bg-[#233fe0] text-white text-xs sm:text-sm font-extrabold transition-colors self-start md:self-auto cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Compare Selected ({comparedIds.length}/3)</span>
                  </button>
                )}
              </div>

              {/* Filter & Sort Controls Bar */}
              <div className="bg-white p-4 rounded-2xl border border-[#191919]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#191919] pr-1">
                    <SlidersHorizontal className="w-4 h-4 text-[#F0442B]" />
                    Filters:
                  </span>

                  <div className="inline-flex items-center p-1 rounded-xl bg-[#FFF4E3]">
                    {(['all', 'Pure Veg', 'Veg & Non-Veg'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDietFilter(option)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          dietFilter === option
                            ? 'bg-[#191919] text-white'
                            : 'text-[#57544E] hover:text-[#191919]'
                        }`}
                      >
                        {option === 'all' ? 'All Kitchens' : option}
                      </button>
                    ))}
                  </div>

                  <select
                    aria-label="Filter by monthly budget"
                    value={maxPriceFilter}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[#FFF4E3] text-xs font-bold text-[#191919] border-0 cursor-pointer"
                  >
                    <option value={0}>Any Monthly Budget</option>
                    <option value={2500}>Up to ₹2,500 / mo</option>
                    <option value={2800}>Up to ₹2,800 / mo</option>
                    <option value={3000}>Up to ₹3,000 / mo</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setTiffinOnly((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      tiffinOnly
                        ? 'bg-[#19B783] text-[#191919]'
                        : 'bg-[#FFF4E3] text-[#57544E] hover:text-[#191919]'
                    }`}
                  >
                    Dabba Delivery Only
                  </button>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#F0442B] hover:bg-[#F0442B]/10 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="mess-sort" className="text-xs font-bold text-[#6B6860]">
                    Sort by:
                  </label>
                  <select
                    id="mess-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#FFF4E3] text-xs font-extrabold text-[#191919] cursor-pointer"
                  >
                    <option value="featured">Recommended Order</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Highest Student Rating</option>
                    <option value="seats_desc">Most Available Seats</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mess Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white rounded-2xl h-[430px] border border-[#191919]/10 animate-pulse p-5 flex flex-col justify-between"
                  >
                    <div className="h-48 bg-[#FFF4E3] rounded-xl" />
                    <div className="space-y-3">
                      <div className="h-5 bg-[#FFF4E3] rounded w-2/3" />
                      <div className="h-4 bg-[#FFF4E3] rounded w-full" />
                      <div className="h-10 bg-[#FFF4E3] rounded-xl w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white p-8 rounded-2xl border border-[#F0442B]/30 text-center space-y-3">
                <p className="text-sm font-bold text-[#F0442B]">{error}</p>
                <button
                  type="button"
                  onClick={fetchAllMesses}
                  className="px-5 py-2.5 rounded-xl bg-[#191919] text-white text-xs font-bold cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredMesses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#191919]/10 text-center space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-[#F0442B] mx-auto" />
                <h3 className="text-lg font-extrabold text-[#191919]">
                  No messes match your current filters
                </h3>
                <p className="text-sm text-[#6B6860] max-w-md mx-auto">
                  Try clearing your search query or adjusting the monthly budget filter to see all
                  Maharashtrian messes near campus.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#F0442B] text-white text-xs font-extrabold cursor-pointer"
                >
                  Show All Messes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredMesses.map((mess) => (
                  <MessCard
                    key={mess.id}
                    mess={mess}
                    isFavourite={favouriteMessIds.includes(mess.id)}
                    isCompared={comparedIds.includes(mess.id)}
                    onToggleFavourite={handleToggleFavourite}
                    onToggleCompare={handleToggleCompare}
                    onOpenDetails={(m, tab = 'menu') => setSelectedMessModal({ mess: m, tab })}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {activeView === 'saved_messes' && (
        <StudentActivityView
          allMesses={allMesses}
          favouriteMessIds={favouriteMessIds}
          comparedIds={comparedIds}
          onToggleFavourite={handleToggleFavourite}
          onToggleCompare={handleToggleCompare}
          onOpenDetails={(m, tab = 'menu') => setSelectedMessModal({ mess: m, tab })}
          onBackToDiscover={() => setActiveView('discover')}
        />
      )}

      {activeView === 'owner_dashboard' && user?.role === 'owner' && (
        <OwnerDashboard
          user={user}
          onBackToDiscover={() => setActiveView('discover')}
          onGlobalMessUpdated={handleMessDataUpdated}
        />
      )}

      {activeView === 'admin_dashboard' && user?.role === 'admin' && (
        <AdminDashboard
          user={user}
          onBackToDiscover={() => setActiveView('discover')}
          onRefreshGlobalMesses={fetchAllMesses}
        />
      )}

      {/* Clean Footer */}
      <footer className="bg-[#191919] text-[#FFF4E3]/80 border-t-2 border-[#F0442B] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <UtensilsCrossed className="w-4 h-4 text-[#FFD400]" />
            <span className="font-bold text-white">Mess Finding System</span>
            <span>·</span>
            <span>Find Your Daily Meal, Sorted</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveView('discover');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white cursor-pointer"
            >
              Discover Messes
            </button>
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="hover:text-white cursor-pointer"
            >
              Compare Prices
            </button>
            <button
              type="button"
              onClick={() => setAuthModalRole('owner')}
              className="text-[#FFD400] font-semibold hover:underline cursor-pointer"
            >
              Owner Login
            </button>
            <button
              type="button"
              onClick={() => setAuthModalRole('admin')}
              className="text-[#304FFE] font-bold hover:underline cursor-pointer"
            >
              Admin Login
            </button>
          </div>

          <div className="text-[#FFF4E3]/60 text-center sm:text-right">
            College Mini-Project Demonstration · Kasba Bawda, Kolhapur
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedMessModal && (
        <MessDetailModal
          messId={selectedMessModal.mess.id}
          initialMess={selectedMessModal.mess}
          initialTab={selectedMessModal.tab}
          isFavourite={favouriteMessIds.includes(selectedMessModal.mess.id)}
          onToggleFavourite={handleToggleFavourite}
          onClose={() => setSelectedMessModal(null)}
          onMessDataUpdated={handleMessDataUpdated}
        />
      )}

      {compareOpen && (
        <CompareModal
          allMesses={allMesses}
          comparedIds={comparedIds}
          onToggleCompare={handleToggleCompare}
          onClearCompare={() => setComparedIds([])}
          onSelectForEnquiry={(mess) => setSelectedMessModal({ mess, tab: 'enquire' })}
          onClose={() => setCompareOpen(false)}
        />
      )}

      {authModalRole && (
        <AuthModal
          defaultRole={authModalRole}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModalRole(null)}
        />
      )}
    </div>
  );
}

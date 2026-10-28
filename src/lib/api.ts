import type {
  AdminDashboardData,
  ButtonColorVariant,
  DailyMenu,
  EnquiryStatus,
  MessListing,
  MessSummaryStats,
  StudentEnquiry,
  UserProfile,
} from '../types';

const TOKEN_STORAGE_KEY = 'mfs_auth_token';
const SAVED_MESS_STORAGE_KEY = 'mfs_saved_mess_ids';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getLocalSavedMessIds(): number[] {
  try {
    const raw = localStorage.getItem(SAVED_MESS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

export function setLocalSavedMessIds(ids: number[]): void {
  try {
    localStorage.setItem(SAVED_MESS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  getMesses(params?: {
    q?: string;
    diet?: string;
    maxPrice?: number;
    minRating?: number;
    tiffin?: boolean;
    sort?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.diet && params.diet !== 'all') search.set('diet', params.diet);
    if (params?.maxPrice && params.maxPrice > 0) search.set('maxPrice', String(params.maxPrice));
    if (params?.minRating && params.minRating > 0) search.set('minRating', String(params.minRating));
    if (params?.tiffin) search.set('tiffin', 'true');
    if (params?.sort) search.set('sort', params.sort);

    const qs = search.toString();
    return apiFetch<{ messes: MessListing[]; stats: MessSummaryStats }>(
      `/api/messes${qs ? `?${qs}` : ''}`
    );
  },

  getMessById(id: number) {
    return apiFetch<{ mess: MessListing }>(`/api/messes/${id}`);
  },

  login(email: string, password: string) {
    return apiFetch<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  registerOwner(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    collegeOrMess: string;
  }) {
    return apiFetch<{ token: string; user: UserProfile }>('/api/auth/register-owner', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser() {
    return apiFetch<{ user: UserProfile }>('/api/auth/me');
  },

  submitEnquiry(
    messId: number,
    payload: {
      studentName: string;
      studentEmail: string;
      studentPhone: string;
      planType: string;
      startDate: string;
      message: string;
    }
  ) {
    return apiFetch<{ enquiry: StudentEnquiry; message: string }>(
      `/api/messes/${messId}/enquiries`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  submitReview(
    messId: number,
    payload: {
      studentName: string;
      rating: number;
      foodQualityRating: number;
      hygieneRating: number;
      comment: string;
    }
  ) {
    return apiFetch<{ mess: MessListing; stats: MessSummaryStats }>(
      `/api/messes/${messId}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  getOwnerDashboard() {
    return apiFetch<{ mess: MessListing; enquiries: StudentEnquiry[] }>('/api/owner/dashboard');
  },

  updateOwnerMess(
    messId: number,
    payload: {
      name?: string;
      category?: string;
      monthlyPrice: number;
      halfMonthlyPrice: number;
      singlePlatePrice: number;
      availableSeats: number;
      totalSeats: number;
      lunchTiming: string;
      dinnerTiming: string;
      speciality: string;
      location: string;
      description: string;
      contactPhone: string;
      dietType: 'Pure Veg' | 'Veg & Non-Veg';
      tiffinDelivery: boolean;
      tags: string[];
      weeklyMenu: DailyMenu[];
    }
  ) {
    return apiFetch<{ mess: MessListing; stats: MessSummaryStats; message: string }>(
      `/api/owner/mess/${messId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  uploadOwnerPhoto(
    messId: number,
    payload: { caption: string; imageData: string; setAsCover: boolean }
  ) {
    return apiFetch<{ mess: MessListing; message: string }>(
      `/api/owner/mess/${messId}/photos`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  deleteOwnerPhoto(photoId: number) {
    return apiFetch<{ mess: MessListing }>(`/api/owner/photos/${photoId}`, {
      method: 'DELETE',
    });
  },

  updateEnquiryStatus(
    enquiryId: number,
    payload: { status: EnquiryStatus; ownerNote: string }
  ) {
    return apiFetch<{
      mess: MessListing;
      enquiries: StudentEnquiry[];
      stats: MessSummaryStats;
    }>(`/api/owner/enquiries/${enquiryId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  // Admin API Methods
  getAdminDashboard() {
    return apiFetch<AdminDashboardData>('/api/admin/dashboard');
  },

  adminCreateMess(payload: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    contactPhone: string;
    category: string;
    monthlyPrice: number;
    availableSeats: number;
    totalSeats: number;
    location: string;
    speciality: string;
    dietType: 'Pure Veg' | 'Veg & Non-Veg';
    tiffinDelivery: boolean;
    lunchTiming: string;
    dinnerTiming: string;
    buttonColor: ButtonColorVariant;
    imageKey: string;
  }) {
    return apiFetch<AdminDashboardData & { message: string }>('/api/admin/messes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  adminDeleteMess(messId: number) {
    return apiFetch<AdminDashboardData & { message: string }>(`/api/admin/messes/${messId}`, {
      method: 'DELETE',
    });
  },

  adminDeleteEnquiry(enquiryId: number) {
    return apiFetch<AdminDashboardData & { message: string }>(
      `/api/admin/enquiries/${enquiryId}`,
      {
        method: 'DELETE',
      }
    );
  },

  adminDeleteReview(reviewId: number) {
    return apiFetch<AdminDashboardData & { message: string }>(`/api/admin/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

export async function compressImageFile(file: File, maxWidth = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        resolve(compressed);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

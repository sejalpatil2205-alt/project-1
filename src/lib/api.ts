import type {
  DailyMenu,
  EnquiryStatus,
  MessListing,
  MessSummaryStats,
  StudentEnquiry,
  UserProfile,
  UserRole,
} from '../types';

const TOKEN_STORAGE_KEY = 'mfs_auth_token';

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
    // Ignore storage quota errors in restricted frames
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
    return apiFetch<{ token: string; user: UserProfile; favouriteMessIds: number[] }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },

  register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    collegeOrMess: string;
  }) {
    return apiFetch<{ token: string; user: UserProfile; favouriteMessIds: number[] }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  getCurrentUser() {
    return apiFetch<{ user: UserProfile; favouriteMessIds: number[] }>('/api/auth/me');
  },

  toggleFavourite(messId: number) {
    return apiFetch<{ saved: boolean; favouriteMessIds: number[] }>(
      `/api/messes/${messId}/favourite`,
      { method: 'POST' }
    );
  },

  getFavourites() {
    return apiFetch<{ messes: MessListing[] }>('/api/favourites');
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

  getStudentEnquiries() {
    return apiFetch<{ enquiries: StudentEnquiry[] }>('/api/student/enquiries');
  },

  submitReview(
    messId: number,
    payload: {
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

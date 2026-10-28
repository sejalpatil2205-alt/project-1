export type UserRole = 'admin' | 'owner';

export type ButtonColorVariant = 'orange' | 'blue' | 'green';

export type EnquiryStatus = 'pending' | 'approved' | 'contacted' | 'declined';

export interface DailyMenu {
  day: string;
  lunch: string;
  dinner: string;
  special?: string;
}

export interface MessPhoto {
  id: number;
  messId: number;
  caption: string;
  imageData: string;
  createdAt: string;
}

export interface MessReview {
  id: number;
  messId: number;
  messName?: string;
  studentId: number | null;
  studentName: string;
  rating: number;
  foodQualityRating: number;
  hygieneRating: number;
  comment: string;
  createdAt: string;
}

export interface MessListing {
  id: number;
  slug: string;
  ownerId: number;
  ownerName: string;
  name: string;
  category: string;
  monthlyPrice: number;
  halfMonthlyPrice: number;
  singlePlatePrice: number;
  rating: number;
  reviewCount: number;
  availableSeats: number;
  totalSeats: number;
  location: string;
  area: string;
  dietType: 'Pure Veg' | 'Veg & Non-Veg';
  tiffinDelivery: boolean;
  speciality: string;
  tags: string[];
  weeklyMenu: DailyMenu[];
  lunchTiming: string;
  dinnerTiming: string;
  buttonColor: ButtonColorVariant;
  imageKey: string;
  customImageUrl: string | null;
  contactPhone: string;
  description: string;
  hygieneHighlights: string[];
  updatedAt: string;
  photos?: MessPhoto[];
  reviews?: MessReview[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  collegeOrMess: string;
  createdAt: string;
}

export interface StudentEnquiry {
  id: number;
  messId: number;
  messName: string;
  messLocation?: string;
  studentId: number | null;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  planType: string;
  startDate: string;
  message: string;
  status: EnquiryStatus;
  ownerNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessSummaryStats {
  totalMesses: number;
  minMonthlyPrice: number;
  avgRating: number;
  totalAvailableSeats: number;
}

export interface AdminDashboardData {
  stats: MessSummaryStats & {
    totalEnquiries: number;
    pendingEnquiries: number;
    totalReviews: number;
    totalOwners: number;
  };
  messes: MessListing[];
  enquiries: StudentEnquiry[];
  reviews: MessReview[];
  owners: UserProfile[];
}

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hashPassword } from './auth.ts';
import { INITIAL_MESSES } from './seedData.ts';
import type {
  AdminDashboardData,
  ButtonColorVariant,
  DailyMenu,
  EnquiryStatus,
  MessListing,
  MessPhoto,
  MessReview,
  MessSummaryStats,
  StudentEnquiry,
  UserProfile,
  UserRole,
} from '../src/types.ts';

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  collegeOrMess: string;
  createdAt: string;
}

interface DatabaseSchema {
  nextIds: {
    user: number;
    mess: number;
    photo: number;
    enquiry: number;
    review: number;
  };
  users: StoredUser[];
  messes: MessListing[];
  photos: MessPhoto[];
  enquiries: StudentEnquiry[];
  reviews: MessReview[];
}

function resolveWritableStoragePath(): string {
  // On Cloud Run (K_SERVICE set), /tmp is guaranteed writable in-memory tmpfs
  const candidates = process.env.K_SERVICE
    ? [path.join(os.tmpdir(), 'mess_finding_system_db.json')]
    : [
        path.resolve(process.cwd(), 'data', 'mess_finding_system_db.json'),
        path.join(os.tmpdir(), 'mess_finding_system_db.json'),
      ];

  for (const filePath of candidates) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
      return filePath;
    } catch {
      // Try next writable location
    }
  }
  return path.join(os.tmpdir(), 'mess_finding_system_db.json');
}

const STORAGE_FILE = resolveWritableStoragePath();

let state: DatabaseSchema = {
  nextIds: { user: 1, mess: 1, photo: 1, enquiry: 1, review: 1 },
  users: [],
  messes: [],
  photos: [],
  enquiries: [],
  reviews: [],
};

function persistState(): void {
  try {
    const tempFile = `${STORAGE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tempFile, STORAGE_FILE);
  } catch (err) {
    console.warn('Database persistence warning (continuing in-memory):', err);
  }
}

export function createDefaultMenu(): DailyMenu[] {
  return [
    { day: 'Monday', lunch: '3 Chapati, Matki Usal, Varan Bhat, Salad', dinner: '2 Bhakri, Pithla, Steamed Rice, Thecha' },
    { day: 'Tuesday', lunch: '3 Chapati, Bharli Vangi, Amti, Rice', dinner: '3 Chapati, Dal Tadka, Jeera Rice' },
    { day: 'Wednesday', lunch: '3 Chapati, Veg Kolhapuri, Varan Bhat, Taak', dinner: '3 Chapati, Aloo Gobi, Dal Fry, Rice' },
    { day: 'Thursday', lunch: '3 Chapati, Chavali Usal, Kadhi, Rice', dinner: '2 Bhakri, Zunka, Steamed Rice' },
    { day: 'Friday', lunch: '3 Chapati, Shev Bhaji, Amti, Indrayani Rice', dinner: '3 Chapati, Akkha Masoor, Jeera Rice' },
    { day: 'Saturday', lunch: '3 Chapati, Kala Chana Rassa, Varan Bhat', dinner: 'Dal Khichdi, Papad, Koshimbir' },
    { day: 'Sunday', lunch: 'Sunday Feast: Masale Bhat, Chapati, Kurma, Gulab Jamun', dinner: 'Sunday Evening Closed', special: 'Gulab Jamun' },
  ];
}

function buildInitialSeed(): DatabaseSchema {
  const nowIso = new Date().toISOString();
  const adminPasswordHash = hashPassword('Admin@123');
  const ownerPasswordHash = hashPassword('Owner@123');

  const seeded: DatabaseSchema = {
    nextIds: { user: 1, mess: 1, photo: 1, enquiry: 1, review: 1 },
    users: [],
    messes: [],
    photos: [],
    enquiries: [],
    reviews: [],
  };

  // 1. Seed System Administrator
  seeded.users.push({
    id: seeded.nextIds.user++,
    name: 'System Administrator',
    email: 'admin@messsystem.in',
    phone: '9823000001',
    passwordHash: adminPasswordHash,
    role: 'admin',
    collegeOrMess: 'Mess Finding System Admin',
    createdAt: nowIso,
  });

  // 2. Seed all 10 Maharashtrian Messes + Owners + Reviews + Sample Enquiries
  for (const item of INITIAL_MESSES) {
    const ownerId = seeded.nextIds.user++;
    seeded.users.push({
      id: ownerId,
      name: item.ownerName,
      email: item.ownerEmail.toLowerCase(),
      phone: item.ownerPhone,
      passwordHash: ownerPasswordHash,
      role: 'owner',
      collegeOrMess: item.name,
      createdAt: nowIso,
    });

    const messId = seeded.nextIds.mess++;
    seeded.messes.push({
      id: messId,
      slug: item.slug,
      ownerId,
      ownerName: item.ownerName,
      name: item.name,
      category: item.category,
      monthlyPrice: item.monthlyPrice,
      halfMonthlyPrice: item.halfMonthlyPrice,
      singlePlatePrice: item.singlePlatePrice,
      rating: item.rating,
      reviewCount: item.reviewCount,
      availableSeats: item.availableSeats,
      totalSeats: item.totalSeats,
      location: item.location,
      area: item.area,
      dietType: item.dietType,
      tiffinDelivery: item.tiffinDelivery,
      speciality: item.speciality,
      tags: [...item.tags],
      weeklyMenu: item.weeklyMenu.map((d) => ({ ...d })),
      lunchTiming: item.lunchTiming,
      dinnerTiming: item.dinnerTiming,
      buttonColor: item.buttonColor,
      imageKey: item.imageKey,
      customImageUrl: null,
      contactPhone: item.ownerPhone,
      description: item.description,
      hygieneHighlights: [...item.hygieneHighlights],
      updatedAt: nowIso,
    });

    for (const rev of item.initialReviews) {
      const revDate = new Date(Date.now() - rev.daysAgo * 86400 * 1000).toISOString();
      seeded.reviews.push({
        id: seeded.nextIds.review++,
        messId,
        messName: item.name,
        studentId: null,
        studentName: rev.studentName,
        rating: rev.rating,
        foodQualityRating: rev.foodQualityRating,
        hygieneRating: rev.hygieneRating,
        comment: rev.comment,
        createdAt: revDate,
      });
    }

    if (item.slug === 'annapurna-mess' || item.slug === 'randive-mess') {
      seeded.enquiries.push({
        id: seeded.nextIds.enquiry++,
        messId,
        messName: item.name,
        messLocation: item.location,
        studentId: null,
        studentName: 'Arjun Patil',
        studentEmail: 'arjun.patil@student.edu',
        studentPhone: '9890123456',
        planType: 'Full Monthly (Lunch + Dinner)',
        startDate: new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
        message:
          'Hello, I stay near Kasba Bawda Datta Mandir and want to join from next week. Are 2 seats open for me and my roommate?',
        status: 'pending',
        ownerNote: '',
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }
  }

  return seeded;
}

export function initializeDatabase(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (parsed && Array.isArray(parsed.messes) && parsed.messes.length > 0) {
        state = parsed;
        // Guarantee admin user exists
        const hasAdmin = state.users.some((u) => u.email === 'admin@messsystem.in');
        if (!hasAdmin) {
          state.users.unshift({
            id: state.nextIds.user++,
            name: 'System Administrator',
            email: 'admin@messsystem.in',
            phone: '9823000001',
            passwordHash: hashPassword('Admin@123'),
            role: 'admin',
            collegeOrMess: 'Mess Finding System Admin',
            createdAt: new Date().toISOString(),
          });
          persistState();
        }
        return;
      }
    }
  } catch (err) {
    console.warn('Re-initializing seed database:', err);
  }

  state = buildInitialSeed();
  persistState();
}

export function toPublicUser(u: StoredUser): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    collegeOrMess: u.collegeOrMess,
    createdAt: u.createdAt,
  };
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const normalized = email.trim().toLowerCase();
  return state.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: number): StoredUser | undefined {
  return state.users.find((u) => u.id === id);
}

export function getSummaryStats(): MessSummaryStats {
  if (state.messes.length === 0) {
    return {
      totalMesses: 0,
      minMonthlyPrice: 0,
      avgRating: 0,
      totalAvailableSeats: 0,
    };
  }
  const totalMesses = state.messes.length;
  const minMonthlyPrice = Math.min(...state.messes.map((m) => m.monthlyPrice));
  const avgRating = Number(
    (state.messes.reduce((sum, m) => sum + m.rating, 0) / totalMesses).toFixed(1)
  );
  const totalAvailableSeats = state.messes.reduce((sum, m) => sum + m.availableSeats, 0);

  return {
    totalMesses,
    minMonthlyPrice,
    avgRating,
    totalAvailableSeats,
  };
}

export function listAllMesses(): MessListing[] {
  return state.messes.map((m) => ({ ...m }));
}

export function getMessDetailsById(messId: number): MessListing | null {
  const mess = state.messes.find((m) => m.id === messId);
  if (!mess) return null;

  const photos = state.photos
    .filter((p) => p.messId === messId)
    .sort((a, b) => b.id - a.id);

  const reviews = state.reviews
    .filter((r) => r.messId === messId)
    .sort((a, b) => b.id - a.id);

  return {
    ...mess,
    photos,
    reviews,
  };
}

export function getMessByOwnerId(ownerId: number): MessListing | null {
  const found = state.messes.find((m) => m.ownerId === ownerId);
  return found ? getMessDetailsById(found.id) : null;
}

export function registerOwnerWithMess(params: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  messName: string;
  buttonColor?: ButtonColorVariant;
  category?: string;
  monthlyPrice?: number;
  availableSeats?: number;
  totalSeats?: number;
  location?: string;
  speciality?: string;
  dietType?: 'Pure Veg' | 'Veg & Non-Veg';
  tiffinDelivery?: boolean;
  lunchTiming?: string;
  dinnerTiming?: string;
  imageKey?: string;
}): StoredUser {
  const nowIso = new Date().toISOString();
  const userId = state.nextIds.user++;
  const newUser: StoredUser = {
    id: userId,
    name: params.name,
    email: params.email.toLowerCase(),
    phone: params.phone,
    passwordHash: params.passwordHash,
    role: 'owner',
    collegeOrMess: params.messName,
    createdAt: nowIso,
  };
  state.users.push(newUser);

  const messId = state.nextIds.mess++;
  const monthlyPrice = params.monthlyPrice || 2600;
  const availableSeats = params.availableSeats ?? 20;
  const totalSeats = Math.max(availableSeats, params.totalSeats || 45);
  const slug = `${params.messName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${messId}`;

  state.messes.push({
    id: messId,
    slug,
    ownerId: userId,
    ownerName: params.name,
    name: params.messName,
    category: (params.category || 'NEW LISTING').toUpperCase(),
    monthlyPrice,
    halfMonthlyPrice: Math.round(monthlyPrice * 0.55),
    singlePlatePrice: 70,
    rating: 4.2,
    reviewCount: 1,
    availableSeats,
    totalSeats,
    location: params.location || 'Near College Road, Kasba Bawda, Kolhapur',
    area: 'Kasba Bawda',
    dietType: params.dietType || 'Pure Veg',
    tiffinDelivery: params.tiffinDelivery ?? true,
    speciality: params.speciality || 'Chapati, Bhakri, Varan Bhat, Homestyle Bhaji',
    tags: ['Homestyle', params.dietType || 'Pure Veg', 'Maharashtrian'],
    weeklyMenu: createDefaultMenu(),
    lunchTiming: params.lunchTiming || '12:30 PM – 2:45 PM',
    dinnerTiming: params.dinnerTiming || '7:30 PM – 9:30 PM',
    buttonColor: params.buttonColor || 'orange',
    imageKey: params.imageKey || 'pithla_bhakri',
    customImageUrl: null,
    contactPhone: params.phone,
    description: `${params.messName} offers fresh homestyle Maharashtrian meals near campus.`,
    hygieneHighlights: ['RO Drinking Water', 'Fresh Daily Cooking', 'Clean Dining Space'],
    updatedAt: nowIso,
  });

  persistState();
  return newUser;
}

export function createStudentEnquiry(params: {
  messId: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  planType: string;
  startDate: string;
  message: string;
}): StudentEnquiry | null {
  const mess = state.messes.find((m) => m.id === params.messId);
  if (!mess) return null;

  const nowIso = new Date().toISOString();
  const enquiry: StudentEnquiry = {
    id: state.nextIds.enquiry++,
    messId: mess.id,
    messName: mess.name,
    messLocation: mess.location,
    studentId: null,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    studentPhone: params.studentPhone,
    planType: params.planType,
    startDate: params.startDate,
    message: params.message,
    status: 'pending',
    ownerNote: '',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  state.enquiries.unshift(enquiry);
  persistState();
  return enquiry;
}

export function addStudentReview(params: {
  messId: number;
  studentName: string;
  rating: number;
  foodQualityRating: number;
  hygieneRating: number;
  comment: string;
}): MessListing | null {
  const mess = state.messes.find((m) => m.id === params.messId);
  if (!mess) return null;

  const nowIso = new Date().toISOString();
  state.reviews.unshift({
    id: state.nextIds.review++,
    messId: mess.id,
    messName: mess.name,
    studentId: null,
    studentName: params.studentName,
    rating: params.rating,
    foodQualityRating: params.foodQualityRating,
    hygieneRating: params.hygieneRating,
    comment: params.comment,
    createdAt: nowIso,
  });

  const nextCount = mess.reviewCount + 1;
  mess.rating = Number(
    ((mess.rating * mess.reviewCount + params.rating) / nextCount).toFixed(1)
  );
  mess.reviewCount = nextCount;
  mess.updatedAt = nowIso;

  persistState();
  return getMessDetailsById(mess.id);
}

export function listEnquiriesForMess(messId: number): StudentEnquiry[] {
  return state.enquiries
    .filter((e) => e.messId === messId)
    .sort((a, b) => b.id - a.id);
}

export function updateMessRecord(
  messId: number,
  updates: Partial<MessListing>
): MessListing | null {
  const mess = state.messes.find((m) => m.id === messId);
  if (!mess) return null;

  Object.assign(mess, updates, { updatedAt: new Date().toISOString() });
  // Keep enquiry & review messName synced if mess renamed
  if (updates.name) {
    for (const e of state.enquiries) {
      if (e.messId === messId) e.messName = updates.name;
    }
    for (const r of state.reviews) {
      if (r.messId === messId) r.messName = updates.name;
    }
  }
  persistState();
  return getMessDetailsById(messId);
}

export function addMessPhoto(params: {
  messId: number;
  caption: string;
  imageData: string;
  setAsCover: boolean;
}): MessListing | null {
  const mess = state.messes.find((m) => m.id === params.messId);
  if (!mess) return null;

  const nowIso = new Date().toISOString();
  state.photos.unshift({
    id: state.nextIds.photo++,
    messId: mess.id,
    caption: params.caption,
    imageData: params.imageData,
    createdAt: nowIso,
  });

  if (params.setAsCover) {
    mess.customImageUrl = params.imageData;
    mess.updatedAt = nowIso;
  }

  persistState();
  return getMessDetailsById(mess.id);
}

export function removeMessPhoto(
  photoId: number,
  requesterId: number,
  isAdmin: boolean
): MessListing | null {
  const idx = state.photos.findIndex((p) => p.id === photoId);
  if (idx === -1) return null;

  const photo = state.photos[idx];
  const mess = state.messes.find((m) => m.id === photo.messId);
  if (!mess) return null;
  if (!isAdmin && mess.ownerId !== requesterId) return null;

  state.photos.splice(idx, 1);
  if (mess.customImageUrl === photo.imageData) {
    mess.customImageUrl = null;
  }

  persistState();
  return getMessDetailsById(mess.id);
}

export function updateEnquiryRecord(
  enquiryId: number,
  requesterId: number,
  isAdmin: boolean,
  status: EnquiryStatus,
  ownerNote: string
): { mess: MessListing; enquiries: StudentEnquiry[] } | null {
  const enquiry = state.enquiries.find((e) => e.id === enquiryId);
  if (!enquiry) return null;

  const mess = state.messes.find((m) => m.id === enquiry.messId);
  if (!mess) return null;
  if (!isAdmin && mess.ownerId !== requesterId) return null;

  if (enquiry.status !== 'approved' && status === 'approved' && mess.availableSeats > 0) {
    mess.availableSeats -= 1;
  } else if (enquiry.status === 'approved' && status !== 'approved') {
    mess.availableSeats = Math.min(mess.totalSeats, mess.availableSeats + 1);
  }

  const nowIso = new Date().toISOString();
  enquiry.status = status;
  enquiry.ownerNote = ownerNote;
  enquiry.updatedAt = nowIso;
  mess.updatedAt = nowIso;

  persistState();
  return {
    mess: getMessDetailsById(mess.id)!,
    enquiries: listEnquiriesForMess(mess.id),
  };
}

export function getAdminDashboardSnapshot(): AdminDashboardData {
  const baseStats = getSummaryStats();
  const totalEnquiries = state.enquiries.length;
  const pendingEnquiries = state.enquiries.filter((e) => e.status === 'pending').length;
  const totalReviews = state.reviews.length;
  const owners = state.users.filter((u) => u.role === 'owner').map(toPublicUser);

  return {
    stats: {
      ...baseStats,
      totalEnquiries,
      pendingEnquiries,
      totalReviews,
      totalOwners: owners.length,
    },
    messes: listAllMesses(),
    enquiries: [...state.enquiries].sort((a, b) => b.id - a.id),
    reviews: [...state.reviews].sort((a, b) => b.id - a.id),
    owners,
  };
}

export function deleteMessById(messId: number): string | null {
  const idx = state.messes.findIndex((m) => m.id === messId);
  if (idx === -1) return null;

  const [removed] = state.messes.splice(idx, 1);
  state.users = state.users.filter((u) => !(u.id === removed.ownerId && u.role === 'owner'));
  state.photos = state.photos.filter((p) => p.messId !== messId);
  state.enquiries = state.enquiries.filter((e) => e.messId !== messId);
  state.reviews = state.reviews.filter((r) => r.messId !== messId);

  persistState();
  return removed.name;
}

export function deleteEnquiryById(enquiryId: number): boolean {
  const before = state.enquiries.length;
  state.enquiries = state.enquiries.filter((e) => e.id !== enquiryId);
  if (state.enquiries.length !== before) {
    persistState();
    return true;
  }
  return false;
}

export function deleteReviewById(reviewId: number): boolean {
  const idx = state.reviews.findIndex((r) => r.id === reviewId);
  if (idx === -1) return false;

  const [removed] = state.reviews.splice(idx, 1);
  const mess = state.messes.find((m) => m.id === removed.messId);
  if (mess && mess.reviewCount > 1) {
    const nextCount = mess.reviewCount - 1;
    const nextAvg = Math.min(
      5,
      Math.max(1, Number(((mess.rating * mess.reviewCount - removed.rating) / nextCount).toFixed(1)))
    );
    mess.rating = nextAvg;
    mess.reviewCount = nextCount;
  }

  persistState();
  return true;
}

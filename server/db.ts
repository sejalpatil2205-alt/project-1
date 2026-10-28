import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { hashPassword } from './auth.ts';
import { INITIAL_MESSES } from './seedData.ts';
import type {
  DailyMenu,
  MessListing,
  MessPhoto,
  MessReview,
  MessSummaryStats,
  StudentEnquiry,
  UserProfile,
} from '../src/types.ts';

const dbFilePath = process.env.DB_PATH || path.resolve(process.cwd(), 'data', 'mess_system.db');
const dbDir = path.dirname(dbFilePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbFilePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  // Check if an older schema without 'admin' role exists; if so, migrate cleanly
  const existingUsersTable = db
    .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'")
    .get() as { sql: string } | undefined;

  if (existingUsersTable && !existingUsersTable.sql.includes("'admin'")) {
    db.pragma('foreign_keys = OFF');
    const migrateTx = db.transaction(() => {
      db.exec(`
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL DEFAULT '',
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
          college_or_mess TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL
        );

        INSERT INTO users_new (id, name, email, phone, password_hash, role, college_or_mess, created_at)
        SELECT id, name, email, phone, password_hash, role, college_or_mess, created_at
        FROM users
        WHERE role = 'owner';

        DROP TABLE IF EXISTS favourites;
        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;

        CREATE TABLE reviews_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mess_id INTEGER NOT NULL,
          student_id INTEGER,
          student_name TEXT NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          food_quality_rating INTEGER NOT NULL CHECK (food_quality_rating >= 1 AND food_quality_rating <= 5),
          hygiene_rating INTEGER NOT NULL CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
          comment TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE
        );

        INSERT INTO reviews_new (id, mess_id, student_id, student_name, rating, food_quality_rating, hygiene_rating, comment, created_at)
        SELECT id, mess_id, NULL, student_name, rating, food_quality_rating, hygiene_rating, comment, created_at
        FROM reviews;

        DROP TABLE reviews;
        ALTER TABLE reviews_new RENAME TO reviews;
      `);
    });
    migrateTx();
    db.pragma('foreign_keys = ON');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'owner')),
      college_or_mess TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      owner_id INTEGER NOT NULL,
      owner_name TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      monthly_price INTEGER NOT NULL,
      half_monthly_price INTEGER NOT NULL,
      single_plate_price INTEGER NOT NULL,
      rating REAL NOT NULL,
      review_count INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      total_seats INTEGER NOT NULL,
      location TEXT NOT NULL,
      area TEXT NOT NULL,
      diet_type TEXT NOT NULL,
      tiffin_delivery INTEGER NOT NULL DEFAULT 0,
      speciality TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      weekly_menu_json TEXT NOT NULL,
      lunch_timing TEXT NOT NULL,
      dinner_timing TEXT NOT NULL,
      button_color TEXT NOT NULL,
      image_key TEXT NOT NULL,
      custom_image_url TEXT,
      contact_phone TEXT NOT NULL,
      description TEXT NOT NULL,
      hygiene_highlights_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS mess_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mess_id INTEGER NOT NULL,
      caption TEXT NOT NULL,
      image_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mess_id INTEGER NOT NULL,
      student_id INTEGER,
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      student_phone TEXT NOT NULL,
      plan_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'contacted', 'declined')),
      owner_note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mess_id INTEGER NOT NULL,
      student_id INTEGER,
      student_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      food_quality_rating INTEGER NOT NULL CHECK (food_quality_rating >= 1 AND food_quality_rating <= 5),
      hygiene_rating INTEGER NOT NULL CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (mess_id) REFERENCES messes(id) ON DELETE CASCADE
    );
  `);

  const nowIso = new Date().toISOString();

  // Always ensure the System Administrator account exists
  const adminExists = db
    .prepare("SELECT id FROM users WHERE email = 'admin@messsystem.in'")
    .get();

  if (!adminExists) {
    db.prepare(
      `INSERT INTO users (name, email, phone, password_hash, role, college_or_mess, created_at)
       VALUES (?, ?, ?, ?, 'admin', ?, ?)`
    ).run(
      'System Administrator',
      'admin@messsystem.in',
      '9823000001',
      hashPassword('Admin@123'),
      'Mess Finding System Admin',
      nowIso
    );
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM messes').get() as { count: number };
  if (countRow.count > 0) {
    return;
  }

  const ownerPasswordHash = hashPassword('Owner@123');

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role, college_or_mess, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMess = db.prepare(`
    INSERT INTO messes (
      slug, owner_id, owner_name, name, category, monthly_price, half_monthly_price,
      single_plate_price, rating, review_count, available_seats, total_seats,
      location, area, diet_type, tiffin_delivery, speciality, tags_json,
      weekly_menu_json, lunch_timing, dinner_timing, button_color, image_key,
      custom_image_url, contact_phone, description, hygiene_highlights_json, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (
      mess_id, student_id, student_name, rating, food_quality_rating, hygiene_rating, comment, created_at
    ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)
  `);

  const insertEnquiry = db.prepare(`
    INSERT INTO enquiries (
      mess_id, student_id, student_name, student_email, student_phone,
      plan_type, start_date, message, status, owner_note, created_at, updated_at
    ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedTx = db.transaction(() => {
    for (const item of INITIAL_MESSES) {
      const ownerRes = insertUser.run(
        item.ownerName,
        item.ownerEmail.toLowerCase(),
        item.ownerPhone,
        ownerPasswordHash,
        'owner',
        item.name,
        nowIso
      );
      const ownerId = Number(ownerRes.lastInsertRowid);

      const messRes = insertMess.run(
        item.slug,
        ownerId,
        item.ownerName,
        item.name,
        item.category,
        item.monthlyPrice,
        item.halfMonthlyPrice,
        item.singlePlatePrice,
        item.rating,
        item.reviewCount,
        item.availableSeats,
        item.totalSeats,
        item.location,
        item.area,
        item.dietType,
        item.tiffinDelivery ? 1 : 0,
        item.speciality,
        JSON.stringify(item.tags),
        JSON.stringify(item.weeklyMenu),
        item.lunchTiming,
        item.dinnerTiming,
        item.buttonColor,
        item.imageKey,
        null,
        item.ownerPhone,
        item.description,
        JSON.stringify(item.hygieneHighlights),
        nowIso
      );

      const messId = Number(messRes.lastInsertRowid);

      for (const rev of item.initialReviews) {
        const revDate = new Date(Date.now() - rev.daysAgo * 86400 * 1000).toISOString();
        insertReview.run(
          messId,
          rev.studentName,
          rev.rating,
          rev.foodQualityRating,
          rev.hygieneRating,
          rev.comment,
          revDate
        );
      }

      if (item.slug === 'annapurna-mess' || item.slug === 'randive-mess') {
        insertEnquiry.run(
          messId,
          'Arjun Patil',
          'arjun.patil@student.edu',
          '9890123456',
          'Full Monthly (Lunch + Dinner)',
          new Date(Date.now() + 2 * 86400 * 1000).toISOString().slice(0, 10),
          'Hello, I stay near Kasba Bawda Datta Mandir and want to join from next week. Are 2 seats open for me and my roommate?',
          'pending',
          '',
          nowIso,
          nowIso
        );
      }
    }
  });

  seedTx();
}

interface RawMessRow {
  id: number;
  slug: string;
  owner_id: number;
  owner_name: string;
  name: string;
  category: string;
  monthly_price: number;
  half_monthly_price: number;
  single_plate_price: number;
  rating: number;
  review_count: number;
  available_seats: number;
  total_seats: number;
  location: string;
  area: string;
  diet_type: 'Pure Veg' | 'Veg & Non-Veg';
  tiffin_delivery: number;
  speciality: string;
  tags_json: string;
  weekly_menu_json: string;
  lunch_timing: string;
  dinner_timing: string;
  button_color: 'orange' | 'blue' | 'green';
  image_key: string;
  custom_image_url: string | null;
  contact_phone: string;
  description: string;
  hygiene_highlights_json: string;
  updated_at: string;
}

export function mapMessRow(row: RawMessRow): MessListing {
  let tags: string[] = [];
  let weeklyMenu: DailyMenu[] = [];
  let hygieneHighlights: string[] = [];
  try {
    tags = JSON.parse(row.tags_json);
  } catch {
    tags = [];
  }
  try {
    weeklyMenu = JSON.parse(row.weekly_menu_json);
  } catch {
    weeklyMenu = [];
  }
  try {
    hygieneHighlights = JSON.parse(row.hygiene_highlights_json);
  } catch {
    hygieneHighlights = [];
  }

  return {
    id: row.id,
    slug: row.slug,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    name: row.name,
    category: row.category,
    monthlyPrice: row.monthly_price,
    halfMonthlyPrice: row.half_monthly_price,
    singlePlatePrice: row.single_plate_price,
    rating: Number(row.rating.toFixed(1)),
    reviewCount: row.review_count,
    availableSeats: row.available_seats,
    totalSeats: row.total_seats,
    location: row.location,
    area: row.area,
    dietType: row.diet_type,
    tiffinDelivery: Boolean(row.tiffin_delivery),
    speciality: row.speciality,
    tags,
    weeklyMenu,
    lunchTiming: row.lunch_timing,
    dinnerTiming: row.dinner_timing,
    buttonColor: row.button_color,
    imageKey: row.image_key,
    customImageUrl: row.custom_image_url,
    contactPhone: row.contact_phone,
    description: row.description,
    hygieneHighlights,
    updatedAt: row.updated_at,
  };
}

export function getSummaryStats(): MessSummaryStats {
  const row = db
    .prepare(
      `SELECT
        COUNT(*) as totalMesses,
        COALESCE(MIN(monthly_price), 2300) as minMonthlyPrice,
        COALESCE(AVG(rating), 4.2) as avgRating,
        COALESCE(SUM(available_seats), 0) as totalAvailableSeats
      FROM messes`
    )
    .get() as {
    totalMesses: number;
    minMonthlyPrice: number;
    avgRating: number;
    totalAvailableSeats: number;
  };

  return {
    totalMesses: row.totalMesses,
    minMonthlyPrice: row.minMonthlyPrice,
    avgRating: Number(row.avgRating.toFixed(1)),
    totalAvailableSeats: row.totalAvailableSeats,
  };
}

export function getMessDetailsById(messId: number): MessListing | null {
  const row = db.prepare('SELECT * FROM messes WHERE id = ?').get(messId) as RawMessRow | undefined;
  if (!row) return null;
  const mess = mapMessRow(row);

  const photosRows = db
    .prepare('SELECT id, mess_id, caption, image_data, created_at FROM mess_photos WHERE mess_id = ? ORDER BY id DESC')
    .all(messId) as { id: number; mess_id: number; caption: string; image_data: string; created_at: string }[];

  const reviewsRows = db
    .prepare(
      'SELECT id, mess_id, student_id, student_name, rating, food_quality_rating, hygiene_rating, comment, created_at FROM reviews WHERE mess_id = ? ORDER BY id DESC'
    )
    .all(messId) as {
    id: number;
    mess_id: number;
    student_id: number | null;
    student_name: string;
    rating: number;
    food_quality_rating: number;
    hygiene_rating: number;
    comment: string;
    created_at: string;
  }[];

  const photos: MessPhoto[] = photosRows.map((p) => ({
    id: p.id,
    messId: p.mess_id,
    caption: p.caption,
    imageData: p.image_data,
    createdAt: p.created_at,
  }));

  const reviews: MessReview[] = reviewsRows.map((r) => ({
    id: r.id,
    messId: r.mess_id,
    studentId: r.student_id,
    studentName: r.student_name,
    rating: r.rating,
    foodQualityRating: r.food_quality_rating,
    hygieneRating: r.hygiene_rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));

  return {
    ...mess,
    photos,
    reviews,
  };
}

export function mapUserProfile(row: {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'owner';
  college_or_mess: string;
  created_at: string;
}): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    collegeOrMess: row.college_or_mess,
    createdAt: row.created_at,
  };
}

export function mapEnquiryRow(row: {
  id: number;
  mess_id: number;
  mess_name: string;
  mess_location?: string;
  student_id: number | null;
  student_name: string;
  student_email: string;
  student_phone: string;
  plan_type: string;
  start_date: string;
  message: string;
  status: 'pending' | 'approved' | 'contacted' | 'declined';
  owner_note: string;
  created_at: string;
  updated_at: string;
}): StudentEnquiry {
  return {
    id: row.id,
    messId: row.mess_id,
    messName: row.mess_name,
    messLocation: row.mess_location,
    studentId: row.student_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    studentPhone: row.student_phone,
    planType: row.plan_type,
    startDate: row.start_date,
    message: row.message,
    status: row.status,
    ownerNote: row.owner_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

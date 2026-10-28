import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  db,
  initializeDatabase,
  mapMessRow,
  getSummaryStats,
  getMessDetailsById,
  mapUserProfile,
  mapEnquiryRow,
} from './server/db.ts';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  requireAuth,
  requireOwner,
  extractOptionalUser,
} from './server/auth.ts';
import type { AuthenticatedRequest } from './server/auth.ts';
import type { DailyMenu } from './src/types.ts';

initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support JSON payloads including compressed food photo uploads up to 4MB
app.use(express.json({ limit: '4mb' }));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{8,15}$/;

// 1. Health Check for Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mess-finding-system',
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication Routes
app.post('/api/auth/register', (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const password = String(req.body.password || '');
    const role = req.body.role === 'owner' ? 'owner' : 'student';
    const collegeOrMess = String(req.body.collegeOrMess || '').trim();

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Full name must be between 2 and 80 characters.' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const passwordHash = hashPassword(password);

    const registerTx = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO users (name, email, phone, password_hash, role, college_or_mess, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          name,
          email,
          phone || '9800000000',
          passwordHash,
          role,
          collegeOrMess || (role === 'owner' ? `${name}'s Mess` : 'Kolhapur Campus'),
          nowIso
        );

      const userId = Number(result.lastInsertRowid);

      // If a brand-new Mess Owner registers, create their starter Maharashtrian mess listing automatically
      if (role === 'owner') {
        const messTitle = collegeOrMess.length >= 3 ? collegeOrMess : `${name}'s Gharghuti Mess`;
        const slug = `${messTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${userId}`;
        const defaultMenu: DailyMenu[] = [
          { day: 'Monday', lunch: '3 Chapati, Matki Usal, Varan Bhat, Salad', dinner: '2 Bhakri, Pithla, Steamed Rice, Thecha' },
          { day: 'Tuesday', lunch: '3 Chapati, Bharli Vangi, Amti, Rice', dinner: '3 Chapati, Dal Tadka, Jeera Rice' },
          { day: 'Wednesday', lunch: '3 Chapati, Veg Kolhapuri, Varan Bhat, Taak', dinner: '3 Chapati, Aloo Gobi, Dal Fry, Rice' },
          { day: 'Thursday', lunch: '3 Chapati, Chavali Usal, Kadhi, Rice', dinner: '2 Bhakri, Zunka, Steamed Rice' },
          { day: 'Friday', lunch: '3 Chapati, Shev Bhaji, Amti, Indrayani Rice', dinner: '3 Chapati, Akkha Masoor, Jeera Rice' },
          { day: 'Saturday', lunch: '3 Chapati, Kala Chana Rassa, Varan Bhat', dinner: 'Dal Khichdi, Papad, Koshimbir' },
          { day: 'Sunday', lunch: 'Sunday Feast: Masale Bhat, Chapati, Kurma, Gulab Jamun', dinner: 'Sunday Evening Closed', special: 'Gulab Jamun' },
        ];

        db.prepare(
          `INSERT INTO messes (
            slug, owner_id, owner_name, name, category, monthly_price, half_monthly_price,
            single_plate_price, rating, review_count, available_seats, total_seats,
            location, area, diet_type, tiffin_delivery, speciality, tags_json,
            weekly_menu_json, lunch_timing, dinner_timing, button_color, image_key,
            custom_image_url, contact_phone, description, hygiene_highlights_json, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          slug,
          userId,
          name,
          messTitle,
          'NEW LISTING',
          2600,
          1450,
          70,
          4.2,
          1,
          20,
          45,
          'Near College Road, Kasba Bawda, Kolhapur',
          'Kasba Bawda',
          'Pure Veg',
          1,
          'Chapati, Bhakri, Varan Bhat, Homestyle Bhaji',
          JSON.stringify(['Homestyle', 'Pure Veg', 'Maharashtrian']),
          JSON.stringify(defaultMenu),
          '12:30 PM – 2:45 PM',
          '7:30 PM – 9:30 PM',
          'orange',
          'pithla_bhakri',
          null,
          phone || '9800000000',
          'Freshly registered homestyle Maharashtrian student mess near campus.',
          JSON.stringify(['RO Drinking Water', 'Fresh Daily Cooking', 'Clean Dining Space']),
          nowIso
        );
      }

      return userId;
    });

    const newUserId = registerTx();
    const userRow = db
      .prepare('SELECT id, name, email, phone, role, college_or_mess, created_at FROM users WHERE id = ?')
      .get(newUserId) as {
      id: number;
      name: string;
      email: string;
      phone: string;
      role: 'student' | 'owner';
      college_or_mess: string;
      created_at: string;
    };

    const token = signAuthToken({
      userId: userRow.id,
      email: userRow.email,
      role: userRow.role,
      name: userRow.name,
    });

    res.status(201).json({
      token,
      user: mapUserProfile(userRow),
      favouriteMessIds: [],
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Unable to complete registration. Please try again.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const userRow = db
      .prepare('SELECT id, name, email, phone, password_hash, role, college_or_mess, created_at FROM users WHERE email = ?')
      .get(email) as
      | {
          id: number;
          name: string;
          email: string;
          phone: string;
          password_hash: string;
          role: 'student' | 'owner';
          college_or_mess: string;
          created_at: string;
        }
      | undefined;

    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
      return;
    }

    const favRows = db
      .prepare('SELECT mess_id FROM favourites WHERE user_id = ?')
      .all(userRow.id) as { mess_id: number }[];

    const token = signAuthToken({
      userId: userRow.id,
      email: userRow.email,
      role: userRow.role,
      name: userRow.name,
    });

    res.json({
      token,
      user: mapUserProfile(userRow),
      favouriteMessIds: favRows.map((f) => f.mess_id),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Sign-in failed due to a server error.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.userId;
  const userRow = db
    .prepare('SELECT id, name, email, phone, role, college_or_mess, created_at FROM users WHERE id = ?')
    .get(userId) as
    | {
        id: number;
        name: string;
        email: string;
        phone: string;
        role: 'student' | 'owner';
        college_or_mess: string;
        created_at: string;
      }
    | undefined;

  if (!userRow) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const favRows = db
    .prepare('SELECT mess_id FROM favourites WHERE user_id = ?')
    .all(userRow.id) as { mess_id: number }[];

  res.json({
    user: mapUserProfile(userRow),
    favouriteMessIds: favRows.map((f) => f.mess_id),
  });
});

// 3. Public Mess Discovery & Filtering Routes
app.get('/api/messes', (req, res) => {
  try {
    const q = String(req.query.q || '').trim().toLowerCase();
    const diet = String(req.query.diet || 'all');
    const maxPrice = Number(req.query.maxPrice) || 0;
    const minRating = Number(req.query.minRating) || 0;
    const tiffinOnly = req.query.tiffin === 'true';
    const sortBy = String(req.query.sort || 'featured');

    const rows = db.prepare('SELECT * FROM messes ORDER BY id ASC').all() as Parameters<typeof mapMessRow>[0][];
    let messes = rows.map(mapMessRow);

    if (q) {
      messes = messes.filter((m) => {
        const haystack = [
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
        return haystack.includes(q);
      });
    }

    if (diet === 'Pure Veg' || diet === 'Veg & Non-Veg') {
      messes = messes.filter((m) => m.dietType === diet);
    }

    if (maxPrice > 0) {
      messes = messes.filter((m) => m.monthlyPrice <= maxPrice);
    }

    if (minRating > 0) {
      messes = messes.filter((m) => m.rating >= minRating);
    }

    if (tiffinOnly) {
      messes = messes.filter((m) => m.tiffinDelivery);
    }

    if (sortBy === 'price_asc') {
      messes.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    } else if (sortBy === 'price_desc') {
      messes.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    } else if (sortBy === 'rating_desc') {
      messes.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'seats_desc') {
      messes.sort((a, b) => b.availableSeats - a.availableSeats);
    }

    res.json({
      messes,
      stats: getSummaryStats(),
    });
  } catch (err) {
    console.error('Error fetching messes:', err);
    res.status(500).json({ error: 'Failed to load mess listings.' });
  }
});

app.get('/api/messes/:id', (req, res) => {
  const messId = Number(req.params.id);
  if (!Number.isInteger(messId) || messId <= 0) {
    res.status(400).json({ error: 'Invalid mess ID.' });
    return;
  }

  const details = getMessDetailsById(messId);
  if (!details) {
    res.status(404).json({ error: 'Mess listing not found.' });
    return;
  }

  res.json({ mess: details });
});

// 4. Student Favourites Routes
app.post('/api/messes/:id/favourite', requireAuth, (req: AuthenticatedRequest, res) => {
  const messId = Number(req.params.id);
  const userId = req.authUser!.userId;

  const messExists = db.prepare('SELECT id FROM messes WHERE id = ?').get(messId);
  if (!messExists) {
    res.status(404).json({ error: 'Mess not found.' });
    return;
  }

  const existing = db
    .prepare('SELECT 1 FROM favourites WHERE user_id = ? AND mess_id = ?')
    .get(userId, messId);

  if (existing) {
    db.prepare('DELETE FROM favourites WHERE user_id = ? AND mess_id = ?').run(userId, messId);
  } else {
    db.prepare('INSERT INTO favourites (user_id, mess_id, created_at) VALUES (?, ?, ?)').run(
      userId,
      messId,
      new Date().toISOString()
    );
  }

  const favRows = db
    .prepare('SELECT mess_id FROM favourites WHERE user_id = ?')
    .all(userId) as { mess_id: number }[];

  res.json({
    saved: !existing,
    favouriteMessIds: favRows.map((r) => r.mess_id),
  });
});

app.get('/api/favourites', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.authUser!.userId;
  const rows = db
    .prepare(
      `SELECT m.* FROM messes m
       INNER JOIN favourites f ON f.mess_id = m.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`
    )
    .all(userId) as Parameters<typeof mapMessRow>[0][];

  res.json({ messes: rows.map(mapMessRow) });
});

// 5. Subscription Enquiries Routes
app.post('/api/messes/:id/enquiries', (req: AuthenticatedRequest, res) => {
  try {
    const messId = Number(req.params.id);
    const mess = db.prepare('SELECT id, name, available_seats FROM messes WHERE id = ?').get(messId) as
      | { id: number; name: string; available_seats: number }
      | undefined;

    if (!mess) {
      res.status(404).json({ error: 'Mess listing not found.' });
      return;
    }

    const optionalUser = extractOptionalUser(req);
    const studentName = String(req.body.studentName || optionalUser?.name || '').trim();
    const studentEmail = String(req.body.studentEmail || optionalUser?.email || '').trim().toLowerCase();
    const studentPhone = String(req.body.studentPhone || '').trim();
    const planType = String(req.body.planType || 'Full Monthly (Lunch + Dinner)').trim();
    const startDate = String(req.body.startDate || '').trim();
    const message = String(req.body.message || '').trim();

    if (studentName.length < 2 || studentName.length > 80) {
      res.status(400).json({ error: 'Please enter your full name (2–80 characters).' });
      return;
    }
    if (!EMAIL_REGEX.test(studentEmail)) {
      res.status(400).json({ error: 'Please enter a valid student email address.' });
      return;
    }
    if (!PHONE_REGEX.test(studentPhone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit phone number so the mess owner can reach you.' });
      return;
    }
    if (!startDate) {
      res.status(400).json({ error: 'Please choose your preferred joining date.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const result = db
      .prepare(
        `INSERT INTO enquiries (
          mess_id, student_id, student_name, student_email, student_phone,
          plan_type, start_date, message, status, owner_note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?)`
      )
      .run(
        messId,
        optionalUser ? optionalUser.userId : null,
        studentName,
        studentEmail,
        studentPhone,
        planType,
        startDate,
        message || 'Interested in subscribing to monthly meals.',
        nowIso,
        nowIso
      );

    const createdRow = db
      .prepare(
        `SELECT e.*, m.name as mess_name, m.location as mess_location
         FROM enquiries e
         INNER JOIN messes m ON m.id = e.mess_id
         WHERE e.id = ?`
      )
      .get(Number(result.lastInsertRowid)) as Parameters<typeof mapEnquiryRow>[0];

    res.status(201).json({
      enquiry: mapEnquiryRow(createdRow),
      message: `Subscription enquiry sent to ${mess.name}!`,
    });
  } catch (err) {
    console.error('Enquiry submission error:', err);
    res.status(500).json({ error: 'Could not submit enquiry. Please try again.' });
  }
});

app.get('/api/student/enquiries', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.authUser!;
  const rows = db
    .prepare(
      `SELECT e.*, m.name as mess_name, m.location as mess_location
       FROM enquiries e
       INNER JOIN messes m ON m.id = e.mess_id
       WHERE e.student_id = ? OR LOWER(e.student_email) = LOWER(?)
       ORDER BY e.id DESC`
    )
    .all(user.userId, user.email) as Parameters<typeof mapEnquiryRow>[0][];

  res.json({ enquiries: rows.map(mapEnquiryRow) });
});

// 6. Student Ratings & Reviews Routes
app.post('/api/messes/:id/reviews', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const messId = Number(req.params.id);
    const user = req.authUser!;

    const messExists = db.prepare('SELECT id FROM messes WHERE id = ?').get(messId);
    if (!messExists) {
      res.status(404).json({ error: 'Mess listing not found.' });
      return;
    }

    const rating = Math.round(Number(req.body.rating));
    const foodQualityRating = Math.round(Number(req.body.foodQualityRating || rating));
    const hygieneRating = Math.round(Number(req.body.hygieneRating || rating));
    const comment = String(req.body.comment || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Overall rating must be between 1 and 5 stars.' });
      return;
    }
    if (comment.length < 8 || comment.length > 600) {
      res.status(400).json({ error: 'Please write an honest review between 8 and 600 characters.' });
      return;
    }

    const nowIso = new Date().toISOString();

    const reviewTx = db.transaction(() => {
      db.prepare(
        `INSERT INTO reviews (
          mess_id, student_id, student_name, rating, food_quality_rating, hygiene_rating, comment, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        messId,
        user.userId,
        user.name,
        rating,
        Math.min(5, Math.max(1, foodQualityRating)),
        Math.min(5, Math.max(1, hygieneRating)),
        comment,
        nowIso
      );

      // Update mess rating & review_count smoothly
      const currentMess = db
        .prepare('SELECT rating, review_count FROM messes WHERE id = ?')
        .get(messId) as { rating: number; review_count: number };

      const newCount = currentMess.review_count + 1;
      const updatedAvg = Number(
        ((currentMess.rating * currentMess.review_count + rating) / newCount).toFixed(1)
      );

      db.prepare('UPDATE messes SET rating = ?, review_count = ?, updated_at = ? WHERE id = ?').run(
        updatedAvg,
        newCount,
        nowIso,
        messId
      );
    });

    reviewTx();

    const updatedMess = getMessDetailsById(messId);
    res.status(201).json({
      mess: updatedMess,
      stats: getSummaryStats(),
    });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Could not submit review.' });
  }
});

// 7. Mess Owner Dashboard & Listing Management Routes
app.get('/api/owner/dashboard', requireOwner, (req: AuthenticatedRequest, res) => {
  const ownerId = req.authUser!.userId;
  const messRow = db.prepare('SELECT * FROM messes WHERE owner_id = ? LIMIT 1').get(ownerId) as
    | Parameters<typeof mapMessRow>[0]
    | undefined;

  if (!messRow) {
    res.status(404).json({ error: 'No mess listing is linked to this owner account.' });
    return;
  }

  const fullMess = getMessDetailsById(messRow.id);
  const enquiryRows = db
    .prepare(
      `SELECT e.*, m.name as mess_name, m.location as mess_location
       FROM enquiries e
       INNER JOIN messes m ON m.id = e.mess_id
       WHERE e.mess_id = ?
       ORDER BY e.id DESC`
    )
    .all(messRow.id) as Parameters<typeof mapEnquiryRow>[0][];

  res.json({
    mess: fullMess,
    enquiries: enquiryRows.map(mapEnquiryRow),
  });
});

app.put('/api/owner/mess/:id', requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const messId = Number(req.params.id);
    const ownerId = req.authUser!.userId;

    const existing = db
      .prepare('SELECT * FROM messes WHERE id = ? AND owner_id = ?')
      .get(messId, ownerId) as Parameters<typeof mapMessRow>[0] | undefined;

    if (!existing) {
      res.status(403).json({ error: 'You can only update your own mess listing.' });
      return;
    }

    const monthlyPrice = Math.round(Number(req.body.monthlyPrice));
    const halfMonthlyPrice = Math.round(Number(req.body.halfMonthlyPrice || Math.round(monthlyPrice * 0.55)));
    const singlePlatePrice = Math.round(Number(req.body.singlePlatePrice || 70));
    const availableSeats = Math.round(Number(req.body.availableSeats));
    const totalSeats = Math.round(Number(req.body.totalSeats || existing.total_seats));
    const lunchTiming = String(req.body.lunchTiming || existing.lunch_timing).trim();
    const dinnerTiming = String(req.body.dinnerTiming || existing.dinner_timing).trim();
    const speciality = String(req.body.speciality || existing.speciality).trim();
    const location = String(req.body.location || existing.location).trim();
    const description = String(req.body.description || existing.description).trim();
    const contactPhone = String(req.body.contactPhone || existing.contact_phone).trim();
    const dietType = req.body.dietType === 'Veg & Non-Veg' ? 'Veg & Non-Veg' : 'Pure Veg';
    const tiffinDelivery = Boolean(req.body.tiffinDelivery);

    if (!Number.isFinite(monthlyPrice) || monthlyPrice < 1000 || monthlyPrice > 10000) {
      res.status(400).json({ error: 'Monthly price must be between ₹1,000 and ₹10,000.' });
      return;
    }
    if (!Number.isFinite(availableSeats) || availableSeats < 0 || availableSeats > 300) {
      res.status(400).json({ error: 'Available seats must be between 0 and 300.' });
      return;
    }
    if (totalSeats < availableSeats) {
      res.status(400).json({ error: 'Total seat capacity cannot be smaller than available seats.' });
      return;
    }
    if (!lunchTiming || !dinnerTiming) {
      res.status(400).json({ error: 'Both Lunch and Dinner timings are required.' });
      return;
    }

    const tagsArray = Array.isArray(req.body.tags)
      ? req.body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 8)
      : JSON.parse(existing.tags_json);

    const weeklyMenu: DailyMenu[] = Array.isArray(req.body.weeklyMenu)
      ? req.body.weeklyMenu.map((d: DailyMenu) => ({
          day: String(d.day || '').trim(),
          lunch: String(d.lunch || '').trim(),
          dinner: String(d.dinner || '').trim(),
          ...(d.special ? { special: String(d.special).trim() } : {}),
        }))
      : JSON.parse(existing.weekly_menu_json);

    const nowIso = new Date().toISOString();

    db.prepare(
      `UPDATE messes SET
        monthly_price = ?,
        half_monthly_price = ?,
        single_plate_price = ?,
        available_seats = ?,
        total_seats = ?,
        lunch_timing = ?,
        dinner_timing = ?,
        speciality = ?,
        location = ?,
        description = ?,
        contact_phone = ?,
        diet_type = ?,
        tiffin_delivery = ?,
        tags_json = ?,
        weekly_menu_json = ?,
        updated_at = ?
       WHERE id = ? AND owner_id = ?`
    ).run(
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
      tiffinDelivery ? 1 : 0,
      JSON.stringify(tagsArray),
      JSON.stringify(weeklyMenu),
      nowIso,
      messId,
      ownerId
    );

    const updatedMess = getMessDetailsById(messId);
    res.json({
      mess: updatedMess,
      stats: getSummaryStats(),
      message: 'Mess listing updated successfully!',
    });
  } catch (err) {
    console.error('Owner mess update error:', err);
    res.status(500).json({ error: 'Failed to update mess details.' });
  }
});

app.post('/api/owner/mess/:id/photos', requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const messId = Number(req.params.id);
    const ownerId = req.authUser!.userId;

    const existing = db
      .prepare('SELECT id FROM messes WHERE id = ? AND owner_id = ?')
      .get(messId, ownerId);

    if (!existing) {
      res.status(403).json({ error: 'You can only upload photographs to your own mess.' });
      return;
    }

    const caption = String(req.body.caption || 'Today’s Fresh Thali').trim().slice(0, 120);
    const imageData = String(req.body.imageData || '').trim();
    const setAsCover = Boolean(req.body.setAsCover);

    if (!imageData.startsWith('data:image/')) {
      res.status(400).json({ error: 'Please select a valid JPEG, PNG, or WebP food photograph.' });
      return;
    }
    if (imageData.length > 3_200_000) {
      res.status(400).json({ error: 'Image size is too large. Please upload a photo under 2.5 MB.' });
      return;
    }

    const nowIso = new Date().toISOString();
    db.prepare(
      'INSERT INTO mess_photos (mess_id, caption, image_data, created_at) VALUES (?, ?, ?, ?)'
    ).run(messId, caption || 'Fresh Mess Meal', imageData, nowIso);

    if (setAsCover) {
      db.prepare('UPDATE messes SET custom_image_url = ?, updated_at = ? WHERE id = ?').run(
        imageData,
        nowIso,
        messId
      );
    }

    const updatedMess = getMessDetailsById(messId);
    res.status(201).json({
      mess: updatedMess,
      message: 'Food photograph uploaded!',
    });
  } catch (err) {
    console.error('Photo upload error:', err);
    res.status(500).json({ error: 'Failed to upload food photograph.' });
  }
});

app.delete('/api/owner/photos/:photoId', requireOwner, (req: AuthenticatedRequest, res) => {
  const photoId = Number(req.params.photoId);
  const ownerId = req.authUser!.userId;

  const photo = db
    .prepare(
      `SELECT p.id, p.mess_id, p.image_data
       FROM mess_photos p
       INNER JOIN messes m ON m.id = p.mess_id
       WHERE p.id = ? AND m.owner_id = ?`
    )
    .get(photoId, ownerId) as { id: number; mess_id: number; image_data: string } | undefined;

  if (!photo) {
    res.status(404).json({ error: 'Photograph not found or unauthorized.' });
    return;
  }

  db.prepare('DELETE FROM mess_photos WHERE id = ?').run(photoId);

  // If this photo was also set as custom cover, reset cover cleanly
  db.prepare('UPDATE messes SET custom_image_url = NULL WHERE id = ? AND custom_image_url = ?').run(
    photo.mess_id,
    photo.image_data
  );

  const updatedMess = getMessDetailsById(photo.mess_id);
  res.json({ mess: updatedMess });
});

app.patch('/api/owner/enquiries/:enquiryId', requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const enquiryId = Number(req.params.enquiryId);
    const ownerId = req.authUser!.userId;
    const status = String(req.body.status || '');
    const ownerNote = String(req.body.ownerNote ?? '').trim().slice(0, 300);

    if (!['pending', 'approved', 'contacted', 'declined'].includes(status)) {
      res.status(400).json({ error: 'Invalid enquiry status.' });
      return;
    }

    const existing = db
      .prepare(
        `SELECT e.id, e.mess_id, e.status, m.available_seats
         FROM enquiries e
         INNER JOIN messes m ON m.id = e.mess_id
         WHERE e.id = ? AND m.owner_id = ?`
      )
      .get(enquiryId, ownerId) as
      | { id: number; mess_id: number; status: string; available_seats: number }
      | undefined;

    if (!existing) {
      res.status(404).json({ error: 'Enquiry not found for your mess.' });
      return;
    }

    const nowIso = new Date().toISOString();

    const updateTx = db.transaction(() => {
      // Automatically reserve/release 1 seat when moving into or out of 'approved'
      if (existing.status !== 'approved' && status === 'approved' && existing.available_seats > 0) {
        db.prepare('UPDATE messes SET available_seats = available_seats - 1, updated_at = ? WHERE id = ?').run(
          nowIso,
          existing.mess_id
        );
      } else if (existing.status === 'approved' && status !== 'approved') {
        db.prepare(
          'UPDATE messes SET available_seats = MIN(total_seats, available_seats + 1), updated_at = ? WHERE id = ?'
        ).run(nowIso, existing.mess_id);
      }

      db.prepare('UPDATE enquiries SET status = ?, owner_note = ?, updated_at = ? WHERE id = ?').run(
        status,
        ownerNote,
        nowIso,
        enquiryId
      );
    });

    updateTx();

    const enquiryRows = db
      .prepare(
        `SELECT e.*, m.name as mess_name, m.location as mess_location
         FROM enquiries e
         INNER JOIN messes m ON m.id = e.mess_id
         WHERE e.mess_id = ?
         ORDER BY e.id DESC`
      )
      .all(existing.mess_id) as Parameters<typeof mapEnquiryRow>[0][];

    const updatedMess = getMessDetailsById(existing.mess_id);
    res.json({
      mess: updatedMess,
      enquiries: enquiryRows.map(mapEnquiryRow),
      stats: getSummaryStats(),
    });
  } catch (err) {
    console.error('Update enquiry error:', err);
    res.status(500).json({ error: 'Failed to update student enquiry.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
          next();
          return;
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mess Finding System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

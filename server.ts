import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  initializeDatabase,
  toPublicUser,
  findUserByEmail,
  findUserById,
  getSummaryStats,
  listAllMesses,
  getMessDetailsById,
  getMessByOwnerId,
  registerOwnerWithMess,
  createStudentEnquiry,
  addStudentReview,
  listEnquiriesForMess,
  updateMessRecord,
  addMessPhoto,
  removeMessPhoto,
  updateEnquiryRecord,
  getAdminDashboardSnapshot,
  deleteMessById,
  deleteEnquiryById,
  deleteReviewById,
} from './server/db.ts';
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  requireAuth,
  requireOwner,
  requireAdmin,
} from './server/auth.ts';
import type { AuthenticatedRequest } from './server/auth.ts';
import type { ButtonColorVariant, DailyMenu, EnquiryStatus } from './src/types.ts';

initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '4mb' }));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{8,15}$/;

// 1. Health Check for Cloud Run
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mess-finding-system',
    environment: process.env.K_SERVICE ? 'cloud-run' : 'local',
    timestamp: new Date().toISOString(),
  });
});

// 2. Authentication Routes (Admin & Mess Owner)
app.post('/api/auth/register-owner', (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const phone = String(req.body.phone || '').trim();
    const password = String(req.body.password || '');
    const messName = String(req.body.collegeOrMess || '').trim();

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Owner full name must be between 2 and 80 characters.' });
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (!PHONE_REGEX.test(phone)) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
      return;
    }
    if (messName.length < 3) {
      res.status(400).json({ error: 'Please enter your Mess Name (minimum 3 characters).' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (findUserByEmail(email)) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }

    const createdUser = registerOwnerWithMess({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      messName,
    });

    const token = signAuthToken({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      name: createdUser.name,
    });

    res.status(201).json({
      token,
      user: toPublicUser(createdUser),
    });
  } catch (err) {
    console.error('Register owner error:', err);
    res.status(500).json({ error: 'Unable to complete owner registration. Please try again.' });
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

    const userRow = findUserByEmail(email);
    if (!userRow || !verifyPassword(password, userRow.passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
      return;
    }

    const token = signAuthToken({
      userId: userRow.id,
      email: userRow.email,
      role: userRow.role,
      name: userRow.name,
    });

    res.json({
      token,
      user: toPublicUser(userRow),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Sign-in failed due to a server error.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const userRow = findUserById(req.authUser!.userId);
  if (!userRow) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  res.json({
    user: toPublicUser(userRow),
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

    let messes = listAllMesses();

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

// 4. Open Student Subscription Enquiries
app.post('/api/messes/:id/enquiries', (req, res) => {
  try {
    const messId = Number(req.params.id);
    const studentName = String(req.body.studentName || '').trim();
    const studentEmail = String(req.body.studentEmail || '').trim().toLowerCase();
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

    const created = createStudentEnquiry({
      messId,
      studentName,
      studentEmail,
      studentPhone,
      planType,
      startDate,
      message: message || 'Interested in subscribing to monthly meals.',
    });

    if (!created) {
      res.status(404).json({ error: 'Mess listing not found.' });
      return;
    }

    res.status(201).json({
      enquiry: created,
      message: `Subscription enquiry sent to ${created.messName}!`,
    });
  } catch (err) {
    console.error('Enquiry submission error:', err);
    res.status(500).json({ error: 'Could not submit enquiry. Please try again.' });
  }
});

// 5. Open Student Ratings & Reviews
app.post('/api/messes/:id/reviews', (req, res) => {
  try {
    const messId = Number(req.params.id);
    const studentName = String(req.body.studentName || '').trim();
    const rating = Math.round(Number(req.body.rating));
    const foodQualityRating = Math.round(Number(req.body.foodQualityRating || rating));
    const hygieneRating = Math.round(Number(req.body.hygieneRating || rating));
    const comment = String(req.body.comment || '').trim();

    if (studentName.length < 2 || studentName.length > 80) {
      res.status(400).json({ error: 'Please enter your name & branch (e.g., Rohit Patil - CSE).' });
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Overall rating must be between 1 and 5 stars.' });
      return;
    }
    if (comment.length < 8 || comment.length > 600) {
      res.status(400).json({ error: 'Please write an honest review between 8 and 600 characters.' });
      return;
    }

    const updatedMess = addStudentReview({
      messId,
      studentName,
      rating,
      foodQualityRating: Math.min(5, Math.max(1, foodQualityRating)),
      hygieneRating: Math.min(5, Math.max(1, hygieneRating)),
      comment,
    });

    if (!updatedMess) {
      res.status(404).json({ error: 'Mess listing not found.' });
      return;
    }

    res.status(201).json({
      mess: updatedMess,
      stats: getSummaryStats(),
    });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Could not submit review.' });
  }
});

// 6. Mess Owner Dashboard & Listing Management Routes
app.get('/api/owner/dashboard', requireOwner, (req: AuthenticatedRequest, res) => {
  const mess = getMessByOwnerId(req.authUser!.userId);
  if (!mess) {
    res.status(404).json({ error: 'No mess listing is linked to this owner account.' });
    return;
  }

  res.json({
    mess,
    enquiries: listEnquiriesForMess(mess.id),
  });
});

app.put('/api/owner/mess/:id', requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const messId = Number(req.params.id);
    const user = req.authUser!;
    const existing = getMessDetailsById(messId);

    if (!existing || (user.role !== 'admin' && existing.ownerId !== user.userId)) {
      res.status(403).json({ error: 'You do not have permission to update this mess listing.' });
      return;
    }

    const name = String(req.body.name || existing.name).trim();
    const category = String(req.body.category || existing.category).trim().toUpperCase();
    const monthlyPrice = Math.round(Number(req.body.monthlyPrice));
    const halfMonthlyPrice = Math.round(Number(req.body.halfMonthlyPrice || Math.round(monthlyPrice * 0.55)));
    const singlePlatePrice = Math.round(Number(req.body.singlePlatePrice || 70));
    const availableSeats = Math.round(Number(req.body.availableSeats));
    const totalSeats = Math.round(Number(req.body.totalSeats || existing.totalSeats));
    const lunchTiming = String(req.body.lunchTiming || existing.lunchTiming).trim();
    const dinnerTiming = String(req.body.dinnerTiming || existing.dinnerTiming).trim();
    const speciality = String(req.body.speciality || existing.speciality).trim();
    const location = String(req.body.location || existing.location).trim();
    const description = String(req.body.description || existing.description).trim();
    const contactPhone = String(req.body.contactPhone || existing.contactPhone).trim();
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

    const tags = Array.isArray(req.body.tags)
      ? req.body.tags.map((t: unknown) => String(t).trim()).filter(Boolean).slice(0, 8)
      : existing.tags;

    const weeklyMenu: DailyMenu[] = Array.isArray(req.body.weeklyMenu)
      ? req.body.weeklyMenu.map((d: DailyMenu) => ({
          day: String(d.day || '').trim(),
          lunch: String(d.lunch || '').trim(),
          dinner: String(d.dinner || '').trim(),
          ...(d.special ? { special: String(d.special).trim() } : {}),
        }))
      : existing.weeklyMenu;

    const updatedMess = updateMessRecord(messId, {
      name,
      category,
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
      tags,
      weeklyMenu,
    });

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
    const user = req.authUser!;
    const existing = getMessDetailsById(messId);

    if (!existing || (user.role !== 'admin' && existing.ownerId !== user.userId)) {
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

    const updatedMess = addMessPhoto({
      messId,
      caption: caption || 'Fresh Mess Meal',
      imageData,
      setAsCover,
    });

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
  const user = req.authUser!;

  const updatedMess = removeMessPhoto(photoId, user.userId, user.role === 'admin');
  if (!updatedMess) {
    res.status(404).json({ error: 'Photograph not found or unauthorized.' });
    return;
  }

  res.json({ mess: updatedMess });
});

app.patch('/api/owner/enquiries/:enquiryId', requireOwner, (req: AuthenticatedRequest, res) => {
  try {
    const enquiryId = Number(req.params.enquiryId);
    const user = req.authUser!;
    const status = String(req.body.status || '') as EnquiryStatus;
    const ownerNote = String(req.body.ownerNote ?? '').trim().slice(0, 300);

    if (!['pending', 'approved', 'contacted', 'declined'].includes(status)) {
      res.status(400).json({ error: 'Invalid enquiry status.' });
      return;
    }

    const updated = updateEnquiryRecord(
      enquiryId,
      user.userId,
      user.role === 'admin',
      status,
      ownerNote
    );

    if (!updated) {
      res.status(404).json({ error: 'Enquiry not found.' });
      return;
    }

    res.json({
      mess: updated.mess,
      enquiries: updated.enquiries,
      stats: getSummaryStats(),
    });
  } catch (err) {
    console.error('Update enquiry error:', err);
    res.status(500).json({ error: 'Failed to update student enquiry.' });
  }
});

// 7. Administrator Control Panel Routes
app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
  try {
    res.json(getAdminDashboardSnapshot());
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load Admin Dashboard data.' });
  }
});

app.post('/api/admin/messes', requireAdmin, (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const ownerName = String(req.body.ownerName || '').trim();
    const ownerEmail = String(req.body.ownerEmail || '').trim().toLowerCase();
    const contactPhone = String(req.body.contactPhone || '').trim();
    const category = String(req.body.category || 'FEATURED').trim().toUpperCase();
    const monthlyPrice = Math.round(Number(req.body.monthlyPrice || 2600));
    const availableSeats = Math.round(Number(req.body.availableSeats || 20));
    const totalSeats = Math.round(Number(req.body.totalSeats || 50));
    const location = String(req.body.location || '').trim();
    const speciality = String(req.body.speciality || '').trim();
    const dietType = req.body.dietType === 'Veg & Non-Veg' ? 'Veg & Non-Veg' : 'Pure Veg';
    const tiffinDelivery = Boolean(req.body.tiffinDelivery);
    const lunchTiming = String(req.body.lunchTiming || '12:30 PM – 2:45 PM').trim();
    const dinnerTiming = String(req.body.dinnerTiming || '7:30 PM – 9:30 PM').trim();
    const buttonColor: ButtonColorVariant =
      req.body.buttonColor === 'blue' || req.body.buttonColor === 'green'
        ? req.body.buttonColor
        : 'orange';
    const imageKey = String(req.body.imageKey || 'pithla_bhakri');

    if (name.length < 3 || ownerName.length < 2 || !location || !speciality) {
      res.status(400).json({ error: 'Please fill in Mess Name, Owner Name, Location, and Speciality.' });
      return;
    }
    if (!EMAIL_REGEX.test(ownerEmail)) {
      res.status(400).json({ error: 'Please provide a valid Owner Email for owner login.' });
      return;
    }
    if (findUserByEmail(ownerEmail)) {
      res.status(409).json({ error: 'An owner with this email already exists.' });
      return;
    }

    registerOwnerWithMess({
      name: ownerName,
      email: ownerEmail,
      phone: contactPhone || '9823000000',
      passwordHash: hashPassword('Owner@123'),
      messName: name,
      buttonColor,
      category,
      monthlyPrice,
      availableSeats,
      totalSeats,
      location,
      speciality,
      dietType,
      tiffinDelivery,
      lunchTiming,
      dinnerTiming,
      imageKey,
    });

    res.status(201).json({
      ...getAdminDashboardSnapshot(),
      message: `${name} added! Owner login created (${ownerEmail} / Owner@123).`,
    });
  } catch (err) {
    console.error('Admin create mess error:', err);
    res.status(500).json({ error: 'Could not create new mess listing.' });
  }
});

app.delete('/api/admin/messes/:id', requireAdmin, (req, res) => {
  const messId = Number(req.params.id);
  const deletedName = deleteMessById(messId);
  if (!deletedName) {
    res.status(404).json({ error: 'Mess listing not found.' });
    return;
  }

  res.json({
    ...getAdminDashboardSnapshot(),
    message: `Removed ${deletedName} from the platform.`,
  });
});

app.delete('/api/admin/enquiries/:id', requireAdmin, (req, res) => {
  const enquiryId = Number(req.params.id);
  deleteEnquiryById(enquiryId);
  res.json({
    ...getAdminDashboardSnapshot(),
    message: 'Enquiry deleted.',
  });
});

app.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const reviewId = Number(req.params.id);
  const ok = deleteReviewById(reviewId);
  if (!ok) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  res.json({
    ...getAdminDashboardSnapshot(),
    message: 'Review removed and rating recalculated.',
  });
});

// Return clean JSON 404 for unknown /api/* routes instead of HTML
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

async function startServer() {
  // Detect Cloud Run (K_SERVICE), NODE_ENV=production, or `npm start` execution
  const isDevMode =
    process.env.npm_lifecycle_event === 'dev' &&
    process.env.NODE_ENV !== 'production' &&
    !process.env.K_SERVICE;

  if (isDevMode) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(503).send('Application frontend build (dist/index.html) is missing.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mess Finding System server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

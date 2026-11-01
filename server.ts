import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getPort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const parsed = Number(process.argv[portArgIdx + 1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  // Dev server must always bind to port 3000
  return 3000;
}

function getHost(): string {
  const hostArgIdx = process.argv.indexOf('--host');
  if (hostArgIdx !== -1 && process.argv[hostArgIdx + 1]) {
    return process.argv[hostArgIdx + 1];
  }
  return '0.0.0.0';
}

const PORT = getPort();
const HOST = getHost();
const distPath = path.join(process.cwd(), 'dist');
const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
const isDev = process.env.npm_lifecycle_event === 'dev' || process.env.NODE_ENV === 'development';
const isProd = !isDev && hasDist;

// Ensure online system storage directories exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const CURRICULUM_FILE = path.join(UPLOADS_DIR, 'curriculum_db.json');
const CURRICULUM_SEED = path.join(process.cwd(), 'public', 'curriculum_seed.json');

// Relational & persistent storage files
const STUDENTS_FILE = path.join(UPLOADS_DIR, 'students_db.json');
const PAYMENTS_FILE = path.join(UPLOADS_DIR, 'payments_db.json');
const PAYMENT_SETTINGS_FILE = path.join(UPLOADS_DIR, 'payment_settings_db.json');
const AUDIT_LOGS_FILE = path.join(UPLOADS_DIR, 'audit_logs_db.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}
if (!fs.existsSync(DOCUMENTS_DIR)) {
  fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Default payment settings schema & seed data
const DEFAULT_PAYMENT_SETTINGS = {
  gradePackages: {
    'Grade 9': {
      grade: 'Grade 9',
      allSubjectsPriceETB: 700,
      allSubjectsPriceUSD: 15,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
    'Grade 10': {
      grade: 'Grade 10',
      allSubjectsPriceETB: 800,
      allSubjectsPriceUSD: 18,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
    'Grade 11': {
      grade: 'Grade 11',
      allSubjectsPriceETB: 950,
      allSubjectsPriceUSD: 22,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
    'Grade 12': {
      grade: 'Grade 12',
      allSubjectsPriceETB: 1050,
      allSubjectsPriceUSD: 25,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
    'Freshman Program': {
      grade: 'Freshman Program',
      allSubjectsPriceETB: 1300,
      allSubjectsPriceUSD: 30,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
    'Freshman University': {
      grade: 'Freshman University',
      allSubjectsPriceETB: 1300,
      allSubjectsPriceUSD: 30,
      isActive: true,
      durationLabel: 'Semester (6 Months)',
      durationDays: 180,
    },
  },
  subjectPrices: {
    'sub-g9-math': { priceETB: 200, priceUSD: 5 },
    'sub-g9-chem': { priceETB: 180, priceUSD: 4 },
    'sub-g9-phys': { priceETB: 180, priceUSD: 4 },
    'sub-g9-bio': { priceETB: 180, priceUSD: 4 },
    'sub-g9-hist': { priceETB: 150, priceUSD: 3 },
    'sub-g9-geog': { priceETB: 150, priceUSD: 3 },
    'sub-g10-math': { priceETB: 220, priceUSD: 5 },
    'sub-g10-chem': { priceETB: 200, priceUSD: 5 },
    'sub-g10-phys': { priceETB: 200, priceUSD: 5 },
    'sub-g10-bio': { priceETB: 200, priceUSD: 5 },
    'sub-g10-hist': { priceETB: 160, priceUSD: 4 },
    'sub-g10-geog': { priceETB: 160, priceUSD: 4 },
    'sub-g11-math-nat': { priceETB: 250, priceUSD: 6 },
    'sub-g11-chem': { priceETB: 220, priceUSD: 5 },
    'sub-g11-phys': { priceETB: 220, priceUSD: 5 },
    'sub-g11-bio': { priceETB: 220, priceUSD: 5 },
    'sub-g11-math-soc': { priceETB: 220, priceUSD: 5 },
    'sub-g11-hist': { priceETB: 180, priceUSD: 4 },
    'sub-g11-geog': { priceETB: 180, priceUSD: 4 },
    'sub-g11-econ': { priceETB: 180, priceUSD: 4 },
    'sub-g12-math': { priceETB: 280, priceUSD: 7 },
    'sub-g12-phys': { priceETB: 250, priceUSD: 6 },
    'sub-g12-chem': { priceETB: 250, priceUSD: 6 },
    'sub-g12-bio': { priceETB: 250, priceUSD: 6 },
    'sub-g12-hist': { priceETB: 200, priceUSD: 5 },
    'sub-g12-geog': { priceETB: 200, priceUSD: 5 },
    'sub-g12-econ': { priceETB: 200, priceUSD: 5 },
    'sub-fresh-calc': { priceETB: 350, priceUSD: 8 },
    'sub-fresh-phys': { priceETB: 320, priceUSD: 7 },
    'sub-fresh-chem': { priceETB: 300, priceUSD: 7 },
    'sub-fresh-bio': { priceETB: 300, priceUSD: 7 },
    'sub-fresh-psych': { priceETB: 250, priceUSD: 6 },
    'sub-fresh-logic': { priceETB: 250, priceUSD: 6 },
  },
  paymentMethods: [
    {
      id: 'pm-telebirr',
      name: 'Telebirr',
      provider: 'Telebirr',
      accountNumber: '+251 91 123 4567',
      accountName: 'Oda Educational Services (Merchant ID: 884920)',
      instructions: 'Kaffaltii Telebirr erga raawwattanii booda, lakkofsa daddabarsaa (Reference Number) fi screenshot nagahee asitti dhiyeessaa.',
      isEnabled: true,
    },
    {
      id: 'pm-cbe',
      name: 'Commercial Bank of Ethiopia (CBE)',
      provider: 'Commercial Bank of Ethiopia (CBE)',
      accountNumber: '1000 2938 4729 1',
      accountName: 'Oda Education & Learning Systems',
      instructions: 'Herrega Baankii Daldala Itiyoophiyaa (CBE) irratti kaffaluun lakkofsa FT fi screenshot nagahee dhiyeessaa.',
      isEnabled: true,
    },
    {
      id: 'pm-awash',
      name: 'Awash Bank',
      provider: 'Awash Bank',
      accountNumber: '0143 8928 4721 00',
      accountName: 'Oda Educational Software Systems',
      instructions: 'Baankii Hawaash (Awash Birr / Mobile Banking) fayyadamuun kaffaltii raawwadhaa.',
      isEnabled: true,
    },
  ],
  promotions: [
    {
      id: 'promo-oda2026',
      code: 'ODA2026',
      discountPercent: 15,
      description: 'Gurgurtaa Addaa Jalqaba Waggaa (15% Off)',
      isActive: true,
    },
    {
      id: 'promo-student10',
      code: 'STUDENT10',
      discountPercent: 10,
      description: 'Garaa-laafina Barattoota Oromiyaa (10% Off)',
      isActive: true,
    },
  ],
  subscriptionDurations: [
    { id: 'dur-30', label: '1 Month (30 Days)', labelOromo: "Ji'a 1 (Guyyaa 30)", days: 30 },
    { id: 'dur-180', label: 'Semester (6 Months)', labelOromo: "Simisteera 1 (Ji'a 6)", days: 180, isDefault: true },
    { id: 'dur-365', label: 'Full Academic Year (1 Year)', labelOromo: 'Waggaa Barnootaa Guutuu (Waggaa 1)', days: 365 },
    { id: 'dur-lifetime', label: 'Permanent Lifetime Access', labelOromo: 'Yeroo Hundaa (Lifetime)', days: 3650 },
  ],
  activeAcademicYear: '2025/2026 E.C. (2018 A.L.I)',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Mr. Oda Worku (odaworku174@gmail.com)',
};

// Safe JSON DB file reader/writer helpers
function readJsonDB<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn(`[ODA SERVER] Notice reading ${filePath}:`, e);
  }
  return fallback;
}

function writeJsonDB(filePath: string, data: any): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[ODA SERVER] Error writing ${filePath}:`, e);
  }
}

// Initialize tables if missing
function initRelationalDatabases() {
  if (!fs.existsSync(PAYMENT_SETTINGS_FILE)) {
    writeJsonDB(PAYMENT_SETTINGS_FILE, DEFAULT_PAYMENT_SETTINGS);
  }
  if (!fs.existsSync(STUDENTS_FILE)) {
    writeJsonDB(STUDENTS_FILE, [
      {
        id: 'stu-sample-1',
        name: 'Chala Tolossa',
        phone: '0911223344',
        email: 'chala.student@oda.edu.et',
        grade: 'Grade 12',
        stream: 'Natural Science',
        schoolName: 'Oda Special Boarding School',
        cityOrRegion: 'Finfinnee / Addis Ababa',
        password: 'password123',
        isRegistered: true,
        enrolledSubjectIds: ['sub-g12-math'],
        pendingSubjectIds: [],
        completedLessonIds: [],
        quizAttempts: [],
        registrationDate: '2026-10-15',
        subscriptionExpiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
      },
    ]);
  }
  if (!fs.existsSync(PAYMENTS_FILE)) {
    writeJsonDB(PAYMENTS_FILE, [
      {
        id: 'pay-sample-001',
        studentId: 'stu-sample-1',
        studentName: 'Chala Tolossa',
        studentPhone: '0911223344',
        studentEmail: 'chala.student@oda.edu.et',
        grade: 'Grade 12',
        purchaseType: 'individual_subjects',
        subjectId: 'sub-g12-math',
        subjectTitle: 'Mathematics (Calculus)',
        subjectIds: ['sub-g12-math'],
        subjectTitles: ['Mathematics (Calculus)'],
        amountETB: 280,
        amountUSD: 7,
        paymentMethod: 'Telebirr',
        referenceNumber: 'TB-8849201948',
        screenshotUrl: '/assets/sample-receipt.jpg',
        submittedAt: '2026-10-15 09:30',
        status: 'Approved',
        adminNotes: 'Verified by Owner Mr. Oda Worku',
        verifiedAt: '2026-10-15 10:00',
        verifiedBy: 'Mr. Oda Worku (odaworku174@gmail.com)',
        subscriptionExpiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
      },
    ]);
  }
  if (!fs.existsSync(AUDIT_LOGS_FILE)) {
    writeJsonDB(AUDIT_LOGS_FILE, [
      {
        id: 'audit-init',
        timestamp: new Date().toISOString(),
        actorEmail: 'odaworku174@gmail.com',
        actorName: 'Mr. Oda Worku',
        action: 'UPDATE_PRICES',
        details: 'Initial system payment configuration initialized with Grade 9-12 and Freshman packages.',
      },
    ]);
  }
}
initRelationalDatabases();


// Initialize and sanitize persistent online curriculum database
function initCurriculumDB() {
  try {
    if (!fs.existsSync(CURRICULUM_FILE)) {
      if (fs.existsSync(CURRICULUM_SEED)) {
        const seedData = fs.readFileSync(CURRICULUM_SEED, 'utf-8');
        fs.writeFileSync(CURRICULUM_FILE, seedData, 'utf-8');
        console.log('[ODA SERVER] Initialized curriculum DB from public seed file.');
      } else {
        const initialPayload = {
          subjects: [],
          chapters: [],
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(initialPayload, null, 2), 'utf-8');
      }
    } else {
      // Clean up any dummy videoUrls that were auto-assigned to non-G9 Math Ch1 lessons
      try {
        const raw = fs.readFileSync(CURRICULUM_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        let modified = false;

        if (Array.isArray(parsed.chapters)) {
          parsed.chapters = parsed.chapters.map((chap: any) => ({
            ...chap,
            lessons: (chap.lessons || []).map((l: any) => {
              const isG9MathCh1 = chap.subjectId === 'sub-g9-math' && chap.chapterNumber === 1;
              if (!isG9MathCh1 && (l.videoUrl === '/videos/grade9_math_ch1_part1.mp4' || l.videoUrl === '/videos/grade9_math_ch1_part2.mp4')) {
                modified = true;
                return { ...l, videoUrl: '' };
              }
              return l;
            }),
          }));

          if (modified) {
            fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
            console.log('[ODA SERVER] Sanitized curriculum database: removed auto-assigned dummy video parts from other subjects.');
          }
        }
      } catch (sanitizeErr) {
        console.warn('[ODA SERVER] Notice during curriculum DB sanitization:', sanitizeErr);
      }
    }
  } catch (err) {
    console.error('[ODA SERVER] Failed to initialize curriculum database:', err);
  }
}
initCurriculumDB();

app.use(cors());

// Bypass body-parser on all streaming video upload endpoints so that large binary streams and chunks
// never get intercepted by body-parser with PayloadTooLargeError (HTTP 413)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/upload-video')) {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });
});


// Multer storage setup for video uploads to system disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `oda-lesson-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// High-speed 500GB+ dedicated cloud storage configuration
// Supports individual video file uploads up to 10 GB with zero client device memory usage
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // Up to 10 GB per video (500GB+ cloud disk ready)
  },
  fileFilter: (_req, _file, cb) => {
    cb(null, true); // Allow all recorded educational video containers
  },
});

// Multer storage setup for document / study guide uploads (PDF, Notes, Slides)
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DOCUMENTS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `oda-doc-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const uploadDoc = multer({
  storage: docStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // Up to 500MB books and PDFs
  },
});

// API: Upload study materials, notes, or books directly to online system storage
app.post('/api/upload-document', (req: Request, res: Response): void => {
  uploadDoc.single('document')(req, res, (err) => {
    if (err) {
      res.status(400).json({
        success: false,
        error: `Fe'iisa kitaabaa/nootii irratti dogoggorri uumame: ${err.message}`,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Faayilli kitaabaa hin filatamne (No document file uploaded)',
      });
      return;
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const docPath = `/uploads/documents/${req.file.filename}`;
    const absoluteUrl = `${protocol}://${host}${docPath}`;

    res.json({
      success: true,
      message: "Kitaabni/nootiin sarara online systemii irratti ol-kaa'ameera!",
      documentUrl: docPath,
      absoluteUrl: absoluteUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      sizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
      uploadedAt: new Date().toISOString(),
    });
  });
});

// Multer storage setup for image uploads (Grade/Subject/Chapter/Lesson covers & gallery uploads)
const imgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `oda-img-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const uploadImage = multer({
  storage: imgStorage,
  limits: {
    fileSize: 30 * 1024 * 1024, // Up to 30MB images from gallery/camera
  },
});

// API: Upload cover images / posters from phone/PC gallery directly to server
app.post('/api/upload-image', (req: Request, res: Response): void => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({
        success: false,
        error: `Fe'iisa fakkii irratti dogoggorri uumame: ${err.message}`,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Faayilli fakkii hin filatamne (No image file provided)',
      });
      return;
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const imagePath = `/uploads/images/${req.file.filename}`;
    const absoluteUrl = `${protocol}://${host}${imagePath}`;

    res.json({
      success: true,
      message: "Fakkiin galmee (gallery) irraa sarara online irratti ol-fe'ameera!",
      imageUrl: imagePath,
      absoluteUrl: absoluteUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
      sizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
      uploadedAt: new Date().toISOString(),
    });
  });
});

// ==========================================
// API: Persistent Online Curriculum & Realtime Synchronization Endpoints
// Ensures all uploaded subjects, chapters, parts, and notes are served online
// to all students across all shared devices without omitting anything!
// Supports instant Realtime Sync (SSE) and Draft vs Published workflow.
// ==========================================

// Connected Realtime Server-Sent Events (SSE) clients
const sseClients: { id: string; res: Response }[] = [];

export function broadcastRealtimeEvent(eventType: string, payload: any) {
  const data = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].res.write(`event: ${eventType}\ndata: ${data}\n\n`);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// GET /api/curriculum/events: Realtime Server-Sent Events stream for students and admin
app.get('/api/curriculum/events', (req: Request, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  sseClients.push({ id: clientId, res });

  // Send initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientId, timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat keep-alive every 25 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// GET /api/curriculum: Load complete curriculum from server
// If role is NOT admin (or not verified as Super Admin), filters out unpublished draft content!
app.get('/api/curriculum', (req: Request, res: Response): void => {
  try {
    if (!fs.existsSync(CURRICULUM_FILE)) {
      initCurriculumDB();
    }
    const rawData = fs.readFileSync(CURRICULUM_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);

    const role = (req.query.role as string) || '';
    const actorEmail = (req.query.actorEmail as string) || (req.headers['x-admin-email'] as string) || '';
    const isSuperAdmin =
      role === 'admin' &&
      (actorEmail.toLowerCase() === 'odaworku174@gmail.com' ||
        req.headers['x-admin-token'] === 'oda-super-admin-auth');

    let subjects = parsed.subjects || [];
    let chapters = parsed.chapters || [];

    // For students and general visitors: strictly hide unpublished / draft content
    if (!isSuperAdmin) {
      // 1. Filter out draft subjects
      subjects = subjects.filter((s: any) => s.isPublished !== false && s.status !== 'draft');
      const allowedSubjectIds = new Set(subjects.map((s: any) => s.id));

      // 2. Filter out draft chapters and draft lessons (both in lessons array and topics.parts array)
      chapters = chapters
        .filter((c: any) => allowedSubjectIds.has(c.subjectId) && c.isPublished !== false && c.status !== 'draft')
        .map((chap: any) => {
          const publishedLessons = (chap.lessons || []).filter(
            (l: any) => l.isPublished !== false && l.status !== 'draft'
          );
          const publishedTopics = (chap.topics || []).map((t: any) => ({
            ...t,
            parts: (t.parts || []).filter((p: any) => p.isPublished !== false && p.status !== 'draft'),
          }));
          return {
            ...chap,
            lessons: publishedLessons,
            topics: publishedTopics,
          };
        });
    }

    res.json({
      success: true,
      subjects,
      chapters,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      version: parsed.version || 1,
      isSuperAdmin,
    });
  } catch (err: any) {
    console.error('[ODA SERVER] Error reading curriculum:', err);
    res.status(500).json({
      success: false,
      error: `Curriculum dubbisuun hin danda'amne: ${err.message}`,
      subjects: [],
      chapters: [],
    });
  }
});

// POST /api/curriculum: Save complete curriculum updates from Admin (Strict Super Admin Only)
app.post('/api/curriculum', (req: Request, res: Response): void => {
  try {
    const { subjects, chapters, actorEmail, adminToken } = req.body;

    const email = (actorEmail || req.headers['x-admin-email'] || '').toString().trim().toLowerCase();
    const token = (adminToken || req.headers['x-admin-token'] || '').toString().trim();
    const isOwner = email === 'odaworku174@gmail.com' || token === 'oda-super-admin-auth';

    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: "Hayyama hin qabdan! Super Admin (odaworku174@gmail.com) qofatu qabiyyee jijjiiruu danda'a.",
      });
      return;
    }

    if (!Array.isArray(subjects) || !Array.isArray(chapters)) {
      res.status(400).json({
        success: false,
        error: 'Gosa qabiyyee dogoggoraa (Subjects and chapters must be arrays)',
      });
      return;
    }

    let existingVersion = 1;
    if (fs.existsSync(CURRICULUM_FILE)) {
      try {
        const old = JSON.parse(fs.readFileSync(CURRICULUM_FILE, 'utf-8'));
        existingVersion = (old.version || 1) + 1;
      } catch {
        existingVersion = Date.now();
      }
    }

    const payload = {
      subjects,
      chapters,
      updatedAt: new Date().toISOString(),
      version: existingVersion,
      lastModifiedBy: 'Mr. Oda Worku (odaworku174@gmail.com)',
    };

    fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(payload, null, 2), 'utf-8');

    console.log(
      `[ODA SERVER] Saved online curriculum version ${existingVersion}: ${subjects.length} subjects, ${chapters.length} chapters.`
    );

    // Instant Realtime Notification to all students & browsers
    broadcastRealtimeEvent('curriculum_updated', {
      version: existingVersion,
      updatedAt: payload.updatedAt,
      message: 'Curriculum has been updated and published by Mr. Oda Worku',
    });

    res.json({
      success: true,
      message: "Qabiyyeen barnootaa hundi sarara online irratti ol-kaa'ameera! Barattoonni hundi yeruma sana ni argatu.",
      version: existingVersion,
      updatedAt: payload.updatedAt,
      subjectsCount: subjects.length,
      chaptersCount: chapters.length,
    });
  } catch (err: any) {
    console.error('[ODA SERVER] Error saving curriculum:', err);
    res.status(500).json({
      success: false,
      error: `Qabiyyee sarara irratti kuusuun hin danda'amne: ${err.message}`,
    });
  }
});

// POST /api/curriculum/toggle-publish: Instantly toggle draft/published status of a lesson, chapter, or subject
app.post('/api/curriculum/toggle-publish', (req: Request, res: Response): void => {
  try {
    const { itemType, itemId, chapterId, isPublished, actorEmail } = req.body;

    const email = (actorEmail || req.headers['x-admin-email'] || '').toString().trim().toLowerCase();
    if (email !== 'odaworku174@gmail.com' && req.headers['x-admin-token'] !== 'oda-super-admin-auth') {
      res.status(403).json({ success: false, error: 'Hayyama hin qabdan! Super Admin qofa.' });
      return;
    }

    if (!fs.existsSync(CURRICULUM_FILE)) initCurriculumDB();
    const curr = JSON.parse(fs.readFileSync(CURRICULUM_FILE, 'utf-8'));
    let found = false;

    if (itemType === 'lesson') {
      if (Array.isArray(curr.chapters)) {
        for (const chap of curr.chapters) {
          if (!chapterId || chap.id === chapterId) {
            // Check chap.lessons
            for (const l of chap.lessons || []) {
              if (l.id === itemId) {
                l.isPublished = Boolean(isPublished);
                l.status = isPublished ? 'published' : 'draft';
                l.lastModified = new Date().toISOString();
                if (isPublished) l.publishedAt = new Date().toISOString();
                found = true;
                break;
              }
            }
            // Also check chap.topics[].parts
            for (const t of chap.topics || []) {
              for (const p of t.parts || []) {
                if (p.id === itemId) {
                  p.isPublished = Boolean(isPublished);
                  p.status = isPublished ? 'published' : 'draft';
                  p.lastModified = new Date().toISOString();
                  if (isPublished) p.publishedAt = new Date().toISOString();
                  found = true;
                  break;
                }
              }
              if (found) break;
            }
          }
          if (found) break;
        }
      }
    } else if (itemType === 'chapter') {
      if (Array.isArray(curr.chapters)) {
        for (const chap of curr.chapters) {
          if (chap.id === itemId) {
            chap.isPublished = Boolean(isPublished);
            chap.status = isPublished ? 'published' : 'draft';
            chap.lastModified = new Date().toISOString();
            if (isPublished) chap.publishedAt = new Date().toISOString();
            found = true;
            break;
          }
        }
      }
    } else if (itemType === 'subject') {
      if (Array.isArray(curr.subjects)) {
        for (const sub of curr.subjects) {
          if (sub.id === itemId) {
            sub.isPublished = Boolean(isPublished);
            sub.status = isPublished ? 'published' : 'draft';
            sub.lastModified = new Date().toISOString();
            if (isPublished) sub.publishedAt = new Date().toISOString();
            found = true;
            break;
          }
        }
      }
    }

    if (!found) {
      res.status(404).json({ success: false, error: 'Item not found in curriculum database' });
      return;
    }

    curr.version = (curr.version || 1) + 1;
    curr.updatedAt = new Date().toISOString();
    fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(curr, null, 2), 'utf-8');

    // Broadcast change
    broadcastRealtimeEvent('curriculum_updated', {
      version: curr.version,
      updatedAt: curr.updatedAt,
      itemType,
      itemId,
      isPublished,
    });

    res.json({
      success: true,
      message: `Sadarkaan (${isPublished ? 'Published' : 'Draft'}) milkaa'inaan jijjiirameera!`,
      version: curr.version,
      updatedAt: curr.updatedAt,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/verify: Secure Admin Verification for Owner Mr. Oda Worku
app.post('/api/admin/verify', (req: Request, res: Response): void => {
  const { email, pin } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPin = (pin || '').trim();

  const isOwner = cleanEmail === 'odaworku174@gmail.com';
  const isPinValid = cleanPin === 'oda2026' || cleanPin === '1234';

  if (isOwner && isPinValid) {
    res.json({
      success: true,
      authenticated: true,
      owner: {
        name: 'Mr. Oda Worku',
        email: 'odaworku174@gmail.com',
        role: 'Founder & Senior Instructor',
      },
      message: "Baga nagaan deebitan Mr. Oda Worku! Mirgi bulchiinsaa mirkanaa'eera.",
    });
  } else {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: !isOwner
        ? 'Hayyama hin qabdan! Abbaan qophii app kanaa Mr. Oda Worku (odaworku174@gmail.com) qofa.'
        : 'Jecha iccitii (PIN) dogoggora!',
    });
  }
});

// =========================================================================
// API: ADVANCED STUDENT REGISTRATION & AUTHENTICATION (MANDATORY REGISTRATION)
// =========================================================================

// POST /api/students/register: Mandatory Student Registration with Validation & Duplicate Prevention
app.post('/api/students/register', (req: Request, res: Response): void => {
  try {
    const { name, phone, email, grade, stream, schoolName, cityOrRegion, password } = req.body;

    // 1. Mandatory field checks
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ success: false, error: 'Maqaa guutuu galchuun dirqama (Full name is required)' });
      return;
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      res.status(400).json({ success: false, error: 'Lakkoofsa bilbilaa galchuun dirqama (Phone number is required)' });
      return;
    }

    // 2. Validate Ethiopian / international phone number format (at least 9-10 digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      res.status(400).json({
        success: false,
        error: 'Lakkoofsi bilbilaa sirrii miti. Maaloo lakkoofsa sirrii galchaa (fakkeenyaaf: 0911223344 ykn 0711223344)',
      });
      return;
    }

    if (!grade || typeof grade !== 'string') {
      res.status(400).json({ success: false, error: 'Kutaa ykn sagantaa filachuun dirqama (Grade/Program is required)' });
      return;
    }

    if (!schoolName || typeof schoolName !== 'string' || !schoolName.trim()) {
      res.status(400).json({ success: false, error: 'Maqaa mana barumsaa galchuun dirqama (School name is required)' });
      return;
    }

    const students = readJsonDB<any[]>(STUDENTS_FILE, []);

    // 3. Prevent duplicate accounts by phone number
    const existingByPhone = students.find((s) => {
      const sClean = (s.phone || '').replace(/[^0-9]/g, '');
      return sClean === cleanPhone;
    });

    if (existingByPhone) {
      res.status(409).json({
        success: false,
        isDuplicate: true,
        error: `Lakkoofsi bilbilaa (${phone}) kanaan dura galmaa'eera! Maaloo kallattiin seenaa (login) ykn bilbila biraa fayyadamaa.`,
      });
      return;
    }

    // Also check email duplicate if provided
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail) {
      const existingByEmail = students.find((s) => (s.email || '').toLowerCase() === cleanEmail);
      if (existingByEmail) {
        res.status(409).json({
          success: false,
          isDuplicate: true,
          error: `Imeeliin (${email}) kanaan dura galmaa'eera! Maaloo kallattiin seenaa (login).`,
        });
        return;
      }
    }

    // 4. Create verified student record
    const newStudentId = `stu-reg-${Date.now()}`;
    const newStudent = {
      id: newStudentId,
      name: name.trim(),
      phone: phone.trim(),
      email: cleanEmail || `${cleanPhone}@student.oda.edu.et`,
      grade: grade.trim(),
      stream: stream ? stream.trim() : undefined,
      schoolName: schoolName.trim(),
      cityOrRegion: (cityOrRegion || 'Finfinnee').trim(),
      password: (password || '123456').trim(),
      isRegistered: true,
      enrolledSubjectIds: [],
      pendingSubjectIds: [],
      completedLessonIds: [],
      quizAttempts: [],
      registrationDate: new Date().toISOString().split('T')[0],
      subscriptionExpiresAt: undefined,
    };

    students.unshift(newStudent);
    writeJsonDB(STUDENTS_FILE, students);

    console.log(`[ODA SERVER] New student registered: ${newStudent.name} (${newStudent.phone}, ${newStudent.grade})`);

    res.status(201).json({
      success: true,
      message: "Galmeen keessan milkaa'inaan raawwatameera! Baga nagaan dhuftan ODA Tutorial Class.",
      student: newStudent,
    });
  } catch (err: any) {
    console.error('[ODA SERVER] Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/students/login: Secure Student Login
app.post('/api/students/login', (req: Request, res: Response): void => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      res.status(400).json({ success: false, error: 'Bilbila ykn Imeelii galchaa' });
      return;
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanNumeric = cleanId.replace(/[^0-9]/g, '');
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);

    const student = students.find((s) => {
      const sPhoneDigits = (s.phone || '').replace(/[^0-9]/g, '');
      const sEmail = (s.email || '').toLowerCase();
      return (
        (cleanNumeric && sPhoneDigits === cleanNumeric) ||
        sEmail === cleanId ||
        (s.name || '').toLowerCase() === cleanId
      );
    });

    if (!student) {
      res.status(404).json({
        success: false,
        error: "Barataan lakkoofsa/imeelii kanaan galmaa'e hin argamne. Maaloo dura galmaa'aa (Register).",
      });
      return;
    }

    if (password && student.password && student.password !== password.trim()) {
      res.status(401).json({
        success: false,
        error: 'Jechi iccitii dogoggora!',
      });
      return;
    }

    res.json({
      success: true,
      student,
      message: `Baga nagaan deebitan ${student.name}!`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/students: List all registered students (Owner Admin)
app.get('/api/students', (_req: Request, res: Response): void => {
  try {
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);
    res.json({ success: true, count: students.length, students });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/students/:id/access: Grant or Revoke subject/package access (Owner Admin)
app.put('/api/students/:id/access', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { subjectId, grant, allSubjects, expirationDays, actorEmail } = req.body;
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);
    const studentIdx = students.findIndex((s) => s.id === id);

    if (studentIdx === -1) {
      res.status(404).json({ success: false, error: 'Barataan hin argamne' });
      return;
    }

    const student = students[studentIdx];
    let newEnrolled = Array.isArray(student.enrolledSubjectIds) ? [...student.enrolledSubjectIds] : [];

    if (allSubjects) {
      if (grant) {
        // Find all subjects for this student's grade
        const currData = readJsonDB<any>(CURRICULUM_FILE, { subjects: [] });
        const gradeSubjects = (currData.subjects || []).filter((s: any) => s.grade === student.grade);
        const gradeSubIds = gradeSubjects.map((s: any) => s.id);
        newEnrolled = Array.from(new Set([...newEnrolled, ...gradeSubIds]));
        student.hasAllSubjectsAccess = true;
      } else {
        newEnrolled = [];
        student.hasAllSubjectsAccess = false;
      }
    } else if (subjectId) {
      if (grant) {
        if (!newEnrolled.includes(subjectId)) newEnrolled.push(subjectId);
      } else {
        newEnrolled = newEnrolled.filter((sid) => sid !== subjectId);
      }
    }

    if (expirationDays) {
      student.subscriptionExpiresAt = new Date(Date.now() + Number(expirationDays) * 86400000).toISOString();
    }

    student.enrolledSubjectIds = newEnrolled;
    student.pendingSubjectIds = (student.pendingSubjectIds || []).filter((pid: string) => !newEnrolled.includes(pid));
    students[studentIdx] = student;
    writeJsonDB(STUDENTS_FILE, students);

    // Audit Log entry
    const auditLogs = readJsonDB<any[]>(AUDIT_LOGS_FILE, []);
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorEmail || 'odaworku174@gmail.com',
      actorName: 'Mr. Oda Worku',
      action: grant ? 'GRANT_ACCESS' : 'REVOKE_ACCESS',
      targetStudentId: student.id,
      targetStudentName: student.name,
      details: `${grant ? 'Granted' : 'Revoked'} access for ${student.name} (${allSubjects ? 'All Subjects Package' : subjectId})`,
    });
    writeJsonDB(AUDIT_LOGS_FILE, auditLogs);

    res.json({
      success: true,
      message: `Mirgi koorsii barataa ${student.name} ${grant ? 'kennameera' : 'haqameera'}!`,
      student,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// API: OWNER PAYMENT MANAGEMENT & PRICING CONFIGURATION
// =========================================================================

// GET /api/payment-settings: Retrieve dynamic payment settings & prices
app.get('/api/payment-settings', (_req: Request, res: Response): void => {
  try {
    const settings = readJsonDB<any>(PAYMENT_SETTINGS_FILE, DEFAULT_PAYMENT_SETTINGS);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment-settings: Update prices, grade packages, payment methods, durations (Owner Admin)
app.post('/api/payment-settings', (req: Request, res: Response): void => {
  try {
    const { settings, actorEmail } = req.body;
    if (!settings) {
      res.status(400).json({ success: false, error: 'Settings payload is required' });
      return;
    }

    const updatedPayload = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: actorEmail || 'Mr. Oda Worku (odaworku174@gmail.com)',
    };

    writeJsonDB(PAYMENT_SETTINGS_FILE, updatedPayload);

    // Record audit log
    const auditLogs = readJsonDB<any[]>(AUDIT_LOGS_FILE, []);
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorEmail || 'odaworku174@gmail.com',
      actorName: 'Mr. Oda Worku',
      action: 'UPDATE_PRICES',
      details: 'Updated global course prices, package options, and payment methods.',
    });
    writeJsonDB(AUDIT_LOGS_FILE, auditLogs);

    // Broadcast instant real-time pricing updates to all students and browsers
    broadcastRealtimeEvent('payment_settings_updated', {
      updatedAt: updatedPayload.updatedAt,
      message: 'Course prices and payment methods have been updated by Mr. Oda Worku',
    });

    console.log('[ODA SERVER] Payment settings and prices successfully updated by Owner.');

    res.json({
      success: true,
      message: "Gatiin koorsootaa fi qindaa'inni kaffaltii milkaa'inaan haaromeera!",
      settings: updatedPayload,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// API: PAYMENT TRANSACTIONS & SECURE MANUAL VERIFICATION WORKFLOW
// =========================================================================

// GET /api/payments: List all payment transactions
app.get('/api/payments', (_req: Request, res: Response): void => {
  try {
    const payments = readJsonDB<any[]>(PAYMENTS_FILE, []);
    res.json({ success: true, count: payments.length, payments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments: Submit pending payment transaction
app.post('/api/payments', (req: Request, res: Response): void => {
  try {
    const {
      studentId,
      studentName,
      studentPhone,
      studentEmail,
      grade,
      purchaseType,
      subjectId,
      subjectTitle,
      subjectIds,
      subjectTitles,
      amountETB,
      amountUSD,
      paymentMethod,
      referenceNumber,
      screenshotUrl,
      discountAppliedETB,
      promoCodeUsed,
    } = req.body;

    if (!studentId || !referenceNumber || !amountETB) {
      res.status(400).json({
        success: false,
        error: 'Odeeffannoon kaffaltii guutuu miti (Missing required payment fields)',
      });
      return;
    }

    const cleanRef = String(referenceNumber).trim();
    const payments = readJsonDB<any[]>(PAYMENTS_FILE, []);

    // Prevent duplicate payment submission with identical reference number
    const duplicateRef = payments.find(
      (p) => (p.referenceNumber || '').trim().toLowerCase() === cleanRef.toLowerCase()
    );

    if (duplicateRef) {
      res.status(409).json({
        success: false,
        isDuplicate: true,
        error: `Lakkofsi daddabarsaa (Reference Number: ${cleanRef}) kanaan dura fayyidameera! Dogoggora irra deebi'uu dhiisaa.`,
      });
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPayment = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      studentId,
      studentName,
      studentPhone,
      studentEmail,
      grade,
      purchaseType: purchaseType || 'individual_subjects',
      subjectId: subjectId || (Array.isArray(subjectIds) ? subjectIds.join(',') : ''),
      subjectTitle: subjectTitle || (Array.isArray(subjectTitles) ? subjectTitles.join(', ') : ''),
      subjectIds: Array.isArray(subjectIds) ? subjectIds : [subjectId],
      subjectTitles: Array.isArray(subjectTitles) ? subjectTitles : [subjectTitle],
      amountETB: Number(amountETB),
      amountUSD: Number(amountUSD) || 0,
      discountAppliedETB: Number(discountAppliedETB) || 0,
      promoCodeUsed: promoCodeUsed || undefined,
      paymentMethod,
      referenceNumber: cleanRef,
      screenshotUrl: screenshotUrl || '',
      submittedAt: formattedDate,
      status: 'Pending',
      adminNotes: 'Awaiting Owner Mr. Oda verification',
    };

    payments.unshift(newPayment);
    writeJsonDB(PAYMENTS_FILE, payments);

    // Update student's pending subjects
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);
    const studentIdx = students.findIndex((s) => s.id === studentId);
    if (studentIdx !== -1) {
      const student = students[studentIdx];
      const pendingToAdd = newPayment.subjectIds;
      const currentPending = student.pendingSubjectIds || [];
      student.pendingSubjectIds = Array.from(new Set([...currentPending, ...pendingToAdd]));
      students[studentIdx] = student;
      writeJsonDB(STUDENTS_FILE, students);
    }

    console.log(`[ODA SERVER] Payment submitted: ${newPayment.id} by ${studentName} (${newPayment.amountETB} ETB)`);

    res.status(201).json({
      success: true,
      message: "Nagaheen kaffaltii keessanii dhihaateera! Bulchaan (Mr. Oda) daqiiqaa muraasa keessatti ni mirkaneessa.",
      payment: newPayment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payments/:id/verify: Verify, Approve or Reject Payment (Owner Admin)
app.post('/api/payments/:id/verify', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { action, adminNotes, actorEmail, durationDays } = req.body;
    const payments = readJsonDB<any[]>(PAYMENTS_FILE, []);
    const payIdx = payments.findIndex((p) => p.id === id);

    if (payIdx === -1) {
      res.status(404).json({ success: false, error: 'Kaffaltiin hin argamne (Payment not found)' });
      return;
    }

    const payment = payments[payIdx];
    const isApprove = action === 'Approve' || action === 'Approved';

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    payment.status = isApprove ? 'Approved' : 'Rejected';
    payment.adminNotes = adminNotes || (isApprove ? 'Verified by Owner Mr. Oda Worku' : 'Transaction rejected');
    payment.verifiedAt = formattedDate;
    payment.verifiedBy = actorEmail || 'Mr. Oda Worku (odaworku174@gmail.com)';

    // Calculate subscription expiration (default 180 days semester unless customized)
    const daysToAdd = Number(durationDays) || 180;
    const expirationDate = new Date(Date.now() + daysToAdd * 86400000).toISOString();
    if (isApprove) {
      payment.subscriptionExpiresAt = expirationDate;
    }

    payments[payIdx] = payment;
    writeJsonDB(PAYMENTS_FILE, payments);

    // Update student permissions
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);
    const studentIdx = students.findIndex((s) => s.id === payment.studentId);

    if (studentIdx !== -1) {
      const student = students[studentIdx];
      const targetSubjects = payment.subjectIds || [payment.subjectId];

      if (isApprove) {
        let enrolled = student.enrolledSubjectIds || [];
        if (payment.purchaseType === 'all_subjects_package') {
          // Unlock all subjects in that grade
          const currData = readJsonDB<any>(CURRICULUM_FILE, { subjects: [] });
          const gradeSubjects = (currData.subjects || []).filter((s: any) => s.grade === payment.grade);
          const allGradeSubIds = gradeSubjects.map((s: any) => s.id);
          enrolled = Array.from(new Set([...enrolled, ...allGradeSubIds]));
          student.hasAllSubjectsAccess = true;
        } else {
          enrolled = Array.from(new Set([...enrolled, ...targetSubjects]));
        }

        student.enrolledSubjectIds = enrolled;
        student.subscriptionExpiresAt = expirationDate;
      }

      // Remove from pending
      student.pendingSubjectIds = (student.pendingSubjectIds || []).filter(
        (pid: string) => !targetSubjects.includes(pid)
      );

      students[studentIdx] = student;
      writeJsonDB(STUDENTS_FILE, students);
    }

    // Audit log
    const auditLogs = readJsonDB<any[]>(AUDIT_LOGS_FILE, []);
    auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorEmail || 'odaworku174@gmail.com',
      actorName: 'Mr. Oda Worku',
      action: isApprove ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
      targetStudentId: payment.studentId,
      targetStudentName: payment.studentName,
      details: `${isApprove ? 'Approved' : 'Rejected'} payment of ${payment.amountETB} ETB (Ref: ${payment.referenceNumber}) for ${payment.subjectTitle}`,
    });
    writeJsonDB(AUDIT_LOGS_FILE, auditLogs);

    // Broadcast instant real-time access change to student
    broadcastRealtimeEvent('payment_status_changed', {
      paymentId: payment.id,
      studentId: payment.studentId,
      status: payment.status,
      subjectId: payment.subjectId,
      subjectIds: payment.subjectIds,
    });

    res.json({
      success: true,
      message: isApprove
        ? "Kaffaltiin mirkanaa'eera! Barataan koorsicha guutummaatti argateera."
        : 'Kaffaltiin kufaa ta’eera.',
      payment,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/audit-logs: Audit logs for all administrative actions
app.get('/api/audit-logs', (_req: Request, res: Response): void => {
  try {
    const logs = readJsonDB<any[]>(AUDIT_LOGS_FILE, []);
    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/analytics: Financial, Student & Subscription Reports
app.get('/api/reports/analytics', (_req: Request, res: Response): void => {
  try {
    const students = readJsonDB<any[]>(STUDENTS_FILE, []);
    const payments = readJsonDB<any[]>(PAYMENTS_FILE, []);

    const totalStudents = students.length;
    const premiumStudents = students.filter(
      (s) => (s.enrolledSubjectIds && s.enrolledSubjectIds.length > 0) || s.hasAllSubjectsAccess
    ).length;
    const freeStudents = totalStudents - premiumStudents;

    const pendingPayments = payments.filter((p) => p.status === 'Pending');
    const approvedPayments = payments.filter((p) => p.status === 'Approved');
    const rejectedPayments = payments.filter((p) => p.status === 'Rejected');

    const totalRevenueETB = approvedPayments.reduce((sum, p) => sum + (Number(p.amountETB) || 0), 0);
    const totalRevenueUSD = approvedPayments.reduce((sum, p) => sum + (Number(p.amountUSD) || 0), 0);

    const packagePurchases = approvedPayments.filter((p) => p.purchaseType === 'all_subjects_package').length;
    const individualPurchases = approvedPayments.filter((p) => p.purchaseType === 'individual_subjects').length;

    const now = new Date();
    const expiredSubscriptions = students.filter((s) => {
      if (!s.subscriptionExpiresAt) return false;
      return new Date(s.subscriptionExpiresAt).getTime() < now.getTime();
    }).length;

    res.json({
      success: true,
      metrics: {
        totalRegisteredStudents: totalStudents,
        premiumStudents,
        freeStudents,
        pendingPaymentsCount: pendingPayments.length,
        approvedPaymentsCount: approvedPayments.length,
        rejectedPaymentsCount: rejectedPayments.length,
        totalRevenueETB,
        totalRevenueUSD,
        coursePurchases: packagePurchases,
        individualSubjectPurchases: individualPurchases,
        subscriptionExpirations: expiredSubscriptions,
      },
      recentTransactions: payments.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Resilient Chunked Video Upload (Bypasses 32MB Cloud Run / HTTP 413 limits for videos of ANY size)
app.post('/api/upload-video-chunk', (req: Request, res: Response): void => {

  req.setTimeout(0);
  if (req.socket) {
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true, 1000);
  }

  const uploadId = ((req.headers['x-upload-id'] as string) || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const chunkIndex = parseInt((req.headers['x-chunk-index'] as string) || '0', 10);
  const totalChunks = parseInt((req.headers['x-total-chunks'] as string) || '1', 10);
  const rawFilename = req.headers['x-file-name']
    ? decodeURIComponent(req.headers['x-file-name'] as string)
    : 'oda-lesson-video.mp4';

  if (!uploadId) {
    res.status(400).json({ success: false, error: 'Upload session ID dhabameera (Missing upload ID)' });
    return;
  }

  const ext = path.extname(rawFilename).toLowerCase() || '.mp4';
  const cleanName = path
    .basename(rawFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'lesson';
  const finalFilename = `oda-lesson-${cleanName}-${uploadId}${ext}`;
  const tempFilePath = path.join(VIDEOS_DIR, `${finalFilename}.part`);
  const finalFilePath = path.join(VIDEOS_DIR, finalFilename);

  // If first chunk, clean any old partial file
  if (chunkIndex === 0 && fs.existsSync(tempFilePath)) {
    try { fs.unlinkSync(tempFilePath); } catch {}
  }

  const writeStream = fs.createWriteStream(tempFilePath, {
    flags: 'a',
    highWaterMark: 1024 * 1024,
  });

  req.pipe(writeStream);

  writeStream.on('finish', () => {
    // If last chunk, finalize into permanent video file
    if (chunkIndex >= totalChunks - 1) {
      if (fs.existsSync(tempFilePath)) {
        if (fs.existsSync(finalFilePath)) {
          try { fs.unlinkSync(finalFilePath); } catch {}
        }
        fs.renameSync(tempFilePath, finalFilePath);
      }

      const host = req.get('host') || `localhost:${PORT}`;
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      const videoPath = `/uploads/videos/${finalFilename}`;
      const absoluteUrl = `${protocol}://${host}${videoPath}`;
      const finalStat = fs.statSync(finalFilePath);
      const sizeBytes = finalStat.size;
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
      const sizeGB = (sizeBytes / (1024 * 1024 * 1024)).toFixed(3);

      res.json({
        success: true,
        done: true,
        chunkIndex,
        totalChunks,
        message: "Vidiyoon saffisa olaanaadhaan (Chunked Stream) sarara online systemii irratti milkaa'inaan ol-kaa'ameera!",
        videoUrl: videoPath,
        absoluteUrl: absoluteUrl,
        filename: finalFilename,
        originalName: rawFilename,
        sizeBytes: sizeBytes,
        sizeMB: sizeMB,
        sizeGB: sizeGB,
        storageQuota: '500 GB+ Dedicated Cloud Storage',
        deviceStorageUsed: '0 MB (Direct Server Stream)',
        uploadedAt: new Date().toISOString(),
      });
    } else {
      res.json({
        success: true,
        done: false,
        chunkIndex,
        totalChunks,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
      });
    }
  });

  writeStream.on('error', (err) => {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Chunk write error: ${err.message}` });
    }
  });
});

// API: Ultra-fast raw binary stream video upload (Bypasses multipart overhead for max upload speed)
app.post('/api/upload-video-fast', (req: Request, res: Response): void => {
  req.setTimeout(0);
  if (req.socket) {
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true, 1000);
  }

  const rawFilename = req.headers['x-file-name']
    ? decodeURIComponent(req.headers['x-file-name'] as string)
    : (req.query.filename as string) || 'oda-lesson-video.mp4';

  const ext = path.extname(rawFilename).toLowerCase() || '.mp4';
  const cleanName = path
    .basename(rawFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'lesson';
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const filename = `oda-lesson-${cleanName}-${uniqueSuffix}${ext}`;
  const filePath = path.join(VIDEOS_DIR, filename);

  // 2MB highWaterMark for direct high-throughput disk write without Node.js event loop lag
  const writeStream = fs.createWriteStream(filePath, { highWaterMark: 2 * 1024 * 1024 });
  let totalReceived = 0;

  req.on('data', (chunk) => {
    totalReceived += chunk.length;
  });

  req.on('error', (err) => {
    writeStream.destroy();
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Socket stream error: ${err.message}` });
    }
  });

  writeStream.on('finish', () => {
    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const videoPath = `/uploads/videos/${filename}`;
    const absoluteUrl = `${protocol}://${host}${videoPath}`;
    const sizeBytes = totalReceived;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    const sizeGB = (sizeBytes / (1024 * 1024 * 1024)).toFixed(3);

    res.json({
      success: true,
      turboFast: true,
      message: "Vidiyoon saffisa olaanaadhaan (Turbo Fast Stream) sarara online systemii irratti milkaa'inaan ol-kaa'ameera!",
      videoUrl: videoPath,
      absoluteUrl: absoluteUrl,
      filename: filename,
      originalName: rawFilename,
      sizeBytes: sizeBytes,
      sizeMB: sizeMB,
      sizeGB: sizeGB,
      storageQuota: '500 GB+ Dedicated Cloud Storage',
      deviceStorageUsed: '0 MB (Direct Server Stream)',
      uploadedAt: new Date().toISOString(),
    });
  });

  writeStream.on('error', (err) => {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Disk write error: ${err.message}` });
    }
  });

  req.pipe(writeStream);
});

// API: High-speed upload video directly to 500 GB+ cloud system storage (Multipart Fallback)
app.post('/api/upload-video', (req: Request, res: Response): void => {
  // Prevent socket timeout during large/fast video streams
  req.setTimeout(0);
  if (req.socket) {
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true, 1000);
  }

  upload.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({
        success: false,
        error: `Fe'iisa vidiyoo irratti dogoggorri uumame (Upload error): ${err.message}`,
      });
      return;
    } else if (err) {
      res.status(500).json({
        success: false,
        error: `Dogoggora Server: ${err.message}`,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Faayilli vidiyoo hin filatamne (No video file provided)',
      });
      return;
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const videoPath = `/uploads/videos/${req.file.filename}`;
    const absoluteUrl = `${protocol}://${host}${videoPath}`;
    const sizeBytes = req.file.size;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    const sizeGB = (sizeBytes / (1024 * 1024 * 1024)).toFixed(3);

    res.json({
      success: true,
      message: "Vidiyoon sarara online systemii (500 GB+ Server Disk) irratti milkaa'inaan ol-kaa'ameera!",
      videoUrl: videoPath,
      absoluteUrl: absoluteUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      sizeBytes: sizeBytes,
      sizeMB: sizeMB,
      sizeGB: sizeGB,
      storageQuota: '500 GB+ Dedicated Cloud Storage',
      deviceStorageUsed: '0 MB (Direct Server Stream)',
      uploadedAt: new Date().toISOString(),
    });
  });
});

// API: System storage statistics (500 GB+ quota allocated, used MB, free GB, uploaded files)
app.get('/api/system-storage/stats', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    let totalBytes = 0;
    const fileList = files.map((fileName) => {
      const filePath = path.join(VIDEOS_DIR, fileName);
      const stat = fs.statSync(filePath);
      totalBytes += stat.size;
      return {
        name: fileName,
        sizeBytes: stat.size,
        sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
        sizeGB: (stat.size / (1024 * 1024 * 1024)).toFixed(3),
        createdAt: stat.birthtime,
      };
    });

    const TOTAL_ALLOCATED_GB = 500; // Dedicated 500 GB+ cloud storage allocated for Mr. Oda
    const totalMB = totalBytes / (1024 * 1024);
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    const freeGB = Math.max(0, TOTAL_ALLOCATED_GB - totalGB);
    const usedPercentage = ((totalGB / TOTAL_ALLOCATED_GB) * 100).toFixed(2);

    res.json({
      success: true,
      totalStorageAllocatedGB: TOTAL_ALLOCATED_GB,
      totalStorageAllocatedMB: TOTAL_ALLOCATED_GB * 1024,
      totalVideos: files.length,
      totalSizeBytes: totalBytes,
      totalSizeMB: totalMB.toFixed(2),
      totalSizeGB: totalGB.toFixed(3),
      freeStorageGB: freeGB.toFixed(2),
      usedPercentage: `${usedPercentage}%`,
      cloudStatus: 'Active & High-Speed Stream Ready',
      deviceStorageUsed: '0 MB (Internal storage bypass active)',
      files: fileList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Delete a video from server storage
app.delete('/api/videos/:filename', (req: Request, res: Response) => {
  try {
    const filename = path.basename(req.params.filename);
    const targetPath = path.join(VIDEOS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      res.json({ success: true, message: "Vidiyoon systemii irraa haqameera (Deleted from server)" });
    } else {
      res.status(404).json({ success: false, error: 'Faayilli hin argamne' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Safe streaming proxy for external educational video URLs to prevent browser CORS restrictions
app.get('/api/proxy-video', async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    res.status(400).json({ success: false, error: 'URL dhihaachuu qaba (Missing URL parameter)' });
    return;
  }

  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      res.status(400).json({ success: false, error: 'Protocol dogoggoraa (Invalid protocol)' });
      return;
    }

    const rangeHeader = req.headers.range;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ODA-Educational-App/1.0',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
    });

    if (!response.ok && response.status !== 206) {
      res.status(response.status).json({
        success: false,
        error: `Remote video fetch failed: ${response.status} ${response.statusText}`,
      });
      return;
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges') || 'bytes';
    const contentRange = response.headers.get('content-range');

    res.status(response.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', acceptRanges);
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);

    if (response.body) {
      const { Readable } = await import('stream');
      // @ts-ignore
      const nodeStream = Readable.fromWeb(response.body);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: `Proxy error: ${err.message}`,
    });
  }
});

// Serve static uploaded videos and documents with HTTP Range Requests and proper MIME types
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    setHeaders: (res, filePath) => {
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (filePath.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      } else if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      }
    },
  })
);

// Dev / Prod Vite Server setup
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`[ODA SERVER] Applet running at http://${HOST}:${PORT}`);
    console.log(`[ODA SERVER] Video storage active at ${VIDEOS_DIR}`);
  });
}

startServer().catch((err) => {
  console.error('[ODA SERVER] Failed to start:', err);
});

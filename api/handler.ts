// Vercel Serverless Function entrypoint
// This file is bundled by @vercel/node which handles TypeScript natively
import express from 'express';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { integer, real, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { eq, desc, lt, inArray, sql, and, gt } from 'drizzle-orm';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import crypto from 'crypto';

// ─── Schema ────────────────────────────────────────────────────────────────
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('customer'),
  permissions: jsonb('permissions'),
  createdAt: timestamp('created_at').defaultNow(),
});

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  items: text('items').notNull(),
  total: real('total').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  image: text('image'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isDeleted: boolean('is_deleted').default(false),
  isHidden: boolean('is_hidden').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  fullPortionPieces: integer('full_portion_pieces'),
  hasHalfPortion: boolean('has_half_portion').default(false),
  halfPrice: integer('half_price'),
  halfPortionPieces: integer('half_portion_pieces'),
  hasButterOption: boolean('has_butter_option').default(false),
  butterPrice: integer('butter_price'),
  image: text('image').notNull(),
  category: text('category').notNull(),
  dietaryPreference: text('dietary_preference').notNull(),
  spiceLevel: text('spice_level').notNull(),
  isPopular: boolean('is_popular').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isDhabaSpecial: boolean('is_dhaba_special').default(false),
  outOfStock: boolean('out_of_stock').default(false),
  hasTiming: boolean('has_timing').default(false),
  startTime: text('start_time'),
  endTime: text('end_time'),
  variants: jsonb('variants'),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name').notNull().default('Sparkles'),
  videoUrl: text('video_url'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const journeyMedia = pgTable('journey_media', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  type: text('type').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

const journeySettings = pgTable('journey_settings', {
  id: serial('id').primaryKey(),
  header: text('header').notNull().default('Our Journey'),
  description: text('description').notNull().default(''),
  signature: text('signature').notNull().default('Harjinder Tourist Dhaba'),
  subSignature: text('sub_signature').notNull().default('Serving Memories Since 1991.'),
});

const analyticsSettings = pgTable('analytics_settings', {
  id: serial('id').primaryKey(),
  trackingEnabled: boolean('tracking_enabled').default(true),
  locationTrackingEnabled: boolean('location_tracking_enabled').default(true),
  deviceTrackingEnabled: boolean('device_tracking_enabled').default(true),
  browserTrackingEnabled: boolean('browser_tracking_enabled').default(true),
  liveMonitoringEnabled: boolean('live_monitoring_enabled').default(true),
  exportEnabled: boolean('export_enabled').default(true),
  sessionTimeoutMinutes: integer('session_timeout_minutes').default(30),
  dataRetentionDays: integer('data_retention_days').default(90),
  demoNoticeEnabled: boolean('demo_notice_enabled').default(true),
});

const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  visitorToken: text('visitor_token').notNull().unique(),
  firstVisitAt: timestamp('first_visit_at').defaultNow(),
  lastVisitAt: timestamp('last_visit_at').defaultNow(),
  totalVisits: integer('total_visits').default(1),
  country: text('country'),
  state: text('state'),
  city: text('city'),
  deviceType: text('device_type'),
  os: text('os'),
  browser: text('browser'),
  referrer: text('referrer'),
});

const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  visitorId: integer('visitor_id').references(() => visitors.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  visitTime: timestamp('visit_time').defaultNow(),
  durationSeconds: integer('duration_seconds').default(0),
  landingPage: text('landing_page'),
  exitPage: text('exit_page'),
  isActive: boolean('is_active').default(true),
  lastPingAt: timestamp('last_ping_at').defaultNow(),
});

const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  adminReply: text('admin_reply'),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

const demoNotices = pgTable('demo_notices', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Staff Auth Tables ────────────────────────────────────────────────────────
// Per-user accounts for admin and manager login
const staffAccounts = pgTable('staff_accounts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(),         // 'admin' | 'manager'
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  permissions: jsonb('permissions'),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
});

// Time-limited OTP codes (10 min expiry)
const otpSessions = pgTable('otp_sessions', {
  id: serial('id').primaryKey(),
  staffId: integer('staff_id').notNull().references(() => staffAccounts.id, { onDelete: 'cascade' }),
  otpHash: text('otp_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Database ───────────────────────────────────────────────────────────────
const schema = { users, orders, categories, menuItems, features, journeyMedia, journeySettings, analyticsSettings, visitors, visits, reviews, demoNotices, staffAccounts, otpSessions };

let dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ CRITICAL: No DATABASE_URL or POSTGRES_URL env var found. Set it in Vercel project settings → Environment Variables.');
} else {
  // Just ensure pgbouncer is enabled if it's a pooler URL
  if (dbUrl.includes('pooler.supabase.com') && !dbUrl.includes('pgbouncer=true')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
}

// Serverless best practice: max 1 connection per cold start
const queryClient = postgres(dbUrl || '', { 
  max: 1, 
  idle_timeout: 1, 
  connect_timeout: 10,
  prepare: false // CRITICAL: Prevents prepared statement hangs with Supabase pooler
});
const db = drizzle(queryClient, { schema });

// ─── Firebase Admin ─────────────────────────────────────────────────────────
let adminAuth: any = {
  verifyIdToken: async () => ({ uid: 'dummy' }),
  createUser: async () => ({ uid: 'dummy-' + Date.now() }),
  updateUser: async () => ({}),
  deleteUser: async () => ({}),
};

try {
  // if (!getApps().length) {
  //   initializeApp({ projectId: 'smart-thunder-8tgzl' });
  // }
  // adminAuth = getAuth();
} catch (e: any) {
  console.warn('Firebase Admin init failed (using stub):', e?.message || e);
}

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Email (Resend) ───────────────────────────────────────────────────────────
const resendClient = new Resend(process.env.RESEND_API_KEY || '');
const EMAIL_FROM = process.env.EMAIL_FROM || 'Harjinder Dhaba <onboarding@resend.dev>';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);

// ─── Staff Auth Helpers ───────────────────────────────────────────────────────
async function ensureStaffTables() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS staff_accounts (
        id            SERIAL PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        name          TEXT NOT NULL,
        role          TEXT NOT NULL DEFAULT 'manager',
        password_hash TEXT NOT NULL,
        is_active     BOOLEAN DEFAULT true,
        permissions   JSONB,
        last_login    TIMESTAMP,
        created_at    TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure superadmin exists based on .env ADMIN_PASSWORD_HASH
    const adminEmail = (process.env.ADMIN_EMAIL || 'harjinderdhaba1991@gmail.com').toLowerCase();
    const adminHash  = process.env.ADMIN_PASSWORD_HASH;

    if (adminHash) {
      const exists = await db.select().from(staffAccounts).where(eq(staffAccounts.email, adminEmail)).limit(1);
      if (exists.length === 0) {
        await db.insert(staffAccounts).values({
          email: adminEmail,
          name: 'SUPERADMIN',
          role: 'admin',
          passwordHash: adminHash,
          permissions: { superadmin: true }
        });
        console.log(`[StaffAuth] Superadmin created for ${adminEmail}`);
      }
    }

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        id          SERIAL PRIMARY KEY,
        staff_id    INTEGER NOT NULL REFERENCES staff_accounts(id) ON DELETE CASCADE,
        otp_hash    TEXT NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        used        BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS otp_sessions_staff_id_idx ON otp_sessions(staff_id);`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS otp_sessions_expires_idx  ON otp_sessions(expires_at);`);
  } catch (err) {
    console.error('[StaffAuth] Failed to ensure tables:', err);
  }
}

async function ensureAdminAccount() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash  = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !adminHash) return;
  try {
    const existing = await db.select().from(staffAccounts).where(eq(staffAccounts.email, adminEmail)).limit(1);
    if (existing.length === 0) {
      await db.insert(staffAccounts).values({
        email: adminEmail,
        name: 'Admin',
        role: 'admin',
        passwordHash: adminHash,
        isActive: true,
      });
      console.log('[StaffAuth] Admin account seeded from env vars.');
    }
  } catch (_) {}
}

let staffTablesReady = false;
async function initStaffAuth() {
  if (staffTablesReady) return;
  await ensureStaffTables();
  await ensureAdminAccount();
  staffTablesReady = true;
}

async function createOtp(staffId: number): Promise<string> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(code, 8);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await db.update(otpSessions)
    .set({ used: true })
    .where(and(eq(otpSessions.staffId, staffId), eq(otpSessions.used, false)));
  await db.insert(otpSessions).values({ staffId, otpHash: hash, expiresAt });
  return code;
}

async function sendOtpEmail(toEmail: string, name: string, code: string): Promise<void> {
  try {
    await resendClient.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: 'Your Login Verification Code — Harjinder Tourist Dhaba',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1008;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;padding:6px 12px;background:rgba(200,155,60,0.1);border:1px solid rgba(200,155,60,0.2);border-radius:20px;margin-bottom:12px;">
              <span style="color:#C89B3C;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Secure Gateway</span>
            </div>
            <h1 style="color:#ffffff;font-size:24px;font-weight:bold;margin:0;font-family:serif;">Harjinder Tourist <span style="color:#C89B3C;">Dhaba</span></h1>
          </div>
          <h2 style="color:#C89B3C;font-size:22px;margin-bottom:8px;">Verification Code</h2>
          <p style="color:#d6d3d1;margin-bottom:24px;">Hello ${name}, use this code to sign in:</p>
          <div style="background:#0d0804;border:2px solid #C89B3C55;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <div style="font-size:48px;font-weight:700;letter-spacing:16px;color:#C89B3C;font-family:monospace;user-select:all;cursor:pointer;">${code}</div>
            <div style="margin-top:16px;font-size:12px;color:#a8a29e;">
              <span style="display:inline-flex;align-items:center;padding:6px 12px;background:#1a1008;border-radius:16px;border:1px solid #33261c;">
                📋 Double-click code to select and copy
              </span>
            </div>
          </div>
          <p style="color:#78716c;font-size:13px;line-height:1.6;">This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Do not share it with anyone.</p>
          <p style="color:#44403c;font-size:12px;margin-top:16px;border-top:1px solid #33261c;padding-top:16px;">Harjinder Tourist Dhaba — Management System</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[StaffAuth] Failed to send OTP email:', err);
    throw new Error('Failed to send verification email. Check RESEND_API_KEY.');
  }
}

async function sendManagerWelcomeEmail(toEmail: string, name: string, password: string, role: string): Promise<void> {
  const loginUrl = process.env.VERCEL_URL
    ? `https://www.harjindertouristdhaba.com/htd-ctrl-9x7k2m/${role}`
    : `http://localhost:3000/htd-ctrl-9x7k2m/${role}`;
  try {
    await resendClient.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: 'Your Manager Account — Harjinder Tourist Dhaba',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 16px;background:#1a1008;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="display:inline-block;padding:6px 12px;background:rgba(200,155,60,0.1);border:1px solid rgba(200,155,60,0.2);border-radius:20px;margin-bottom:12px;">
              <span style="color:#C89B3C;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">Secure Gateway</span>
            </div>
            <h1 style="color:#ffffff;font-size:24px;font-weight:bold;margin:0;font-family:serif;">Harjinder Tourist <span style="color:#C89B3C;">Dhaba</span></h1>
          </div>
          <h2 style="color:#C89B3C;font-size:22px;margin-bottom:8px;">Welcome, ${name}!</h2>
          <p style="color:#d6d3d1;margin-bottom:24px;line-height:1.6;">Your manager account has been successfully created. You can now access the management dashboard.</p>
          <div style="background:#0d0804;border:1px solid #C89B3C33;border-radius:12px;padding:24px;margin-bottom:24px;box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <table style="width:100%;border-spacing:0;">
              <tr>
                <td style="color:#a8a29e;padding:12px 0;font-size:13px;border-bottom:1px solid #292524;width:80px;vertical-align:top;">Login URL</td>
                <td style="color:#C89B3C;padding:12px 0;font-size:14px;border-bottom:1px solid #292524;">
                  <a href="${loginUrl}" style="color:#C89B3C;text-decoration:none;font-weight:bold;word-break:break-all;display:block;">${loginUrl}</a>
                </td>
              </tr>
              <tr>
                <td style="color:#a8a29e;padding:12px 0;font-size:13px;border-bottom:1px solid #292524;vertical-align:top;">Email</td>
                <td style="color:#f5f5f4;padding:12px 0;font-size:14px;border-bottom:1px solid #292524;user-select:all;word-break:break-all;">${toEmail}</td>
              </tr>
              <tr>
                <td style="color:#a8a29e;padding:16px 0 0 0;font-size:13px;vertical-align:middle;">Password</td>
                <td style="padding:16px 0 0 0;">
                  <div style="display:inline-block;background:#1a1008;border:1px solid #C89B3C55;border-radius:8px;padding:10px 16px;color:#f5f5f4;font-family:monospace;font-size:18px;font-weight:bold;letter-spacing:2px;user-select:all;cursor:pointer;">
                    ${password}
                  </div>
                  <div style="font-size:12px;color:#a8a29e;margin-top:8px;">
                    <span style="display:inline-flex;align-items:center;padding:4px 8px;background:#1a1008;border-radius:12px;border:1px solid #33261c;">
                      📋 Double-click password to select and copy
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>
          <p style="color:#a8a29e;font-size:13px;line-height:1.6;">Each login requires a 6-digit verification code sent to your email.</p>
          <div style="background:rgba(239,68,68,0.1);border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin-top:16px;margin-bottom:24px;">
            <p style="color:#ef4444;font-size:13px;margin:0;font-weight:bold;">⚠️ Please change your password after your first login.</p>
          </div>
          <p style="color:#44403c;font-size:12px;margin-top:24px;border-top:1px solid #33261c;padding-top:16px;">Harjinder Tourist Dhaba — Management System</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[StaffAuth] Failed to send welcome email:', err);
  }
}

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── Staff Auth Routes ────────────────────────────────────────────────────────

// POST /api/staff/login — verify email+password, send OTP
app.post('/api/staff/login', async (req, res) => {
  try {
    await initStaffAuth();
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const staffList = await db.select().from(staffAccounts)
      .where(and(eq(staffAccounts.email, email.toLowerCase()), eq(staffAccounts.isActive, true)))
      .limit(1);

    if (!staffList.length) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const staff = staffList[0];

    if (role && staff.role !== role) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, staff.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const code = await createOtp(staff.id);
    // Fire email asynchronously for zero-delay response
    sendOtpEmail(staff.email, staff.name, code).catch(e => console.error('[sendOtpEmail]', e));

    return res.json({ otpSent: true, staffId: staff.id });
  } catch (e: any) {
    console.error('[staff/login]', e);
    res.status(500).json({ error: e.message || 'Login failed.' });
  }
});

// POST /api/staff/verify-otp — verify OTP, return session token
app.post('/api/staff/verify-otp', async (req, res) => {
  try {
    const { staffId, otp } = req.body;
    if (!staffId || !otp) return res.status(400).json({ error: 'staffId and otp are required.' });

    const now = new Date();
    const sessions = await db.select().from(otpSessions)
      .where(and(
        eq(otpSessions.staffId, Number(staffId)),
        eq(otpSessions.used, false),
        gt(otpSessions.expiresAt, now),
      ))
      .orderBy(desc(otpSessions.createdAt))
      .limit(1);

    if (!sessions.length) {
      return res.status(401).json({ error: 'Verification code expired or not found. Please request a new one.' });
    }

    const valid = await bcrypt.compare(String(otp), sessions[0].otpHash);
    if (!valid) return res.status(401).json({ error: 'Invalid verification code.' });

    await db.update(otpSessions).set({ used: true }).where(eq(otpSessions.id, sessions[0].id));
    await db.update(staffAccounts).set({ lastLogin: new Date() }).where(eq(staffAccounts.id, Number(staffId)));

    const staffList = await db.select().from(staffAccounts).where(eq(staffAccounts.id, Number(staffId))).limit(1);
    const staff = staffList[0];

    const sessionToken = crypto.randomUUID();
    return res.json({
      success: true,
      sessionToken,
      role: staff.role,
      name: staff.name,
      email: staff.email,
      permissions: staff.permissions,
    });
  } catch (e: any) {
    console.error('[staff/verify-otp]', e);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// POST /api/staff/resend-otp — resend OTP (rate-limited: 1 per 60s)
app.post('/api/staff/resend-otp', async (req, res) => {
  try {
    const { staffId } = req.body;
    if (!staffId) return res.status(400).json({ error: 'staffId required.' });

    const since = new Date(Date.now() - 60 * 1000);
    const recent = await db.select().from(otpSessions)
      .where(and(eq(otpSessions.staffId, Number(staffId)), gt(otpSessions.createdAt, since)))
      .limit(1);
    if (recent.length) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new code.' });
    }

    const staffList = await db.select().from(staffAccounts).where(eq(staffAccounts.id, Number(staffId))).limit(1);
    if (!staffList.length) return res.status(404).json({ error: 'Staff account not found.' });
    const staff = staffList[0];

    const code = await createOtp(staff.id);
    sendOtpEmail(staff.email, staff.name, code).catch(e => console.error('[sendOtpEmail]', e));
    return res.json({ sent: true });
  } catch (e: any) {
    console.error('[staff/resend-otp]', e);
    res.status(500).json({ error: e.message || 'Failed to resend.' });
  }
});

// GET /api/staff/me — lightweight session validation (token is client-held UUID; stateless)
app.get('/api/staff/me', async (req, res) => {
  const staffId = req.headers['x-staff-id'];
  if (!staffId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const staff = await db.select().from(staffAccounts).where(eq(staffAccounts.id, Number(staffId))).limit(1);
    if (!staff.length || !staff[0].isActive) return res.status(401).json({ error: 'Account inactive.' });
    return res.json({ role: staff[0].role, name: staff[0].name, email: staff[0].email });
  } catch (e: any) { res.status(500).json({ error: 'Failed.' }); }
});

// GET /api/staff/admin-exists — returns whether at least one admin account exists
app.get('/api/staff/admin-exists', async (req, res) => {
  try {
    await initStaffAuth();
    const admins = await db.select({ id: staffAccounts.id })
      .from(staffAccounts)
      .where(and(eq(staffAccounts.role, 'admin'), eq(staffAccounts.isActive, true)))
      .limit(1);
    return res.json({ exists: admins.length > 0 });
  } catch (e: any) {
    console.error('[staff/admin-exists]', e);
    res.status(500).json({ exists: false, error: e.message });
  }
});

// POST /api/staff/setup — create the FIRST admin account (only allowed when no admin exists)
app.post('/api/staff/setup', async (req, res) => {
  try {
    await initStaffAuth();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Only allowed if NO admin account exists yet
    const existing = await db.select({ id: staffAccounts.id })
      .from(staffAccounts)
      .where(and(eq(staffAccounts.role, 'admin'), eq(staffAccounts.isActive, true)))
      .limit(1);

    if (existing.length > 0) {
      return res.status(403).json({ error: 'An admin account already exists. Use the login form.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [newAdmin] = await db.insert(staffAccounts).values({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: 'admin',
      passwordHash,
      isActive: true,
    }).returning();

    console.log('[StaffAuth] First admin account created:', newAdmin.email);
    return res.json({ success: true, message: 'Admin account created. You can now log in.' });
  } catch (e: any) {
    console.error('[staff/setup]', e);
    if (e.message?.includes('unique')) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(500).json({ error: e.message || 'Setup failed.' });
  }
});

// DELETE /api/staff/clear-all — DEV ONLY: wipe all staff accounts and OTP sessions
app.delete('/api/staff/clear-all', async (req, res) => {
  // Safety: only allow in non-production or with a secret header
  const secret = req.headers['x-clear-secret'];
  if (process.env.NODE_ENV === 'production' && secret !== process.env.CLEAR_SECRET) {
    return res.status(403).json({ error: 'Not allowed in production.' });
  }
  try {
    await db.delete(otpSessions);
    await db.delete(staffAccounts);
    staffTablesReady = false; // reset so initStaffAuth re-runs on next request
    return res.json({ success: true, message: 'All staff accounts and OTP sessions cleared.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// DB connection test — use this to verify DB works on Vercel
app.get('/api/db-test', async (req, res) => {
  const hasUrl = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  try {
    const result = await queryClient`SELECT NOW() as time, current_database() as db`;
    res.json({ ok: true, hasUrl, time: result[0].time, db: result[0].db, dbUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'NOT SET' });
  } catch (e: any) {
    res.status(500).json({ ok: false, hasUrl, error: e.message, dbUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':***@') : 'NOT SET' });
  }
});

  

// ─── POS / Storefront / Admin Data ──────────────────────────────────────────
app.get('/api/pos-data', async (req, res) => {
  // Edge/Browser caching (60s fresh, 300s stale)
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const [menu, cats] = await Promise.all([
      db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id),
      db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id)
    ]);
    res.json({ menuItems: menu, categories: cats });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/storefront-data', async (req, res) => {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  try {
    const [menu, cats, feats, settings] = await Promise.all([
      db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id),
      db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id),
      db.select().from(features).orderBy(features.displayOrder, features.id),
      db.select().from(journeySettings).limit(1)
    ]);
    const visibleCats = cats.filter(c => !c.isHidden);
    const visibleCatNames = visibleCats.map(c => c.name);
    const visibleMenu = menu.filter(m => visibleCatNames.includes(m.category));
    res.json({ menuItems: visibleMenu, categories: visibleCats, features: feats, journeySettings: settings[0] || { header: 'Our Journey', description: '' } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin-data', async (req, res) => {
  try {
    const menu = await db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id);
    const cats = await db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id);
    const feats = await db.select().from(features).orderBy(features.displayOrder, features.id);
    const deletedCats = await db.select().from(categories).where(eq(categories.isDeleted, true));
    const deletedItems = await db.select().from(menuItems).where(eq(menuItems.isDeleted, true));
    const settings = await db.select().from(journeySettings).limit(1);
    res.json({ menuItems: menu, categories: cats, features: feats, deletedData: { categories: deletedCats, menuItems: deletedItems }, journeySettings: settings[0] || { header: 'Our Journey', description: '' } });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.post("/api/categories/:id/toggle-visibility", async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;
    const updated = await db.update(categories).set({ isHidden }).where(eq(categories.id, Number(id))).returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to toggle category visibility: " + (error.message || error) });
  }
});

app.get('/api/categories', async (req, res) => {
  try { res.json(await db.select().from(categories).where(eq(categories.isDeleted, false))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, image, startTime, endTime } = req.body;
    const r = await db.insert(categories).values({ name, image, startTime: startTime || null, endTime: endTime || null }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, image, startTime, endTime } = req.body;
    
    // Get the old category name first
    const oldCat = await db.select().from(categories).where(eq(categories.id, Number(req.params.id))).limit(1);
    
    // If name changed, update all menu items in this category
    if (oldCat.length > 0 && oldCat[0].name !== name) {
      await db.update(menuItems).set({ category: name }).where(eq(menuItems.category, oldCat[0].name));
    }
    
    const r = await db.update(categories).set({ name, image, startTime: startTime || null, endTime: endTime || null }).where(eq(categories.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const cat = await db.select().from(categories).where(eq(categories.id, Number(req.params.id))).limit(1);
    if (cat.length > 0) await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.category, cat[0].name));
    await db.update(categories).set({ isDeleted: true }).where(eq(categories.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories/:id/recover', async (req, res) => {
  try {
    const cat = await db.select().from(categories).where(eq(categories.id, Number(req.params.id))).limit(1);
    if (cat.length > 0) await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.category, cat[0].name));
    await db.update(categories).set({ isDeleted: false }).where(eq(categories.id, Number(req.params.id)));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id/permanent', async (req, res) => {
  try { await db.delete(categories).where(eq(categories.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Menu Items ───────────────────────────────────────────────────────────────
app.get('/api/menu-items', async (req, res) => {
  try { res.json(await db.select().from(menuItems).where(eq(menuItems.isDeleted, false))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const item = req.body;
    const r = await db.insert(menuItems).values({
      name: item.name, description: item.description, price: Number(item.price),
      fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
      hasHalfPortion: Boolean(item.hasHalfPortion),
      halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
      halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
      hasButterOption: Boolean(item.hasButterOption),
      butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
      image: item.image, category: item.category, dietaryPreference: item.dietaryPreference,
      spiceLevel: item.spiceLevel, isPopular: Boolean(item.isPopular), isBestSeller: Boolean(item.isBestSeller),
      isDhabaSpecial: Boolean(item.isDhabaSpecial), outOfStock: Boolean(item.outOfStock),
      hasTiming: Boolean(item.hasTiming),
      startTime: item.hasTiming && item.startTime ? item.startTime : null,
      endTime: item.hasTiming && item.endTime ? item.endTime : null,
      variants: item.variants ? item.variants : []
    }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const item = req.body;
    const r = await db.update(menuItems).set({
      name: item.name, description: item.description, price: Number(item.price),
      fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
      hasHalfPortion: Boolean(item.hasHalfPortion),
      halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
      halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
      hasButterOption: Boolean(item.hasButterOption),
      butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
      image: item.image, category: item.category, dietaryPreference: item.dietaryPreference,
      spiceLevel: item.spiceLevel, isPopular: Boolean(item.isPopular), isBestSeller: Boolean(item.isBestSeller),
      isDhabaSpecial: Boolean(item.isDhabaSpecial), outOfStock: Boolean(item.outOfStock),
      hasTiming: Boolean(item.hasTiming),
      startTime: item.hasTiming && item.startTime ? item.startTime : null,
      endTime: item.hasTiming && item.endTime ? item.endTime : null,
      variants: item.variants ? item.variants : []
    }).where(eq(menuItems.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try { await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/menu-items/:id/recover', async (req, res) => {
  try { await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/menu-items/:id/permanent', async (req, res) => {
  try { await db.delete(menuItems).where(eq(menuItems.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/deleted-items', async (req, res) => {
  try {
    const deletedCats = await db.select().from(categories).where(eq(categories.isDeleted, true));
    const deletedMenuItems = await db.select().from(menuItems).where(eq(menuItems.isDeleted, true));
    res.json({ categories: deletedCats, menuItems: deletedMenuItems });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Journey Settings ─────────────────────────────────────────────────────────
app.get('/api/journey-settings', async (req, res) => {
  try {
    const items = await db.select().from(journeySettings);
    res.json(items.length === 0 ? {
      header: 'Our Journey',
      description: 'Since 1991, Harjinder Tourist Dhaba has been serving authentic Punjabi hospitality on the Kharar–Kurali Highway.',
      signature: 'Harjinder Tourist Dhaba', subSignature: 'Serving Memories Since 1991.'
    } : items[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/journey-settings', async (req, res) => {
  try {
    const { header, description, signature, subSignature } = req.body;
    const items = await db.select().from(journeySettings);
    if (items.length === 0) {
      const r = await db.insert(journeySettings).values({ header, description, signature, subSignature }).returning();
      res.json(r[0]);
    } else {
      const r = await db.update(journeySettings).set({ header, description, signature, subSignature }).where(eq(journeySettings.id, items[0].id)).returning();
      res.json(r[0]);
    }
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Journey Media ────────────────────────────────────────────────────────────
app.get('/api/journey-media', async (req, res) => {
  try { res.json(await db.select().from(journeyMedia).where(eq(journeyMedia.isActive, true)).orderBy(journeyMedia.displayOrder)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/journey-media', async (req, res) => {
  try {
    const { url, type, displayOrder, isActive } = req.body;
    const r = await db.insert(journeyMedia).values({ url, type, displayOrder, isActive }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/journey-media/:id', async (req, res) => {
  try {
    const { url, type, displayOrder, isActive } = req.body;
    const r = await db.update(journeyMedia).set({ url, type, displayOrder, isActive }).where(eq(journeyMedia.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/journey-media/:id', async (req, res) => {
  try { await db.delete(journeyMedia).where(eq(journeyMedia.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Features ─────────────────────────────────────────────────────────────────
app.get('/api/features', async (req, res) => {
  try { res.json(await db.select().from(features).orderBy(features.displayOrder)); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/features', async (req, res) => {
  try {
    const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
    const r = await db.insert(features).values({ title, description, iconName: iconName || 'Sparkles', videoUrl: videoUrl || null, displayOrder: displayOrder ?? 0, isActive: isActive ?? true }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/features/:id', async (req, res) => {
  try {
    const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
    const r = await db.update(features).set({ title, description, iconName, videoUrl: videoUrl || null, displayOrder, isActive }).where(eq(features.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/features/:id', async (req, res) => {
  try { await db.delete(features).where(eq(features.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
app.get('/api/reviews', async (req, res) => {
  try { res.json(await db.select().from(reviews).where(eq(reviews.isHidden, false)).orderBy(desc(reviews.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const r = await db.insert(reviews).values({ name, rating, comment }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews/:id/vote', async (req, res) => {
  try {
    const { type } = req.body;
    const existing = await db.select().from(reviews).where(eq(reviews.id, Number(req.params.id)));
    if (!existing.length) return res.status(404).json({ error: 'Review not found' });
    const r = await db.update(reviews).set(type === 'like' ? { likes: existing[0].likes + 1 } : { dislikes: existing[0].dislikes + 1 }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/reviews', async (req, res) => {
  try { res.json(await db.select().from(reviews).orderBy(desc(reviews.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/reviews/:id/visibility', async (req, res) => {
  try {
    const r = await db.update(reviews).set({ isHidden: req.body.isHidden }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/reviews/:id/reply', async (req, res) => {
  try {
    const r = await db.update(reviews).set({ adminReply: req.body.adminReply }).where(eq(reviews.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/reviews/:id', async (req, res) => {
  try { await db.delete(reviews).where(eq(reviews.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Analytics ────────────────────────────────────────────────────────────────
app.get('/api/analytics/settings', async (req, res) => {
  try {
    let s = await db.select().from(analyticsSettings);
    if (s.length === 0) { const ns = await db.insert(analyticsSettings).values({}).returning(); res.json(ns[0]); }
    else res.json(s[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/analytics/settings', async (req, res) => {
  try {
    const s = await db.select().from(analyticsSettings);
    if (s.length > 0) {
      const r = await db.update(analyticsSettings).set(req.body).where(eq(analyticsSettings.id, s[0].id)).returning();
      res.json(r[0]);
    } else res.status(404).json({ error: 'Not found' });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { visitorToken, sessionToken, deviceType, os, browser, referrer, landingPage, path } = req.body;
    if (!visitorToken || !sessionToken) return res.json({ success: false, message: 'Missing tokens' });
    let s = await db.select().from(analyticsSettings);
    if (s.length === 0) { const ns = await db.insert(analyticsSettings).values({}).returning(); s = ns; }
    if (!s[0].trackingEnabled) return res.json({ success: false, message: 'Tracking disabled' });
    let vRecs = await db.select().from(visitors).where(eq(visitors.visitorToken, visitorToken));
    let visitorId: number;
    if (vRecs.length === 0) {
      const nv = await db.insert(visitors).values({ visitorToken, deviceType: s[0].deviceTrackingEnabled ? deviceType : null, os: s[0].deviceTrackingEnabled ? os : null, browser: s[0].browserTrackingEnabled ? browser : null, referrer, firstVisitAt: new Date(), lastVisitAt: new Date(), totalVisits: 1 }).returning();
      visitorId = nv[0].id;
    } else {
      visitorId = vRecs[0].id;
      await db.update(visitors).set({ lastVisitAt: new Date(), totalVisits: vRecs[0].totalVisits! + 1 }).where(eq(visitors.id, visitorId));
    }
    let sess = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
    if (sess.length === 0) {
      await db.insert(visits).values({ visitorId, sessionToken, landingPage, exitPage: path, visitTime: new Date(), lastPingAt: new Date(), isActive: true }).onConflictDoUpdate({ target: visits.sessionToken, set: { exitPage: path, lastPingAt: new Date(), isActive: true } });
    } else {
      const lastPing = new Date();
      const duration = Math.floor((lastPing.getTime() - new Date(sess[0].visitTime!).getTime()) / 1000);
      await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, sess[0].id));
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/ping', async (req, res) => {
  try {
    const { sessionToken, path } = req.body;
    if (!sessionToken) return res.json({ success: false });
    const sess = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
    if (sess.length > 0) {
      const lastPing = new Date();
      const duration = Math.floor((lastPing.getTime() - new Date(sess[0].visitTime!).getTime()) / 1000);
      await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, sess[0].id));
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const allVisits = await db.select().from(visits);
    const allVisitors = await db.select().from(visitors);
    const activeThreshold = new Date(Date.now() - 5 * 60000);
    await db.update(visits).set({ isActive: false }).where(lt(visits.lastPingAt, activeThreshold));
    const activeVisits = await db.select().from(visits).where(eq(visits.isActive, true));
    res.json({ visits: allVisits, visitors: allVisitors, activeVisitors: activeVisits.length });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/analytics/clear', async (req, res) => {
  try { await db.delete(visits); await db.delete(visitors); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/analytics/visitors/:id', async (req, res) => {
  try { await db.delete(visitors).where(eq(visitors.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/analytics/visitors/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) await db.delete(visitors).where(inArray(visitors.id, ids));
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Managers / Staff ─────────────────────────────────────────────────────────
app.get('/api/admin/staff', async (req, res) => {
  try { 
    res.json(await db.select().from(staffAccounts).where(inArray(staffAccounts.role, ['manager', 'admin']))); 
  }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/staff', async (req, res) => {
  try {
    await initStaffAuth();
    const { email, password, name, role, permissions } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'email, password, name, and role are required.' });
    }
    
    // Ensure uppercase name
    const upperName = name.toUpperCase();

    // Check for duplicate email
    const existing = await db.select().from(staffAccounts).where(eq(staffAccounts.email, email.toLowerCase())).limit(1);
    if (existing.length) {
      return res.status(409).json({ error: 'A staff member with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Also create Firebase user for legacy Firebase auth (if adminAuth is active)
    let fbUid = `staff_${Date.now()}`;
    try { const fu = await adminAuth.createUser({ email, password, displayName: upperName }); fbUid = fu.uid; } catch (_) {}

    // Insert into legacy users table
    await db.insert(users).values({ uid: fbUid, email: email.toLowerCase(), name: upperName, role: role, permissions: permissions || {} }).catch(() => {});

    // Insert into new staff_accounts table
    const newStaff = await db.insert(staffAccounts).values({
      email: email.toLowerCase(),
      name: upperName,
      role: role,
      passwordHash,
      isActive: true,
      permissions: permissions || {},
    }).returning();

    // Send welcome email (non-fatal if Resend not configured)
    await sendManagerWelcomeEmail(email, upperName, password, role);

    res.json({ ...newStaff[0], passwordHash: undefined });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put('/api/admin/staff/:id', async (req, res) => {
  try {
    const { permissions, password, name, email } = req.body;
    const staffId = Number(req.params.id);
    const staff = await db.select().from(staffAccounts).where(eq(staffAccounts.id, staffId)).limit(1);
    
    if (staff.length) {
      const staffUpdate: any = { permissions };
      if (name) staffUpdate.name = name;
      if (email) staffUpdate.email = email.toLowerCase();
      if (password) staffUpdate.passwordHash = await bcrypt.hash(password, 12);
      await db.update(staffAccounts).set(staffUpdate).where(eq(staffAccounts.id, staffId));
      
      // Also update legacy users table if it exists
      const user = await db.select().from(users).where(eq(users.email, staff[0].email)).limit(1);
      if (user.length) {
        if (password) { try { await adminAuth.updateUser(user[0].uid, { password }); } catch (_) {} }
        if (name) { try { await adminAuth.updateUser(user[0].uid, { displayName: name }); } catch (_) {} }
        if (email) { try { await adminAuth.updateUser(user[0].uid, { email: email.toLowerCase() }); } catch (_) {} }
        
        const updateData: any = { permissions };
        if (name) updateData.name = name;
        if (email) updateData.email = email.toLowerCase();
        await db.update(users).set(updateData).where(eq(users.id, user[0].id));
      }
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/staff/:id', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const staff = await db.select().from(staffAccounts).where(eq(staffAccounts.id, staffId)).limit(1);
    
    if (staff.length) {
      const user = await db.select().from(users).where(eq(users.email, staff[0].email)).limit(1);
      if (user.length) {
        try { await adminAuth.deleteUser(user[0].uid); } catch (_) {}
        await db.delete(users).where(eq(users.id, user[0].id));
      }
      await db.delete(staffAccounts).where(eq(staffAccounts.id, staffId));
    }
    res.json({ success: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Admin Stats / Orders ─────────────────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const r: any = await db.execute(sql`
      SELECT
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= ${today.toISOString()}) as daily_revenue,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')) as active_orders,
        (SELECT COUNT(*) FROM users WHERE uid = 'pos_system') as pos_users
    `);
    res.json({ dailyRevenue: Number(r[0].daily_revenue || 0), totalOrders: Number(r[0].total_orders || 0), activeOrders: Number(r[0].active_orders || 0), posUsers: Number(r[0].pos_users || 0) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/daily-revenue', async (req, res) => {
  try {
    const r: any = await db.execute(sql`SELECT DATE(created_at) as date_str, COUNT(id) as order_count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE status = 'completed' GROUP BY DATE(created_at) ORDER BY DATE(created_at) ASC`);
    res.json(r);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
  try { res.json(await db.select().from(orders).orderBy(desc(orders.createdAt))); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/pos/orders', async (req, res) => {
  try {
    const { tableNumber, items, total } = req.body;
    let posUser = await db.select().from(users).where(eq(users.uid, 'pos_system')).limit(1);
    if (posUser.length === 0) {
      const nu = await db.insert(users).values({ uid: 'pos_system', email: 'pos@local', name: 'POS System' }).returning();
      posUser = nu;
    }
    const posItems = [{ name: `Table ${tableNumber}`, price: 0, quantity: 1, isTableMarker: true }, ...items];
    const r = await db.insert(orders).values({ userId: posUser[0].id, items: JSON.stringify(posItems), total, status: 'pending' }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: 'POS order failed: ' + e.message }); }
});

app.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status, items, total } = req.body;
    const updateData: any = {};
    if (status) updateData.status = status;
    if (items !== undefined) updateData.items = items;
    if (total !== undefined) updateData.total = total;
    if (Object.keys(updateData).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const r = await db.update(orders).set(updateData).where(eq(orders.id, Number(req.params.id))).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  try { await db.delete(orders).where(eq(orders.id, Number(req.params.id))); res.json({ success: true }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── Orders (customer) ────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, userId } = req.body;
    const r = await db.insert(orders).values({ userId: userId || 1, items: JSON.stringify(items), total, status: 'pending' }).returning();
    res.json(r[0]);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});


// ─── Vercel Handler ───────────────────────────────────────────────────────────
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  return app(req as any, res as any);
}

import { relations } from 'drizzle-orm';
import { integer, real, pgTable, serial, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').notNull().default('customer'),
  permissions: jsonb('permissions'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'orders' table.
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  localBillId: text('local_bill_id').unique(), // For offline-first idempotency
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  items: text('items').notNull(), // JSON string of cart items
  total: real('total').notNull(),
  status: text('status').notNull().default('pending'), // pending, completed, cancelled
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('orders_local_bill_id_idx').on(table.localBillId),
  index('orders_user_id_idx').on(table.userId),
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt)
]);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  image: text('image'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isDeleted: boolean('is_deleted').default(false),
  isHidden: boolean('is_hidden').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('categories_is_deleted_idx').on(table.isDeleted),
  index('categories_is_hidden_idx').on(table.isHidden)
]);

// Define the 'menu_items' table.
export const menuItems = pgTable('menu_items', {
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
  category: text('category').notNull(), // Veg, Non-Veg, Tandoor, etc.
  dietaryPreference: text('dietary_preference').notNull(), // veg or non-veg
  spiceLevel: text('spice_level').notNull(), // mild, medium, spicy
  isPopular: boolean('is_popular').default(false),
  isBestSeller: boolean('is_best_seller').default(false),
  isDhabaSpecial: boolean('is_dhaba_special').default(false),
  outOfStock: boolean('out_of_stock').default(false),
  hasTiming: boolean('has_timing').default(false),
  startTime: text('start_time'),
  endTime: text('end_time'),
  variants: jsonb('variants'), // Array of {name: string, price: number}
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('menu_items_category_idx').on(table.category),
  index('menu_items_is_deleted_idx').on(table.isDeleted),
  index('menu_items_is_popular_idx').on(table.isPopular)
]);

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));


export const features = pgTable('features', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name').notNull().default('Sparkles'),
  videoUrl: text('video_url'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('features_is_active_idx').on(table.isActive),
  index('features_display_order_idx').on(table.displayOrder)
]);




// Analytics Tables
export const analyticsSettings = pgTable('analytics_settings', {
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
  dashboardCache: jsonb('dashboard_cache'),
  cacheUpdatedAt: timestamp('cache_updated_at'),
});

export const visitors = pgTable('visitors', {
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
}, (table) => [
  index('visitors_token_idx').on(table.visitorToken)
]);

export const visits = pgTable('visits', {
  id: serial('id').primaryKey(),
  visitorId: integer('visitor_id').references(() => visitors.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  visitTime: timestamp('visit_time').defaultNow(),
  durationSeconds: integer('duration_seconds').default(0),
  landingPage: text('landing_page'),
  exitPage: text('exit_page'),
  isActive: boolean('is_active').default(true),
  lastPingAt: timestamp('last_ping_at').defaultNow(),
}, (table) => [
  index('visits_session_token_idx').on(table.sessionToken),
  index('visits_visitor_id_idx').on(table.visitorId)
]);

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // optional if guest reviews are allowed, but better to link if logged in, or just store name
  name: text('name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  likes: integer('likes').notNull().default(0),
  dislikes: integer('dislikes').notNull().default(0),
  adminReply: text('admin_reply'),
  isHidden: boolean('is_hidden').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('reviews_is_hidden_idx').on(table.isHidden)
]);

export const dashboardAuth = pgTable('dashboard_auth', {
  id: serial('id').primaryKey(),
  adminPassword: text('admin_password').notNull().default('ADMIN2043W'),
  managerPassword: text('manager_password').notNull().default('MANAGER2043W'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const demoNotices = pgTable('demo_notices', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const newsTicker = pgTable('news_ticker', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Staff Auth ───────────────────────────────────────────────────────────────
// Per-user accounts for admin and manager login (email + hashed password)
export const staffAccounts = pgTable('staff_accounts', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'admin' | 'manager'
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  permissions: jsonb('permissions'),
  createdBy: integer('created_by'), // references staffAccounts.id (self-ref, nullable)
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
}, (table) => [
  index('staff_accounts_email_idx').on(table.email),
  index('staff_accounts_role_idx').on(table.role),
  index('staff_accounts_is_active_idx').on(table.isActive)
]);

// Time-limited OTP codes — one per login attempt, expires in 10 minutes
export const otpSessions = pgTable('otp_sessions', {
  id: serial('id').primaryKey(),
  staffId: integer('staff_id').notNull().references(() => staffAccounts.id, { onDelete: 'cascade' }),
  otpHash: text('otp_hash').notNull(),   // bcrypt hash of the 6-digit code
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('otp_sessions_staff_id_idx').on(table.staffId),
  index('otp_sessions_used_idx').on(table.used),
  index('otp_sessions_expires_at_idx').on(table.expiresAt)
]);


import "dotenv/config";
import express from "express";
import compression from "compression";
import path from "path";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';
import { db } from './src/db/index.ts';
import { users, orders, menuItems, categories, features, journeyMedia, journeySettings, analyticsSettings, visitors, visits, reviews, dashboardAuth, demoNotices, newsTicker } from './src/db/schema.ts';
import { eq, desc, lt, inArray, sql } from 'drizzle-orm';

const app = express();
const PORT = 3000;
const isVercel = process.env.VERCEL === "1" || process.env.VERCEL;

app.use(compression());

  // CORS headers middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Permissions-Policy', 'usb=(self), bluetooth=(self)');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });


  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Helper to get or init dashboard auth passwords
  let memoryAuth = { id: 1, adminPassword: 'ADMIN2043W', managerPassword: 'MANAGER2043W' };
  let isTableCreated = false;

  async function ensureDashboardAuthTable() {
    if (isTableCreated) return;
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "dashboard_auth" (
          "id" SERIAL PRIMARY KEY,
          "admin_password" TEXT NOT NULL DEFAULT 'ADMIN2043W',
          "manager_password" TEXT NOT NULL DEFAULT 'MANAGER2043W',
          "updated_at" TIMESTAMP DEFAULT NOW()
        );
      `);
      isTableCreated = true;
    } catch (error: any) {
      // Table creation fallback handled gracefully
    }
  }

  async function getDashboardAuth() {
    await ensureDashboardAuthTable();
    try {
      const records = await db.select().from(dashboardAuth).limit(1);
      if (records && records.length > 0) {
        memoryAuth = records[0];
        return records[0];
      }
      const newAuth = await db.insert(dashboardAuth).values({
        adminPassword: memoryAuth.adminPassword,
        managerPassword: memoryAuth.managerPassword,
      }).returning();
      if (newAuth && newAuth.length > 0) {
        memoryAuth = newAuth[0];
        return newAuth[0];
      }
    } catch (error: any) {
      // Graceful fallback to memoryAuth
    }
    return memoryAuth;
  }

  // Dashboard Authentication Endpoints
  app.post("/api/auth/verify-dashboard-password", async (req, res) => {
    try {
      const { role, password } = req.body;
      if (!role || !password) {
        return res.status(400).json({ success: false, error: 'Missing role or password' });
      }
      const auth = await getDashboardAuth();
      const expectedPassword = role === 'admin' ? auth.adminPassword : auth.managerPassword;
      if (password === expectedPassword) {
        return res.json({ success: true });
      } else {
        return res.json({ success: false, error: 'Incorrect password' });
      }
    } catch (error: any) {
      console.error('Verify dashboard password error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  app.get("/api/auth/dashboard-passwords", async (req, res) => {
    try {
      const auth = await getDashboardAuth();
      res.json({
        adminPassword: auth.adminPassword,
        managerPassword: auth.managerPassword,
      });
    } catch (error: any) {
      console.error('Get dashboard passwords error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard passwords' });
    }
  });

  app.post("/api/auth/update-dashboard-passwords", async (req, res) => {
    try {
      const { adminPassword, managerPassword } = req.body;
      let auth = await getDashboardAuth();
      const newAdminPassword = adminPassword && adminPassword.trim() ? adminPassword.trim() : auth.adminPassword;
      const newManagerPassword = managerPassword && managerPassword.trim() ? managerPassword.trim() : auth.managerPassword;

      memoryAuth.adminPassword = newAdminPassword;
      memoryAuth.managerPassword = newManagerPassword;

      try {
        if (auth.id) {
          await db.update(dashboardAuth).set({
            adminPassword: newAdminPassword,
            managerPassword: newManagerPassword,
            updatedAt: new Date(),
          }).where(eq(dashboardAuth.id, auth.id));
        } else {
          await db.insert(dashboardAuth).values({
            adminPassword: newAdminPassword,
            managerPassword: newManagerPassword,
          });
        }
      } catch (dbErr) {
        // Table or DB update error caught gracefully
      }

      res.json({
        success: true,
        message: 'Passwords updated successfully',
        adminPassword: newAdminPassword,
        managerPassword: newManagerPassword,
      });
    } catch (error: any) {
      console.error('Update dashboard passwords error:', error);
      res.status(500).json({ success: false, error: 'Failed to update passwords' });
    }
  });

  // API routes
  
  app.get("/api/pos-data", async (req, res) => {
    try {
      const [menu, cats] = await Promise.all([
        db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id),
        db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id)
      ]);
      res.json({
        menuItems: menu,
        categories: cats
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch pos data: " + (error.message || error) });
    }
  });

  app.get("/api/storefront-data", async (req, res) => {
    try {
      const [menu, cats, feats, settings, tickers] = await Promise.all([
        db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id),
        db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id),
        db.select().from(features).orderBy(features.displayOrder, features.id),
        db.select().from(journeySettings).limit(1),
        db.select().from(newsTicker).where(eq(newsTicker.isActive, true)).orderBy(newsTicker.displayOrder, newsTicker.id)
      ]);
      res.json({
        menuItems: menu,
        categories: cats,
        features: feats,
        journeySettings: settings[0] || { header: 'Our Journey', description: '' },
        newsTickers: tickers
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch storefront data: " + (error.message || error) });
    }
  });

  app.get("/api/admin-data", async (req, res) => {
    try {
      const [menu, cats, feats, deletedCats, deletedItems, settings, tickers] = await Promise.all([
        db.select().from(menuItems).where(eq(menuItems.isDeleted, false)).orderBy(menuItems.id),
        db.select().from(categories).where(eq(categories.isDeleted, false)).orderBy(categories.id),
        db.select().from(features).orderBy(features.displayOrder, features.id),
        db.select().from(categories).where(eq(categories.isDeleted, true)),
        db.select().from(menuItems).where(eq(menuItems.isDeleted, true)),
        db.select().from(journeySettings).limit(1),
        db.select().from(newsTicker).orderBy(newsTicker.displayOrder, newsTicker.id)
      ]);
      
      const deleted = { categories: deletedCats, menuItems: deletedItems };
      res.json({
        menuItems: menu,
        categories: cats,
        features: feats,
        deletedData: deleted,
        journeySettings: settings[0] || { header: 'Our Journey', description: '' },
        newsTickers: tickers
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch admin data: " + (error.message || error) });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const items = await db.select().from(categories).where(eq(categories.isDeleted, false));
      res.json(items);
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories: " + (error.message || error) });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const { name, image, startTime, endTime } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Category name is required" });
      }

      // Check if a soft-deleted category with this name already exists
      const existing = await db.select().from(categories).where(eq(categories.name, name.trim()));
      if (existing.length > 0) {
        if (existing[0].isDeleted) {
          // Recover the deleted category with updated data
          const recovered = await db.update(categories).set({
            isDeleted: false,
            image: image || null,
            startTime: startTime || null,
            endTime: endTime || null,
          }).where(eq(categories.id, existing[0].id)).returning();
          return res.json(recovered[0]);
        } else {
          return res.status(409).json({ error: "A category with this name already exists" });
        }
      }

      const newCategory = await db.insert(categories).values({
        name: name.trim(),
        image: image || null,
        startTime: startTime || null,
        endTime: endTime || null
      }).returning();
      res.json(newCategory[0]);
    } catch (error: any) {
      console.error("Failed to create category:", error);
      res.status(500).json({ error: "Failed to create category: " + (error.message || error) });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, image, startTime, endTime } = req.body;
      const updatedCategory = await db.update(categories).set({ name, image, startTime: startTime || null, endTime: endTime || null }).where(eq(categories.id, Number(id))).returning();
      res.json(updatedCategory[0]);
    } catch (error: any) {
      console.error("Failed to update category:", error);
      res.status(500).json({ error: "Failed to update category: " + (error.message || error) });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Fetch category to get its name
      const categoryToDelete = await db.select().from(categories).where(eq(categories.id, Number(id))).limit(1);
      
      if (categoryToDelete.length > 0) {
        const categoryName = categoryToDelete[0].name;
        // Delete all menu items associated with this category name
        await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.category, categoryName));
      }
      
      await db.update(categories).set({ isDeleted: true }).where(eq(categories.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete category:", error);
      res.status(500).json({ error: "Failed to delete category: " + (error.message || error) });
    }
  });

  // Menu Items API
  app.get("/api/menu-items", async (req, res) => {
    try {
      const items = await db.select().from(menuItems).where(eq(menuItems.isDeleted, false));
      res.json(items);
    } catch (error: any) {
      console.error("Failed to fetch menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items: " + (error.message || error) });
    }
  });

  app.post("/api/menu-items", async (req, res) => {
    try {
      const item = req.body;
      const newItem = await db.insert(menuItems).values({
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
        fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
        hasHalfPortion: Boolean(item.hasHalfPortion),
        halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
        halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
        hasButterOption: Boolean(item.hasButterOption),
        butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
        image: item.image || '',
        category: item.category,
        dietaryPreference: item.dietaryPreference || 'veg',
        spiceLevel: item.spiceLevel || 'None',
        isPopular: Boolean(item.isPopular),
        isBestSeller: Boolean(item.isBestSeller),
        isDhabaSpecial: Boolean(item.isDhabaSpecial),
        outOfStock: Boolean(item.outOfStock),
        hasTiming: Boolean(item.hasTiming),
        startTime: item.hasTiming && item.startTime ? item.startTime : null,
        endTime: item.hasTiming && item.endTime ? item.endTime : null,
        variants: item.variants ? item.variants : []
      }).returning();
      res.json(newItem[0]);
    } catch (error: any) {
      console.error("Failed to create menu item:", error);
      res.status(500).json({ error: "Failed to create menu item", details: error.message });
    }
  });

  app.put("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = req.body;
      const updatedItem = await db.update(menuItems).set({
        name: item.name,
        description: item.description || '',
        price: Number(item.price) || 0,
        fullPortionPieces: item.fullPortionPieces ? Number(item.fullPortionPieces) : null,
        hasHalfPortion: Boolean(item.hasHalfPortion),
        halfPrice: item.hasHalfPortion && item.halfPrice ? Number(item.halfPrice) : null,
        halfPortionPieces: item.hasHalfPortion && item.halfPortionPieces ? Number(item.halfPortionPieces) : null,
        hasButterOption: Boolean(item.hasButterOption),
        butterPrice: item.hasButterOption && item.butterPrice ? Number(item.butterPrice) : null,
        image: item.image || '',
        category: item.category,
        dietaryPreference: item.dietaryPreference || 'veg',
        spiceLevel: item.spiceLevel || 'None',
        isPopular: Boolean(item.isPopular),
        isBestSeller: Boolean(item.isBestSeller),
        isDhabaSpecial: Boolean(item.isDhabaSpecial),
        outOfStock: Boolean(item.outOfStock),
        hasTiming: Boolean(item.hasTiming),
        startTime: item.hasTiming && item.startTime ? item.startTime : null,
        endTime: item.hasTiming && item.endTime ? item.endTime : null,
        variants: item.variants ? item.variants : []
      }).where(eq(menuItems.id, Number(id))).returning();
      res.json(updatedItem[0]);
    } catch (error: any) {
      console.error("Failed to update menu item:", error);
      res.status(500).json({ error: "Failed to update menu item: " + (error.message || error) });
    }
  });

  app.delete("/api/menu-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.update(menuItems).set({ isDeleted: true }).where(eq(menuItems.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete menu item:", error);
      res.status(500).json({ error: "Failed to delete menu item: " + (error.message || error) });
    }
  });


  
  app.post("/api/categories/:id/recover", async (req, res) => {
    try {
      const { id } = req.params;
      
      const categoryToRecover = await db.select().from(categories).where(eq(categories.id, Number(id))).limit(1);
      if (categoryToRecover.length > 0) {
        const categoryName = categoryToRecover[0].name;
        // Recover all menu items associated with this category name
        await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.category, categoryName));
      }

      await db.update(categories).set({ isDeleted: false }).where(eq(categories.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to recover category: " + (error.message || error) });
    }
  });

  app.post("/api/menu-items/:id/recover", async (req, res) => {
    try {
      const { id } = req.params;
      await db.update(menuItems).set({ isDeleted: false }).where(eq(menuItems.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to recover menu item: " + (error.message || error) });
    }
  });

  app.delete("/api/categories/:id/permanent", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(categories).where(eq(categories.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to permanently delete category: " + (error.message || error) });
    }
  });

  app.delete("/api/menu-items/:id/permanent", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(menuItems).where(eq(menuItems.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to permanently delete menu item: " + (error.message || error) });
    }
  });

  app.get("/api/deleted-items", async (req, res) => {
    try {
      const [deletedCategories, deletedMenuItems] = await Promise.all([
        db.select().from(categories).where(eq(categories.isDeleted, true)),
        db.select().from(menuItems).where(eq(menuItems.isDeleted, true))
      ]);
      res.json({ categories: deletedCategories, menuItems: deletedMenuItems });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch deleted items: " + (error.message || error) });
    }
  });


  
  
  app.get("/api/journey-settings", async (req, res) => {
    try {
      const items = await db.select().from(journeySettings);
      if (items.length === 0) {
        res.json({
          header: "Our Journey",
          description: "Since 1991, Harjinder Tourist Dhaba has been serving authentic Punjabi hospitality on the Kharar–Kurali Highway.\n\nWhat started as a humble roadside dhaba with a passion for honest food has grown into a trusted stop for travelers, families, students, and food lovers. For over three decades, we've remained committed to the same values—fresh ingredients, traditional recipes, generous portions, and warm hospitality.\n\nEvery meal we serve carries the rich flavors of Punjab, crafted with care and the belief that great food brings people together. Whether you're beginning a journey, taking a break, or returning home, Harjinder Tourist Dhaba is always ready to welcome you with a delicious meal and a smile.",
          signature: "Harjinder Tourist Dhaba",
          subSignature: "Serving Memories Since 1991."
        });
      } else {
        res.json(items[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch journey settings: " + (error.message || error) });
    }
  });

  app.post("/api/journey-settings", async (req, res) => {
    try {
      const { header, description, signature, subSignature } = req.body;
      const items = await db.select().from(journeySettings);
      if (items.length === 0) {
        const newItem = await db.insert(journeySettings).values({ header, description, signature, subSignature }).returning();
        res.json(newItem[0]);
      } else {
        const updatedItem = await db.update(journeySettings).set({ header, description, signature, subSignature }).where(eq(journeySettings.id, items[0].id)).returning();
        res.json(updatedItem[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update journey settings: " + (error.message || error) });
    }
  });

app.get("/api/journey-media", async (req, res) => {
    try {
      const items = await db.select().from(journeyMedia).where(eq(journeyMedia.isActive, true)).orderBy(journeyMedia.displayOrder);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch journey media: " + (error.message || error) });
    }
  });

  app.post("/api/journey-media", async (req, res) => {
    try {
      const { url, type, displayOrder, isActive } = req.body;
      const newItem = await db.insert(journeyMedia).values({
        url, type, displayOrder, isActive
      }).returning();
      res.json(newItem[0]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to add journey media: " + (error.message || error) });
    }
  });

  app.put("/api/journey-media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { url, type, displayOrder, isActive } = req.body;
      const updatedItem = await db.update(journeyMedia).set({
        url, type, displayOrder, isActive
      }).where(eq(journeyMedia.id, Number(id))).returning();
      res.json(updatedItem[0]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update journey media: " + (error.message || error) });
    }
  });

  app.delete("/api/journey-media/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(journeyMedia).where(eq(journeyMedia.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete journey media: " + (error.message || error) });
    }
  });


  // Features API
  app.get("/api/features", async (req, res) => {
    try {
      const items = await db.select().from(features).orderBy(features.displayOrder);
      res.json(items);
    } catch (error: any) {
      console.error("Failed to fetch features:", error);
      res.status(500).json({ error: "Failed to fetch features: " + (error.message || error) });
    }
  });

  app.post("/api/features", async (req, res) => {
    try {
      const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Feature title is required" });
      }
      const newItem = await db.insert(features).values({ 
        title: title.trim(), 
        description: description || '', 
        iconName: iconName || 'Sparkles', 
        videoUrl: videoUrl || null,
        displayOrder: displayOrder !== undefined ? displayOrder : 0,
        isActive: isActive !== undefined ? isActive : true
      }).returning();
      res.json(newItem[0]);
    } catch (error: any) {
      console.error("Failed to create feature:", error);
      res.status(500).json({ error: "Failed to create feature: " + (error.message || error) });
    }
  });

  app.put("/api/features/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, iconName, videoUrl, displayOrder, isActive } = req.body;
      const updatedItem = await db.update(features).set({ 
        title, 
        description, 
        iconName, 
        videoUrl: videoUrl || null,
        displayOrder,
        isActive
      }).where(eq(features.id, Number(id))).returning();
      res.json(updatedItem[0]);
    } catch (error: any) {
      console.error("Failed to update feature:", error);
      res.status(500).json({ error: "Failed to update feature: " + (error.message || error) });
    }
  });

  app.delete("/api/features/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(features).where(eq(features.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete feature:", error);
      res.status(500).json({ error: "Failed to delete feature: " + (error.message || error) });
    }
  });

  // News Ticker API
  app.get("/api/news-ticker", async (req, res) => {
    try {
      const items = await db.select().from(newsTicker).orderBy(newsTicker.displayOrder, newsTicker.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch news ticker: " + (error.message || error) });
    }
  });

  app.post("/api/news-ticker", async (req, res) => {
    try {
      const { text, isActive, displayOrder } = req.body;
      const newItem = await db.insert(newsTicker).values({ 
        text, 
        isActive: isActive !== undefined ? isActive : true,
        displayOrder: displayOrder || 0
      }).returning();
      res.json(newItem[0]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create news ticker: " + (error.message || error) });
    }
  });

  app.put("/api/news-ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { text, isActive, displayOrder } = req.body;
      const updatedItem = await db.update(newsTicker).set({ 
        text, 
        isActive, 
        displayOrder 
      }).where(eq(newsTicker.id, Number(id))).returning();
      res.json(updatedItem[0]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update news ticker: " + (error.message || error) });
    }
  });

  app.delete("/api/news-ticker/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(newsTicker).where(eq(newsTicker.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete news ticker: " + (error.message || error) });
    }
  });
  // Example secure route: Create an order

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.dbUser) {
        res.status(401).json({ error: "User not synced" });
        return;
      }
      const { items, total } = req.body;
      
      const newOrder = await db.insert(orders).values({
        userId: req.dbUser.id,
        items: JSON.stringify(items),
        total,
        status: 'pending'
      }).returning();
      
      res.json(newOrder[0]);
    } catch (error: any) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: "Failed to create order", details: error.message });
    }
  });

  
  
  
  // --- Reviews API ---
  app.get("/api/reviews", async (req, res) => {
    try {
      const allReviews = await db.select().from(reviews).where(eq(reviews.isHidden, false)).orderBy(desc(reviews.createdAt));
      res.json(allReviews);
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews: " + (error.message || error) });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const { name, rating, comment } = req.body;
      const newReview = await db.insert(reviews).values({
        name,
        rating,
        comment,
      }).returning();
      res.json(newReview[0]);
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      res.status(500).json({ error: "Failed to submit review: " + (error.message || error) });
    }
  });

  app.post("/api/reviews/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.body; // 'like' or 'dislike'
      const reviewToUpdate = await db.select().from(reviews).where(eq(reviews.id, Number(id)));
      if (reviewToUpdate.length === 0) {
        return res.status(404).json({ error: "Review not found" });
      }
      const current = reviewToUpdate[0];
      const updated = await db.update(reviews)
        .set(type === 'like' ? { likes: current.likes + 1 } : { dislikes: current.dislikes + 1 })
        .where(eq(reviews.id, Number(id)))
        .returning();
      res.json(updated[0]);
    } catch (error: any) {
      console.error("Failed to vote on review:", error);
      res.status(500).json({ error: "Failed to vote on review: " + (error.message || error) });
    }
  });

  // Admin Review Routes
  app.get("/api/admin/reviews", async (req, res) => {
    try {
      const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
      res.json(allReviews);
    } catch (error: any) {
      console.error("Failed to fetch admin reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews: " + (error.message || error) });
    }
  });

  app.put("/api/admin/reviews/:id/visibility", async (req, res) => {
    try {
      const { id } = req.params;
      const { isHidden } = req.body;
      const updated = await db.update(reviews).set({ isHidden }).where(eq(reviews.id, Number(id))).returning();
      res.json(updated[0]);
    } catch (error: any) {
      console.error("Failed to update review visibility:", error);
      res.status(500).json({ error: "Failed to update review visibility: " + (error.message || error) });
    }
  });

  app.put("/api/admin/reviews/:id/reply", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminReply } = req.body;
      const updated = await db.update(reviews).set({ adminReply }).where(eq(reviews.id, Number(id))).returning();
      res.json(updated[0]);
    } catch (error: any) {
      console.error("Failed to reply to review:", error);
      res.status(500).json({ error: "Failed to reply to review: " + (error.message || error) });
    }
  });

  app.delete("/api/admin/reviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(reviews).where(eq(reviews.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete review:", error);
      res.status(500).json({ error: "Failed to delete review: " + (error.message || error) });
    }
  });

  // --- Analytics API ---

  
  app.get("/api/analytics/settings", async (req, res) => {
    try {
      let settings = await db.select().from(analyticsSettings);
      if (settings.length === 0) {
        const newSettings = await db.insert(analyticsSettings).values({}).returning();
        res.json(newSettings[0]);
      } else {
        res.json(settings[0]);
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch analytics settings: " + (error.message || error) });
    }
  });

  app.put("/api/analytics/settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await db.select().from(analyticsSettings);
      if (settings.length > 0) {
        const updated = await db.update(analyticsSettings).set(updates).where(eq(analyticsSettings.id, settings[0].id)).returning();
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Settings not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update settings: " + (error.message || error) });
    }
  });

  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { visitorToken, sessionToken, deviceType, os, browser, referrer, landingPage, path } = req.body;
      
      if (!visitorToken || !sessionToken) {
        return res.json({ success: false, message: "Missing tokens" });
      }

      let settings = await db.select().from(analyticsSettings);
      if (settings.length === 0) {
        const newSettings = await db.insert(analyticsSettings).values({}).returning();
        settings = newSettings;
      }
      if (!settings[0].trackingEnabled) {
        return res.json({ success: false, message: "Tracking disabled" });
      }

      // Check if visitor exists
      let visitorRecords = await db.select().from(visitors).where(eq(visitors.visitorToken, visitorToken));
      let visitorId;

      if (visitorRecords.length === 0) {
        const newVisitor = await db.insert(visitors).values({
          visitorToken,
          deviceType: settings[0].deviceTrackingEnabled ? deviceType : null,
          os: settings[0].deviceTrackingEnabled ? os : null,
          browser: settings[0].browserTrackingEnabled ? browser : null,
          referrer,
          country: null, // Basic geo not implemented out-of-the-box easily here without a service
          firstVisitAt: new Date(),
          lastVisitAt: new Date(),
          totalVisits: 1,
        }).returning();
        visitorId = newVisitor[0].id;
      } else {
        visitorId = visitorRecords[0].id;
        // Update last visit
        await db.update(visitors).set({ lastVisitAt: new Date(), totalVisits: visitorRecords[0].totalVisits! + 1 }).where(eq(visitors.id, visitorId));
      }

      // Check if session exists
      let sessionRecords = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
      if (sessionRecords.length === 0) {
        await db.insert(visits).values({
          visitorId,
          sessionToken,
          landingPage,
          exitPage: path,
          visitTime: new Date(),
          lastPingAt: new Date(),
          isActive: true
        }).onConflictDoUpdate({
          target: visits.sessionToken,
          set: {
            exitPage: path,
            lastPingAt: new Date(),
            isActive: true
          }
        });
      } else {
        // Update ping and duration
        const session = sessionRecords[0];
        const lastPing = new Date();
        const duration = Math.floor((lastPing.getTime() - new Date(session.visitTime!).getTime()) / 1000);
        await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, session.id));
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to track visit: " + (error.message || error) });
    }
  });

  app.post("/api/analytics/ping", async (req, res) => {
    try {
      const { sessionToken, path } = req.body;
      if (!sessionToken) {
        return res.json({ success: false, message: "Missing session token" });
      }
      let sessionRecords = await db.select().from(visits).where(eq(visits.sessionToken, sessionToken));
      if (sessionRecords.length > 0) {
        const session = sessionRecords[0];
        const lastPing = new Date();
        const duration = Math.floor((lastPing.getTime() - new Date(session.visitTime!).getTime()) / 1000);
        await db.update(visits).set({ exitPage: path, lastPingAt: lastPing, durationSeconds: duration, isActive: true }).where(eq(visits.id, session.id));
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to ping: " + (error.message || error) });
    }
  });

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const now = new Date();
      const activeThreshold = new Date(now.getTime() - 5 * 60000);
      await db.update(visits).set({ isActive: false }).where(lt(visits.lastPingAt, activeThreshold));

      const [allVisits, allVisitors, allDemoNotices, activeVisits] = await Promise.all([
        db.select().from(visits),
        db.select().from(visitors),
        db.select().from(demoNotices),
        db.select().from(visits).where(eq(visits.isActive, true))
      ]);
      
      const totalVisitors = allVisitors.length;
      
      res.json({
        totalVisitors,
        activeVisitors: activeVisits.length,
        totalVisits: allVisits.length,
        demoNotices: allDemoNotices,
        visits: allVisits,
        visitors: allVisitors
      });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch analytics: " + (error.message || error) });
    }
  });

  app.post("/api/analytics/demo-notice", async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const result = await db.insert(demoNotices).values({ name }).returning();
      res.json(result[0]);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save demo notice: " + (error.message || error) });
    }
  });

  app.delete("/api/analytics/clear", async (req, res) => {
    try {
      await db.delete(visits);
      await db.delete(visitors);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to clear analytics: " + (error.message || error) });
    }
  });

  app.delete("/api/analytics/visitors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(visitors).where(eq(visitors.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete visitor: " + (error.message || error) });
    }
  });

  app.post("/api/analytics/visitors/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;
      if (ids && ids.length > 0) {
        await db.delete(visitors).where(inArray(visitors.id, ids));
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to bulk delete visitors: " + (error.message || error) });
    }
  });

  
  app.get("/api/admin/managers", async (req, res) => {
    try {
      const managers = await db.select().from(users).where(eq(users.role, 'manager'));
      res.json(managers);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch managers: " + (error.message || error) });
    }
  });

  app.post("/api/admin/managers", async (req, res) => {
    try {
      const { email, password, name, permissions } = req.body;
      
      const firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName: name,
      });

      const newManager = await db.insert(users).values({
        uid: firebaseUser.uid,
        email,
        name,
        role: 'manager',
        permissions: permissions || {},
      }).returning();

      res.json(newManager[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to create manager: " + error.message });
    }
  });

  app.put("/api/admin/managers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions, password, name } = req.body;
      
      const user = await db.select().from(users).where(eq(users.id, Number(id))).limit(1);
      if (!user.length) return res.status(404).json({ error: "Manager not found" });
      
      if (password) {
        await adminAuth.updateUser(user[0].uid, { password });
      }
      
      const updateData: any = { permissions };
      if (name) {
        updateData.name = name;
        await adminAuth.updateUser(user[0].uid, { displayName: name });
      }

      const updated = await db.update(users).set(updateData).where(eq(users.id, Number(id))).returning();
      res.json(updated[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to update manager: " + (error.message || error) });
    }
  });

  app.delete("/api/admin/managers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await db.select().from(users).where(eq(users.id, Number(id))).limit(1);
      if (user.length) {
        await adminAuth.deleteUser(user[0].uid);
        await db.delete(users).where(eq(users.id, Number(id)));
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete manager: " + (error.message || error) });
    }
  });


  app.get("/api/admin/stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const statsResult = await db.execute(sql`
        SELECT 
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= ${today.toISOString()}) as daily_revenue,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE status IN ('pending', 'processing')) as active_orders,
          (SELECT COUNT(*) FROM users WHERE uid = 'pos_system') as pos_users
      `);
      
      res.json({
         dailyRevenue: Number(statsResult.rows[0].daily_revenue || 0),
         totalOrders: Number(statsResult.rows[0].total_orders || 0),
         activeOrders: Number(statsResult.rows[0].active_orders || 0),
         posUsers: Number(statsResult.rows[0].pos_users || 0)
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch admin stats: " + (error.message || error) });
    }
  });

  app.get("/api/admin/daily-revenue", async (req, res) => {
    try {
      const revenueResult = await db.execute(sql`
        SELECT 
          DATE(created_at) as date_str,
          COUNT(id) as order_count,
          COALESCE(SUM(total), 0) as revenue
        FROM orders
        WHERE status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);
      
      res.json(revenueResult.rows);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch daily revenue: " + (error.message || error) });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      res.json(allOrders);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch orders: " + (error.message || error) });
    }
  });

  app.post("/api/admin/pos/orders", async (req, res) => {
    try {
      const { tableNumber, items, total } = req.body;
      
      let posUser = await db.select().from(users).where(eq(users.uid, 'pos_system')).limit(1);
      if (posUser.length === 0) {
        const newUser = await db.insert(users).values({
          uid: 'pos_system',
          email: 'pos@local',
          name: 'POS System'
        }).returning();
        posUser = newUser;
      }
      
      // Inject table marker into items
      const posItems = [
        { name: `Table ${tableNumber}`, price: 0, quantity: 1, isTableMarker: true },
        ...items
      ];

      const newOrder = await db.insert(orders).values({
        userId: posUser[0].id,
        items: JSON.stringify(posItems),
        total,
        status: 'pending'
      }).returning();
      
      res.json(newOrder[0]);
    } catch (error: any) {
      console.error("POS order failed", error);
      res.status(500).json({ error: "POS order failed" });
    }
  });

  app.put("/api/admin/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, items, total } = req.body;
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (items !== undefined) updateData.items = items;
      if (total !== undefined) updateData.total = total;
      
      if (Object.keys(updateData).length === 0) return res.status(400).json({ error: "No fields to update" });
      
      const updatedOrder = await db.update(orders)
        .set(updateData)
        .where(eq(orders.id, Number(id)))
        .returning();
        
      res.json(updatedOrder[0]);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to update order: " + (error.message || error) });
    }
  });

  app.delete("/api/admin/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(orders).where(eq(orders.id, Number(id)));
      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete order: " + (error.message || error) });
    }
  });

// ─── Windows Native Print Bridge ─────────────────────────────────────────────
// These endpoints are only registered when running locally on Windows.
// On Vercel (serverless), they return 501 Not Implemented.

  app.get("/api/print/windows-printers", async (req, res) => {
    if (isVercel) {
      return res.status(501).json({ error: "Not available on Vercel deployment" });
    }
    try {
      const { listWindowsPrinters } = await import('./src/lib/win-print-bridge.ts');
      const printers = await listWindowsPrinters();
      res.json({ printers });
    } catch (error: any) {
      console.error("[win-print] list printers error:", error);
      res.status(500).json({ error: error.message || "Failed to list printers" });
    }
  });

  app.post("/api/print/raw", async (req, res) => {
    if (isVercel) {
      return res.status(501).json({ error: "Not available on Vercel deployment" });
    }
    try {
      const { printerName, data } = req.body as { printerName: string; data: string };
      if (!printerName || !data) {
        return res.status(400).json({ error: "printerName and data (base64) are required" });
      }
      const buffer = Buffer.from(data, 'base64');
      const { sendRawToWindowsPrinter } = await import('./src/lib/win-print-bridge.ts');
      await sendRawToWindowsPrinter(printerName, buffer);
      res.json({ ok: true });
    } catch (error: any) {
      console.error("[win-print] raw print error:", error);
      res.status(500).json({ error: error.message || "Print failed" });
    }
  });

// Vite middleware for development
  
  (async () => {
    if (!isVercel) {
      if (process.env.NODE_ENV !== "production") {
        const vitePath = 'vite';
        const { createServer: createViteServer } = await import(vitePath);
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        // Wait for Vite to be fully ready before adding middleware
        await vite.waitForRequestsIdle?.().catch(() => {});
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
      });
    }
  })();

export default app;

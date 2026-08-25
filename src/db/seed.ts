import { db } from './index.ts';
import { categories, menuItems, features, journeySettings } from './schema.ts';
import { sql } from 'drizzle-orm';

async function seed() {
  try {
    const cats = await db.select().from(categories).limit(1);
    if (cats.length > 0) {
      console.log('Database already seeded. Skipping.');
      process.exit(0);
    }
    console.log('Seeding database...');
    
    // Insert categories
    const insertedCats = await db.insert(categories).values([
      { name: 'Starters', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500', startTime: '12:00', endTime: '23:00' },
      { name: 'Main Course', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500', startTime: '12:00', endTime: '23:00' },
      { name: 'Breads', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500', startTime: '12:00', endTime: '23:00' },
      { name: 'Desserts', image: 'https://images.unsplash.com/photo-1589114461537-8149867566d2?w=500', startTime: '12:00', endTime: '23:00' }
    ]).returning();

    // Insert menu items
    await db.insert(menuItems).values([
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 250, category: 'Starters', dietaryPreference: 'veg', spiceLevel: 'medium', isPopular: true, image: 'https://images.unsplash.com/photo-1599487405270-8e12eb9c9b55?w=500' },
      { name: 'Dal Makhani', description: 'Creamy black lentils', price: 220, category: 'Main Course', dietaryPreference: 'veg', spiceLevel: 'mild', isBestSeller: true, isDhabaSpecial: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500' },
      { name: 'Butter Naan', description: 'Soft flatbread', price: 50, category: 'Breads', dietaryPreference: 'veg', spiceLevel: 'mild', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500' },
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings', price: 80, category: 'Desserts', dietaryPreference: 'veg', spiceLevel: 'mild', image: 'https://images.unsplash.com/photo-1589114461537-8149867566d2?w=500' }
    ]);

    // Insert features
    await db.insert(features).values([
      { title: 'Open 24/7', description: 'Always here to serve you.', iconName: 'Clock' },
      { title: 'Free Parking', description: 'Ample space for your vehicles.', iconName: 'Car' }
    ]);

    // Insert journey settings
    await db.insert(journeySettings).values([
      { header: 'Our Story', description: 'Serving delicious food since 1990.' }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('Error seeding database:', err.message || err);
    if (err.message && err.message.includes('ENETUNREACH')) {
      console.error('\n======================================================');
      console.error('CRITICAL DATABASE CONNECTION ERROR: IPv6 Not Supported');
      console.error('======================================================');
      console.error('It looks like you are using a Supabase direct connection URL (port 5432) which uses IPv6.');
      console.error('Vercel does not support outbound IPv6 connections.');
      console.error('ACTION REQUIRED: Please go to your Supabase Dashboard, get the "Transaction Pooler" connection string (port 6543), and update your DATABASE_URL in Vercel.');
      console.error('======================================================\n');
    }
    process.exit(1);
  }
}
seed();

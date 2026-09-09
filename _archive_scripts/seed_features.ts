import { db } from './src/db/index.ts';
import { features } from './src/db/schema.ts';

async function seed() {
  const existing = await db.select().from(features);
  if (existing.length === 0) {
    console.log("Seeding features...");
    await db.insert(features).values([
      { title: "Open 24/7", description: "Hot, fresh meals available round the clock for highway travelers.", iconName: "Clock", displayOrder: 1 },
      { title: "Ample Parking", description: "Safe and spacious parking area for cars, buses, and heavy vehicles.", iconName: "Car", displayOrder: 2 },
      { title: "Family Friendly", description: "Clean, hygienic environment with a dedicated seating area for families.", iconName: "Users", displayOrder: 3 },
      { title: "Pure Veg Options", description: "Separate pure vegetarian kitchen ensuring complete purity and taste.", iconName: "Leaf", displayOrder: 4 },
    ]);
    console.log("Seeded successfully.");
  } else {
    console.log("Features already exist.");
  }
}
seed().catch(console.error).then(() => process.exit(0));

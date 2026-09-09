import { db } from './src/db/index.ts';
import { categories } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    const name = "Test Category Script";
    console.log("Checking for existing...");
    const existing = await db.select().from(categories).where(eq(categories.name, name));
    console.log("Existing:", existing);
    
    console.log("Inserting new...");
    const newCategory = await db.insert(categories).values({
      name: name,
      image: null,
      startTime: null,
      endTime: null
    }).returning();
    
    console.log("Inserted:", newCategory);
  } catch (error) {
    console.error("Insertion error:", error);
  }
  process.exit(0);
}

test();

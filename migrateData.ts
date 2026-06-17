// migrateData.ts - Executes once on server start to ensure seed data exists in Supabase
import { supabase } from "./supabaseClient.js";
import { upsertTable, countRows, insertRows, selectRows } from "./supabaseHelpers.js";
import { DEFAULT_DB } from "./server.js"; // Exported from server.ts

export async function migrateIfNeeded() {
  console.log("[Migration] Running seed checks...");

  // 1. Ensure users exist by checking IDs
  try {
    const currentUsers = await selectRows<any>("users_profiles");
    const missingUsers = (DEFAULT_DB.users_profiles as any[]).filter(
      du => !currentUsers.some(cu => cu.id === du.id)
    );
    if (missingUsers.length > 0) {
      await insertRows("users_profiles", missingUsers);
      console.log(`[Migration] Seeded ${missingUsers.length} missing users.`);
    }
  } catch (err) {
    console.error("[Migration] Error seeding users:", err);
  }

  // 2. Ensure modules exist by checking IDs
  try {
    const currentModules = await selectRows<any>("modules");
    const missingModules = (DEFAULT_DB.modules as any[]).filter(
      dm => !currentModules.some(cm => cm.id === dm.id)
    );
    if (missingModules.length > 0) {
      await insertRows("modules", missingModules);
      console.log(`[Migration] Seeded ${missingModules.length} missing modules.`);
    }
  } catch (err) {
    console.error("[Migration] Error seeding modules:", err);
  }

  // 3. Ensure lessons exist by checking IDs
  try {
    const currentLessons = await selectRows<any>("lessons");
    const missingLessons = (DEFAULT_DB.lessons as any[]).filter(
      dl => !currentLessons.some(cl => cl.id === dl.id)
    );
    if (missingLessons.length > 0) {
      await insertRows("lessons", missingLessons);
      console.log(`[Migration] Seeded ${missingLessons.length} missing lessons.`);
    }
  } catch (err) {
    console.error("[Migration] Error seeding lessons:", err);
  }

  // 4. Ensure vip_offers config exists
  try {
    const count = await countRows("vip_offers");
    if (count === 0 && DEFAULT_DB.vip_offers) {
      await insertRows("vip_offers", [DEFAULT_DB.vip_offers] as any);
      console.log(`[Migration] Seeded vip_offers.`);
    }
  } catch (err) {
    console.error("[Migration] Error seeding vip_offers:", err);
  }
}

// Run migration immediately when this module is imported directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrateIfNeeded().catch((e: any) => console.error("[Migration error]", e.stack || e));
}

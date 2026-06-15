// migrateData.ts - Executes once on server start to ensure seed data exists in Supabase
import { supabase } from "./supabaseClient";
import { upsertTable, countRows } from "./supabaseHelpers";
import { DEFAULT_DB } from "./server"; // Exported from server.ts

export async function migrateIfNeeded() {
  // Helper to insert rows if table is empty
  async function ensure<T>(table: string, rows: T[]) {
    const existing = await countRows(table);
    if (existing === 0 && rows.length) {
      await upsertTable<T>(table, rows);
      console.log(`[Migration] Inserted ${rows.length} rows into ${table}`);
    }
  }

  // Ensure each table has seed data
  await ensure("users_profiles", DEFAULT_DB.users_profiles as any);
  await ensure("modules", DEFAULT_DB.modules as any);
  await ensure("lessons", DEFAULT_DB.lessons as any);
  await ensure("lesson_progress", DEFAULT_DB.lesson_progress as any);
  await ensure("terms_acceptance", DEFAULT_DB.terms_acceptance as any);
  if (DEFAULT_DB.vip_offers) {
    // Supabase does not have a dedicated table for a single object; store as a singleton row
    const count = await countRows("vip_offers");
    if (count === 0) {
      await upsertTable("vip_offers", [DEFAULT_DB.vip_offers] as any);
      console.log(`[Migration] Inserted vip_offers`);
    }
  }
}

// Run migration immediately when this module is imported (used in package.json dev script)
if (require.main === module) {
  migrateIfNeeded().catch((e) => console.error("[Migration error]", e));
}

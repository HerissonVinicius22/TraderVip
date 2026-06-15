import { supabase } from './supabaseClient';

/**
 * Generic helper to select rows from a Supabase table.
 * Returns an array of records or throws on error.
 */
export async function selectRows<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from<T>(table).select('*');
  if (error) throw error;
  return data ?? [];
}

/** Insert multiple rows into a table. */
export async function insertRows<T>(table: string, rows: T[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from<T>(table).insert(rows);
  if (error) throw error;
}

/** Delete all rows from a table. */
export async function deleteAllRows(table: string): Promise<void> {
  const { error } = await supabase.from(table).delete().neq('id', '___'); // delete where id not dummy
  if (error) throw error;
}

/** Upsert entire table: delete existing rows then insert new rows. */
export async function upsertTable<T>(table: string, rows: T[]): Promise<void> {
  await deleteAllRows(table);
  await insertRows<T>(table, rows);
}

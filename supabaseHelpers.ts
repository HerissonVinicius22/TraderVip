import { supabase } from './supabaseClient.js';

/**
 * Generic helper to select rows from a Supabase table.
 * Returns an array of records or throws on error.
 */
export async function selectRows<T>(table: string): Promise<T[]> {
  const { data, error } = await (supabase as any).from(table).select('*');
  if (error) throw error;
  return (data as T[]) ?? [];
}

/** Insert multiple rows into a table. */
export async function insertRows<T>(table: string, rows: T[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await (supabase as any).from(table).insert(rows as any);
  if (error) throw error;
}

/** Delete all rows from a table. */
export async function deleteAllRows(table: string): Promise<void> {
  const { error } = await (supabase as any).from(table).delete().neq('id', '___'); // delete where id not dummy
  if (error) throw error;
}

/** Upsert entire table: delete existing rows then insert new rows. */
export async function upsertTable<T>(table: string, rows: T[]): Promise<void> {
  await deleteAllRows(table);
  await insertRows<T>(table, rows);
}

/** Update a single row by its ID (safe — does NOT delete other rows). */
export async function updateRowById<T extends Record<string, any>>(table: string, id: string, data: Partial<T>): Promise<void> {
  const { error } = await (supabase as any).from(table).update(data).eq('id', id);
  if (error) throw error;
}

/** Count rows in a table. */
export async function countRows(table: string): Promise<number> {
  const { count, error, status, statusText } = await (supabase as any).from(table).select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Supabase error:', error, 'Status:', status, statusText);
    throw error;
  }
  return count ?? 0;
}

/** Delete a single row by ID. */
export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await (supabase as any).from(table).delete().eq('id', id);
  if (error) throw error;
}

/** Delete rows matching a specific column value. */
export async function deleteRowsMatching(table: string, column: string, value: any): Promise<void> {
  const { error } = await (supabase as any).from(table).delete().eq(column, value);
  if (error) throw error;
}


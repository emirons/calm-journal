// Client exports only
export { createClient, getSupabaseClient, isSupabaseConfigured } from "./client";

// Type exports
export type {
  Database,
  Entry,
  EntryInsert,
  EntryUpdate,
} from "./types";

// Note: Server client should be imported directly from "./server" 
// in Server Components only

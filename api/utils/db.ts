// api/utils/db.ts
import { Pool } from 'pg';

// This single pool instance will be shared across all API routes.
// It reads the NEON_DATABASE_URL from Vercel's environment variables.
// The user's working example confirmed this is the correct variable name and setup.
export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

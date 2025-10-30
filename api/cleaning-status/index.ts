// api/cleaning-status/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../utils/db';
import { mapCleaningStatusFromDB } from '../utils/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query(`
        SELECT r.room_number, cs.status 
        FROM cleaning_statuses cs
        JOIN rooms r ON cs.room_id = r.room_id;
    `);

    const cleaningStatusMap = rows.reduce((acc, row) => {
        acc[row.room_number] = mapCleaningStatusFromDB(row.status);
        return acc;
    }, {});
    
    return res.status(200).json(cleaningStatusMap);
  } catch (error) {
    console.error('API Get Cleaning Status Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// api/cleaning-status/[roomId].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../utils/db';
import { mapCleaningStatusToDB } from '../utils/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { roomId } = req.query; // This is room_number, e.g., "101"
    const { status } = req.body; // This is "CLEAN" or "DIRTY"

    if (!roomId || !status) {
        return res.status(400).json({ message: 'Room ID and status are required' });
    }

    const dbStatus = mapCleaningStatusToDB(status);

    await pool.query(`
        UPDATE cleaning_statuses
        SET status = $1, last_updated = NOW()
        WHERE room_id = (SELECT room_id FROM rooms WHERE room_number = $2);
    `, [dbStatus, roomId]);
    
    return res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('API Update Cleaning Status Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

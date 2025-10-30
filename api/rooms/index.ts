// api/rooms/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await pool.query('SELECT room_number, room_type, bed_type, floor FROM rooms ORDER BY CAST(room_number AS INTEGER) ASC');

    const formattedRooms = rows.map(room => ({
      id: room.room_number,
      type: room.room_type,
      bed: room.bed_type,
      floor: room.floor,
    }));
    
    return res.status(200).json(formattedRooms);
  } catch (error) {
    console.error('API Get Rooms Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

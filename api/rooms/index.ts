// api/rooms/index.ts
import { sql } from '@vercel/postgres';
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`SELECT room_number, room_type, bed_type, floor FROM rooms ORDER BY room_number ASC;`;

    const formattedRooms = rows.map(room => ({
      id: room.room_number,
      type: room.room_type,
      bed: room.bed_type,
      floor: room.floor,
    }));
    
    return response.status(200).json(formattedRooms);
  } catch (error) {
    console.error('API Get Rooms Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}

// api/cleaning-status/[roomId].ts
import { sql } from '@vercel/postgres';
// FIX: Use NextApiHandler to ensure proper typing of the request object.
import { NextApiHandler } from 'next';
import { mapCleaningStatusToDB } from '../utils/db-helpers';

const handler: NextApiHandler = async (
  request,
  response,
) => {
  if (request.method !== 'PUT') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { roomId } = request.query; // This is room_number, e.g., "101"
    const { status } = request.body; // This is "CLEAN" or "DIRTY"

    if (!roomId || !status) {
        return response.status(400).json({ message: 'Room ID and status are required' });
    }

    const dbStatus = mapCleaningStatusToDB(status);

    await sql`
        UPDATE cleaning_statuses
        SET status = ${dbStatus}, last_updated = NOW()
        WHERE room_id = (SELECT room_id FROM rooms WHERE room_number = ${roomId as string});
    `;
    
    return response.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('API Update Cleaning Status Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
};

export default handler;

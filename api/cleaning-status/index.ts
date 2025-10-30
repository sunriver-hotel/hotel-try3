// api/cleaning-status/index.ts
import { sql } from '@vercel/postgres';
// FIX: Use NextApiHandler to ensure proper typing of the request object.
import { NextApiHandler } from 'next';
import { mapCleaningStatusFromDB } from '../utils/db-helpers';

const handler: NextApiHandler = async (
  request,
  response,
) => {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`
        SELECT r.room_number, cs.status 
        FROM cleaning_statuses cs
        JOIN rooms r ON cs.room_id = r.room_id;
    `;

    const cleaningStatusMap = rows.reduce((acc, row) => {
        acc[row.room_number] = mapCleaningStatusFromDB(row.status);
        return acc;
    }, {});
    
    return response.status(200).json(cleaningStatusMap);
  } catch (error) {
    console.error('API Get Cleaning Status Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
};

export default handler;

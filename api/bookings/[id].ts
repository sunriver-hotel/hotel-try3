// api/bookings/[id].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../utils/db';
import { formatDateForDB, mapPaymentStatusToDB } from '../utils/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.query;
    const updatedBookingData = req.body;
    
    const originalBookingResult = await client.query('SELECT customer_id, check_in_date, check_out_date FROM bookings WHERE booking_id = $1', [id]);
    if (originalBookingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Booking not found' });
    }
    const { customer_id, check_in_date, check_out_date } = originalBookingResult.rows[0];

    await client.query(
        'UPDATE customers SET customer_name = $1, phone = $2, email = $3, address = $4, tax_id = $5 WHERE customer_id = $6',
        [updatedBookingData.customerName, updatedBookingData.phone, updatedBookingData.email, updatedBookingData.address, updatedBookingData.taxId, customer_id]
    );

    const originalRoomsResult = await client.query(
        `SELECT r.room_number FROM bookings b JOIN rooms r ON b.room_id = r.room_id WHERE b.customer_id = $1 AND b.check_in_date = $2 AND b.check_out_date = $3`,
        [customer_id, check_in_date, check_out_date]
    );
    const originalRoomNumbers: string[] = originalRoomsResult.rows.map(r => r.room_number);
    const newRoomNumbers: string[] = updatedBookingData.roomIds;

    const roomsToDelete = originalRoomNumbers.filter(r => !newRoomNumbers.includes(r));
    const roomsToAdd = newRoomNumbers.filter(r => !originalRoomNumbers.includes(r));
    
    const checkInDB = formatDateForDB(updatedBookingData.checkIn);
    const checkOutDB = formatDateForDB(updatedBookingData.checkOut);
    const paymentStatusDB = mapPaymentStatusToDB(updatedBookingData.paymentStatus);

    if (roomsToDelete.length > 0) {
        await client.query(
            `DELETE FROM bookings WHERE customer_id = $1 AND check_in_date = $2 AND check_out_date = $3 AND room_id IN (SELECT room_id FROM rooms WHERE room_number = ANY($4::text[]))`,
            [customer_id, check_in_date, check_out_date, roomsToDelete]
        );
    }

    for (const roomNumber of roomsToAdd) {
        const roomResult = await client.query('SELECT room_id FROM rooms WHERE room_number = $1', [roomNumber]);
        const roomId = roomResult.rows[0].room_id;
        
        const idResult = await client.query("SELECT generate_booking_id() as new_id;");
        const newBookingId = idResult.rows[0].new_id;

        await client.query(
            `INSERT INTO bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [newBookingId, customer_id, roomId, checkInDB, checkOutDB, paymentStatusDB, updatedBookingData.pricePerNight, updatedBookingData.depositAmount || 0]
        );
    }
    
    await client.query(
        `UPDATE bookings SET check_in_date = $1, check_out_date = $2, status = $3, price_per_night = $4, deposit = $5
         WHERE customer_id = $6 AND check_in_date = $7 AND check_out_date = $8 AND room_id IN (SELECT room_id FROM rooms WHERE room_number = ANY($9::text[]))`,
        [checkInDB, checkOutDB, paymentStatusDB, updatedBookingData.pricePerNight, updatedBookingData.depositAmount || 0, customer_id, check_in_date, check_out_date, newRoomNumbers]
    );

    const finalBookingResult = await client.query(
        `SELECT MIN(b.booking_id) as booking_id, MIN(b.created_at) as created_at, STRING_AGG(r.room_number, ',' ORDER BY r.room_number) as room_numbers
         FROM bookings b JOIN rooms r ON b.room_id = r.room_id WHERE b.customer_id = $1 AND b.check_in_date = $2 AND b.check_out_date = $3`,
        [customer_id, checkInDB, checkOutDB]
    );

    await client.query('COMMIT');

    const finalData = {
        ...updatedBookingData,
        id: finalBookingResult.rows[0].booking_id,
        timestamp: finalBookingResult.rows[0].created_at.toISOString(),
        roomIds: finalBookingResult.rows[0].room_numbers.split(',').sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })),
    };

    return res.status(200).json(finalData);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('API Update Booking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}

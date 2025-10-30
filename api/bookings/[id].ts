// api/bookings/[id].ts
import { sql } from '@vercel/postgres';
// FIX: Use NextApiHandler to ensure proper typing of the request object.
import { NextApiHandler } from 'next';
import { formatDateForDB, formatDateFromDB, mapPaymentStatusToDB, mapPaymentStatusFromDB } from '../utils/db-helpers';

const handler: NextApiHandler = async (
  request,
  response,
) => {
  if (request.method !== 'PUT') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = request.query; // This is the representative booking_id
    const updatedBookingData = request.body;
    
    // 1. Get the original booking group details (customer_id, old check-in/out)
    const originalBookingResult = await sql`
        SELECT customer_id, check_in_date, check_out_date 
        FROM bookings WHERE booking_id = ${id as string};
    `;
    if (originalBookingResult.rows.length === 0) {
        return response.status(404).json({ message: 'Booking not found' });
    }
    const { customer_id, check_in_date, check_out_date } = originalBookingResult.rows[0];

    // 2. Update customer information
    await sql`
        UPDATE customers
        SET customer_name = ${updatedBookingData.customerName},
            phone = ${updatedBookingData.phone},
            email = ${updatedBookingData.email},
            address = ${updatedBookingData.address},
            tax_id = ${updatedBookingData.taxId}
        WHERE customer_id = ${customer_id};
    `;

    // 3. Get all original room numbers for this logical booking
    const originalRoomsResult = await sql`
        SELECT r.room_number FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.customer_id = ${customer_id}
          AND b.check_in_date = ${check_in_date}
          AND b.check_out_date = ${check_out_date};
    `;
    const originalRoomNumbers: string[] = originalRoomsResult.rows.map(r => r.room_number);
    const newRoomNumbers: string[] = updatedBookingData.roomIds;

    const roomsToDelete = originalRoomNumbers.filter(r => !newRoomNumbers.includes(r));
    const roomsToAdd = newRoomNumbers.filter(r => !originalRoomNumbers.includes(r));
    
    const checkInDB = formatDateForDB(updatedBookingData.checkIn);
    const checkOutDB = formatDateForDB(updatedBookingData.checkOut);
    const paymentStatusDB = mapPaymentStatusToDB(updatedBookingData.paymentStatus);

    // 4. Delete removed rooms from the booking
    if (roomsToDelete.length > 0) {
        // FIX: The `sql` template from `@vercel/postgres` does not support array parameters for `ANY`.
        // The array must be converted to a PostgreSQL array literal string, e.g., '{101,102}'.
        const roomsToDeletePGArray = `{${roomsToDelete.join(',')}}`;
        await sql`
            DELETE FROM bookings
            WHERE customer_id = ${customer_id}
              AND check_in_date = ${check_in_date}
              AND check_out_date = ${check_out_date}
              AND room_id IN (SELECT room_id FROM rooms WHERE room_number = ANY(${roomsToDeletePGArray}));
        `;
    }

    // 5. Add new rooms to the booking
    for (const roomNumber of roomsToAdd) {
        const roomResult = await sql`SELECT room_id FROM rooms WHERE room_number = ${roomNumber};`;
        const roomId = roomResult.rows[0].room_id;
        
        const idResult = await sql`SELECT generate_booking_id() as new_id;`;
        const newBookingId = idResult.rows[0].new_id;

        await sql`
            INSERT INTO bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
            VALUES (${newBookingId}, ${customer_id}, ${roomId}, ${checkInDB}, ${checkOutDB}, ${paymentStatusDB}, ${updatedBookingData.pricePerNight}, ${updatedBookingData.depositAmount || 0});
        `;
    }

    // 6. Update the remaining/common booking records
    // FIX: The `sql` template from `@vercel/postgres` does not support array parameters for `ANY`.
    // The array must be converted to a PostgreSQL array literal string, e.g., '{101,102}'.
    const newRoomNumbersPGArray = `{${newRoomNumbers.join(',')}}`;
    await sql`
        UPDATE bookings
        SET check_in_date = ${checkInDB},
            check_out_date = ${checkOutDB},
            status = ${paymentStatusDB},
            price_per_night = ${updatedBookingData.pricePerNight},
            deposit = ${updatedBookingData.depositAmount || 0}
        WHERE customer_id = ${customer_id}
          AND check_in_date = ${check_in_date}
          AND check_out_date = ${check_out_date}
          AND room_id IN (SELECT room_id FROM rooms WHERE room_number = ANY(${newRoomNumbersPGArray}));
    `;
    
    // Fetch and return the fully updated logical booking object
    const finalBookingResult = await sql`
        SELECT
            MIN(b.booking_id) as booking_id,
            MIN(b.created_at) as created_at,
            STRING_AGG(r.room_number, ',') as room_numbers
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.customer_id = ${customer_id}
          AND b.check_in_date = ${checkInDB}
          AND b.check_out_date = ${checkOutDB}
    `;

    const finalData = {
        ...updatedBookingData,
        id: finalBookingResult.rows[0].booking_id,
        timestamp: finalBookingResult.rows[0].created_at.toISOString(),
        roomIds: finalBookingResult.rows[0].room_numbers.split(','),
    };

    return response.status(200).json(finalData);

  } catch (error) {
    console.error('API Update Booking Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
};

export default handler;
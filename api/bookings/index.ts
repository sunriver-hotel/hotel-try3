// api/bookings/index.ts
import { sql } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatDateForDB, formatDateFromDB, mapPaymentStatusToDB, mapPaymentStatusFromDB } from '../utils/db-helpers';

// Helper function to query and format a single logical booking
const getFormattedBooking = async (customerId: number, checkIn: string, checkOut: string) => {
    const { rows } = await sql`
        SELECT
            c.customer_name, c.phone, c.email, c.address, c.tax_id,
            b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night,
            MIN(b.booking_id) as booking_id,
            MIN(b.created_at) as created_at,
            STRING_AGG(r.room_number, ',') as room_numbers
        FROM bookings b
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.customer_id = ${customerId}
          AND b.check_in_date = ${checkIn}
          AND b.check_out_date = ${checkOut}
        GROUP BY c.customer_name, c.phone, c.email, c.address, c.tax_id, b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night;
    `;
    if (rows.length === 0) return null;
    const data = rows[0];
    return {
        id: data.booking_id,
        timestamp: data.created_at.toISOString(),
        customerName: data.customer_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        taxId: data.tax_id,
        checkIn: formatDateFromDB(data.check_in_date),
        checkOut: formatDateFromDB(data.check_out_date),
        roomIds: data.room_numbers.split(','),
        paymentStatus: mapPaymentStatusFromDB(data.status),
        depositAmount: parseFloat(data.deposit),
        pricePerNight: parseFloat(data.price_per_night),
    };
}

// Main handler for GET (all) and POST (create)
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  switch (request.method) {
    case 'GET':
      return handleGetBookings(request, response);
    case 'POST':
      return handlePostBooking(request, response);
    default:
      return response.status(405).json({ message: 'Method Not Allowed' });
  }
}

// --- GET All Bookings ---
async function handleGetBookings(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { rows } = await sql`
        SELECT
            b.customer_id, c.customer_name, c.phone, c.email, c.address, c.tax_id,
            b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night,
            MIN(b.booking_id) as representative_booking_id,
            MIN(b.created_at) as created_at,
            STRING_AGG(r.room_number, ',' ORDER BY r.room_number) as room_numbers
        FROM bookings b
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN rooms r ON b.room_id = r.room_id
        GROUP BY
            b.customer_id, c.customer_name, c.phone, c.email, c.address, c.tax_id,
            b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night
        ORDER BY created_at DESC;
    `;

    const formattedBookings = rows.map(row => ({
      id: row.representative_booking_id,
      timestamp: row.created_at.toISOString(),
      customerName: row.customer_name,
      phone: row.phone,
      checkIn: formatDateFromDB(row.check_in_date),
      checkOut: formatDateFromDB(row.check_out_date),
      roomIds: row.room_numbers.split(','),
      paymentStatus: mapPaymentStatusFromDB(row.status),
      depositAmount: parseFloat(row.deposit),
      email: row.email,
      address: row.address,
      taxId: row.tax_id,
      pricePerNight: parseFloat(row.price_per_night),
    }));

    return res.status(200).json(formattedBookings);
  } catch (error) {
    console.error('API Get Bookings Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// --- POST a New Booking ---
async function handlePostBooking(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
        customerName, phone, checkIn, checkOut, roomIds, 
        paymentStatus, depositAmount, email, address, taxId, pricePerNight 
    } = req.body;

    // 1. Find or Create Customer
    let customerResult = await sql`
        SELECT customer_id FROM customers WHERE customer_name = ${customerName} AND phone = ${phone};
    `;
    let customerId;
    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].customer_id;
      // Optionally update customer details
      await sql`UPDATE customers SET email = ${email}, address = ${address}, tax_id = ${taxId} WHERE customer_id = ${customerId};`;
    } else {
      customerResult = await sql`
          INSERT INTO customers (customer_name, phone, email, address, tax_id)
          VALUES (${customerName}, ${phone}, ${email}, ${address}, ${taxId})
          RETURNING customer_id;
      `;
      customerId = customerResult.rows[0].customer_id;
    }

    // 2. Create bookings for each room
    const checkInDB = formatDateForDB(checkIn);
    const checkOutDB = formatDateForDB(checkOut);
    const paymentStatusDB = mapPaymentStatusToDB(paymentStatus);

    for (const roomNumber of roomIds) {
        const roomResult = await sql`SELECT room_id FROM rooms WHERE room_number = ${roomNumber};`;
        if (roomResult.rows.length === 0) {
            // In a real app with transactions, we would roll back here.
            return res.status(400).json({ message: `Room ${roomNumber} not found.` });
        }
        const roomId = roomResult.rows[0].room_id;

        // Generate booking ID using DB function
        const idResult = await sql`SELECT generate_booking_id() as new_id;`;
        const newBookingId = idResult.rows[0].new_id;

        await sql`
            INSERT INTO bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
            VALUES (${newBookingId}, ${customerId}, ${roomId}, ${checkInDB}, ${checkOutDB}, ${paymentStatusDB}, ${pricePerNight}, ${depositAmount || 0});
        `;
    }
    
    // 3. Fetch the newly created logical booking and return it
    const newBooking = await getFormattedBooking(customerId, checkInDB, checkOutDB);
    return res.status(201).json(newBooking);

  } catch (error) {
    console.error('API Post Booking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

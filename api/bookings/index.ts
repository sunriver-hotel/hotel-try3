// api/bookings/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from '../utils/db';
import { formatDateForDB, formatDateFromDB, mapPaymentStatusToDB, mapPaymentStatusFromDB } from '../utils/db-helpers';

// Helper function to query and format a single logical booking
const getFormattedBooking = async (customerId: number, checkIn: string, checkOut: string) => {
    const { rows } = await pool.query(`
        SELECT
            c.customer_name, c.phone, c.email, c.address, c.tax_id,
            b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night,
            MIN(b.booking_id) as booking_id,
            MIN(b.created_at) as created_at,
            STRING_AGG(r.room_number, ',' ORDER BY r.room_number) as room_numbers
        FROM bookings b
        JOIN customers c ON b.customer_id = c.customer_id
        JOIN rooms r ON b.room_id = r.room_id
        WHERE b.customer_id = $1
          AND b.check_in_date = $2
          AND b.check_out_date = $3
        GROUP BY c.customer_name, c.phone, c.email, c.address, c.tax_id, b.check_in_date, b.check_out_date, b.status, b.deposit, b.price_per_night;
    `, [customerId, checkIn, checkOut]);
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
        roomIds: data.room_numbers.split(',').sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })),
        paymentStatus: mapPaymentStatusFromDB(data.status),
        depositAmount: parseFloat(data.deposit),
        pricePerNight: parseFloat(data.price_per_night),
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      return handleGetBookings(req, res);
    case 'POST':
      return handlePostBooking(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function handleGetBookings(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await pool.query(`
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
    `);

    const formattedBookings = rows.map(row => ({
      id: row.representative_booking_id,
      timestamp: row.created_at.toISOString(),
      customerName: row.customer_name,
      phone: row.phone,
      checkIn: formatDateFromDB(row.check_in_date),
      checkOut: formatDateFromDB(row.check_out_date),
      roomIds: row.room_numbers.split(',').sort((a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })),
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

async function handlePostBooking(req: VercelRequest, res: VercelResponse) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { 
        customerName, phone, checkIn, checkOut, roomIds, 
        paymentStatus, depositAmount, email, address, taxId, pricePerNight 
    } = req.body;

    let customerResult = await client.query('SELECT customer_id FROM customers WHERE customer_name = $1 AND phone = $2;', [customerName, phone]);
    let customerId;

    if (customerResult.rows.length > 0) {
      customerId = customerResult.rows[0].customer_id;
      await client.query('UPDATE customers SET email = $1, address = $2, tax_id = $3 WHERE customer_id = $4;', [email, address, taxId, customerId]);
    } else {
      customerResult = await client.query(
          'INSERT INTO customers (customer_name, phone, email, address, tax_id) VALUES ($1, $2, $3, $4, $5) RETURNING customer_id;',
          [customerName, phone, email, address, taxId]
      );
      customerId = customerResult.rows[0].customer_id;
    }

    const checkInDB = formatDateForDB(checkIn);
    const checkOutDB = formatDateForDB(checkOut);
    const paymentStatusDB = mapPaymentStatusToDB(paymentStatus);

    for (const roomNumber of roomIds) {
        const roomResult = await client.query('SELECT room_id FROM rooms WHERE room_number = $1;', [roomNumber]);
        const roomId = roomResult.rows[0].room_id;

        const idResult = await client.query("SELECT generate_booking_id() as new_id;");
        const newBookingId = idResult.rows[0].new_id;

        await client.query(
            `INSERT INTO bookings (booking_id, customer_id, room_id, check_in_date, check_out_date, status, price_per_night, deposit)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
            [newBookingId, customerId, roomId, checkInDB, checkOutDB, paymentStatusDB, pricePerNight, depositAmount || 0]
        );
    }
    
    await client.query('COMMIT');
    const newBooking = await getFormattedBooking(customerId, checkInDB, checkOutDB);
    return res.status(201).json(newBooking);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('API Post Booking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    client.release();
  }
}
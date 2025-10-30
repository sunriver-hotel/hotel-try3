// api/auth/login.ts
import { sql } from '@vercel/postgres';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ message: 'Username and password are required' });
    }

    const { rows } = await sql`
      SELECT * FROM "users" WHERE username = ${username};
    `;
    
    const user = rows[0];

    if (user && user.password_hash === password) {
      // In a real application, use a library like bcrypt to compare hashed passwords.
      // For this project, we are comparing plain text as per the schema.
      return response.status(200).json({ message: 'Login successful' });
    } else {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('API Login Error:', error);
    return response.status(500).json({ message: 'Internal Server Error' });
  }
}

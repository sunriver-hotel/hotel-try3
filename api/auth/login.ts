// api/auth/login.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { pool } from '../utils/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const { rows } = await pool.query('SELECT * FROM "users" WHERE username = $1', [username]);
    
    const user = rows[0];

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (passwordMatch) {
        return res.status(200).json({ message: 'Login successful' });
      }
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });

  } catch (error: any) {
    console.error('API Login Error:', error);
    return res.status(500).json({ 
        message: 'Database connection error. Please check your NEON_DATABASE_URL environment variable in Vercel.',
        error: error.message
    });
  }
}

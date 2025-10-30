// api/auth/hash.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';

// This is a utility endpoint to generate a password hash.
// Usage: /api/auth/hash?password=your_password_here
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { password } = req.query;

  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Please provide a password in the query string, e.g., ?password=mypassword' });
  }

  try {
    const saltRounds = 10; // Standard salt rounds for bcrypt
    const hash = await bcrypt.hash(password, saltRounds);

    return res.status(200).json({
      password: password,
      hash: hash,
    });
  } catch (error: any) {
    console.error('Hashing Error:', error);
    return res.status(500).json({
      message: 'Error generating hash',
      error: error.message,
    });
  }
}

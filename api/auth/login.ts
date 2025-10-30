
// api/auth/login.ts
import { sql } from '@vercel/postgres';
// FIX: Use NextApiHandler to ensure proper typing of the request object.
import { NextApiHandler } from 'next';
import bcrypt from 'bcrypt';

const handler: NextApiHandler = async (
  request,
  response,
) => {
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

    // Check if user exists first
    if (user) {
      // Use bcrypt.compare to securely compare the provided password with the stored hash
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (passwordMatch) {
        // Passwords match, login successful
        return response.status(200).json({ message: 'Login successful' });
      }
    }
    
    // If user is not found or password does not match, return invalid credentials
    return response.status(401).json({ message: 'Invalid credentials' });

  } catch (error: any) {
    console.error('API Login Error:', error);
    // Provide a more detailed error message for debugging database connection issues
    return response.status(500).json({ 
        message: 'Database connection error. Please check your DATABASE_URL environment variable in Vercel.',
        error: error.message // Also send the raw error message
    });
  }
};

export default handler;
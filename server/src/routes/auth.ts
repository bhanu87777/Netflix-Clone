import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { AuthRequest, getJwtSecret, requireAuth } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const router = Router();

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

function signToken(userId: number): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new HttpError(400, 'A valid email is required');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters');
  }
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new HttpError(400, 'Name is required');
  }

  const [existing] = await pool.query<UserRow[]>('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new HttpError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email, passwordHash, name.trim()]
  );

  res.status(201).json({
    token: signToken(result.insertId),
    user: { id: result.insertId, email, name: name.trim() },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required');
  }

  const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email or password');
  }

  res.json({
    token: signToken(user.id),
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const [rows] = await pool.query<UserRow[]>('SELECT id, email, name FROM users WHERE id = ?', [
    req.userId,
  ]);
  const user = rows[0];
  if (!user) {
    throw new HttpError(401, 'User no longer exists');
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

export default router;

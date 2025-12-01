import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already used' });
    const hash = await bcrypt.hash(password, 10);
    const userRole = 'admin';
    const created = await prisma.user.create({ data: { name, email, password_hash: hash, role: userRole } });
    const user = { id: created.id, name: created.name, email: created.email, role: created.role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const userRow = await prisma.user.findUnique({ where: { email } });
    if (!userRow) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const user = { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ user, token });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });
    res.json(me);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

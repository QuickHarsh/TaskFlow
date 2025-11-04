import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const rows = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true }, orderBy: { name: 'asc' } });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

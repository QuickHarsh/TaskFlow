import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { auth, allowRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { created_by: req.user.id },
          { members: { some: { user_id: req.user.id } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, allowRoles('admin', 'manager'), async (req, res) => {
  const { name, description, memberIds = [] } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  try {
    const created = await prisma.project.create({
      data: {
        name,
        description: description || '',
        created_by: req.user.id,
        members: {
          create: memberIds.map((uid) => ({ user_id: Number(uid) })),
        },
      },
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: Number(req.params.id) } });
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// Add a member to project
router.post('/:id/members', auth, allowRoles('admin', 'manager'), async (req, res) => {
  const projectId = Number(req.params.id);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId required' });
  try {
    // ensure project exists
    const p = await prisma.project.findUnique({ where: { id: projectId } });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    const member = await prisma.projectMember.upsert({
      where: { project_id_user_id: { project_id: projectId, user_id: Number(userId) } },
      update: {},
      create: { project_id: projectId, user_id: Number(userId) },
    });
    res.status(201).json(member);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a member from project
router.delete('/:id/members/:userId', auth, allowRoles('admin', 'manager'), async (req, res) => {
  const projectId = Number(req.params.id);
  const userId = Number(req.params.userId);
  try {
    await prisma.projectMember.delete({
      where: { project_id_user_id: { project_id: projectId, user_id: userId } },
    });
    res.json({ ok: true });
  } catch (e) {
    // if not found, still return ok for idempotency
    res.json({ ok: true });
  }
});

// Delete a project (admin only)
router.delete('/:id', auth, allowRoles('admin'), async (req, res) => {
  const projectId = Number(req.params.id);
  try {
    // Delete related entities first to avoid FK issues
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { project_id: projectId } }),
      prisma.task.deleteMany({ where: { project_id: projectId } }),
      prisma.projectMember.deleteMany({ where: { project_id: projectId } }),
      prisma.project.delete({ where: { id: projectId } }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

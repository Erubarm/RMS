const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// POST / — create teacher request
router.post('/', async (req, res, next) => {
  try {
    const { school, className, studentsCount, expositionId, preferredDate, phone } = req.body;
    const userId = req.user.id;

    if (!school || !className || !studentsCount || !expositionId || !preferredDate || !phone) {
      return res.status(400).json({
        error: 'All fields are required: school, className, studentsCount, expositionId, preferredDate, phone',
        code: 400,
      });
    }

    const exposition = await prisma.exposition.findUnique({
      where: { id: expositionId },
    });

    if (!exposition) {
      return res.status(404).json({ error: 'Exposition not found', code: 404 });
    }

    const teacherRequest = await prisma.teacherRequest.create({
      data: {
        userId,
        school,
        className,
        studentsCount,
        expositionId,
        preferredDate: new Date(preferredDate + 'T00:00:00.000Z'),
        phone,
      },
    });

    res.status(201).json(teacherRequest);
  } catch (err) {
    next(err);
  }
});

// GET /my — list current user's teacher requests
router.get('/my', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await prisma.teacherRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

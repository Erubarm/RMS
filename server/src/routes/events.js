const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET / — list events with pagination, optional type filter
router.get('/', async (req, res, next) => {
  try {
    const { type, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = { isActive: true };
    if (type) {
      where.type = type.toUpperCase();
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

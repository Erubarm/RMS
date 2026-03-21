const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET / — list all active expositions with their excursions
router.get('/', async (req, res, next) => {
  try {
    const expositions = await prisma.exposition.findMany({
      where: { isActive: true },
      include: { excursions: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(expositions);
  } catch (err) {
    next(err);
  }
});

// GET /:id — get exposition by id with excursions
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const exposition = await prisma.exposition.findUnique({
      where: { id },
      include: { excursions: true },
    });

    if (!exposition) {
      return res.status(404).json({ error: 'Exposition not found', code: 404 });
    }

    res.json(exposition);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

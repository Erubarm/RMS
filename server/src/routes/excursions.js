const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET / — list all excursions with exposition info
router.get('/', async (req, res, next) => {
  try {
    const excursions = await prisma.excursion.findMany({
      include: { exposition: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(excursions);
  } catch (err) {
    next(err);
  }
});

// GET /:id — get excursion by id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const excursion = await prisma.excursion.findUnique({
      where: { id },
      include: { exposition: true },
    });

    if (!excursion) {
      return res.status(404).json({ error: 'Excursion not found', code: 404 });
    }

    res.json(excursion);
  } catch (err) {
    next(err);
  }
});

// GET /:id/slots — get available time slots for a date
router.get('/:id/slots', async (req, res, next) => {
  try {
    const excursionId = parseInt(req.params.id, 10);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Query parameter "date" is required', code: 400 });
    }

    const slotDate = new Date(date + 'T00:00:00.000Z');

    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        excursionId,
        date: slotDate,
      },
      include: {
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
          select: { peopleCount: true },
        },
      },
      orderBy: { time: 'asc' },
    });

    const result = timeSlots.map((slot) => {
      const bookedSpots = slot.bookings.reduce((sum, b) => sum + b.peopleCount, 0);
      const { bookings, ...slotData } = slot;
      return {
        ...slotData,
        availableSpots: slot.availableSpots - bookedSpots,
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

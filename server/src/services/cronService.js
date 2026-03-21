const cron = require('node-cron');
const prisma = require('../prisma');
const { sendNotification } = require('./notificationService');

/**
 * Находит бронирования, у которых слот будет через targetHours ± 0.5ч,
 * и пользователь подписан на уведомления.
 */
async function getUpcomingBookings(targetHours) {
  const now = new Date();
  const windowStart = new Date(now.getTime() + (targetHours - 0.5) * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + (targetHours + 0.5) * 60 * 60 * 1000);

  // Получаем дату начала и конца окна
  const startDate = new Date(windowStart);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(windowEnd);
  endDate.setUTCHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      user: { notifyEnabled: true },
      timeSlot: {
        date: { gte: startDate, lte: endDate },
      },
    },
    include: {
      user: { select: { id: true, vkId: true } },
      timeSlot: {
        include: { excursion: true },
      },
    },
  });

  // Точная фильтрация по времени слота
  return bookings.filter((b) => {
    const slotDate = new Date(b.timeSlot.date);
    const [h, m] = b.timeSlot.time.split(':').map(Number);
    slotDate.setUTCHours(h, m, 0, 0);
    return slotDate >= windowStart && slotDate <= windowEnd;
  });
}

async function sendReminders(targetHours, messageTemplate) {
  try {
    const bookings = await getUpcomingBookings(targetHours);
    console.log(`[Cron] Напоминания за ${targetHours}ч: найдено ${bookings.length} бронирований`);

    for (const booking of bookings) {
      const excursionTitle = booking.timeSlot.excursion?.title || 'экскурсия';
      const time = booking.timeSlot.time;
      const message = messageTemplate
        .replace('{title}', excursionTitle)
        .replace('{time}', time)
        .replace('{code}', booking.code);

      await sendNotification(booking.user.vkId, message);
    }
  } catch (err) {
    console.error('[Cron] Ошибка при отправке напоминаний:', err.message);
  }
}

function startCronJobs() {
  // Напоминание за 24 часа — каждый час в 00 минут
  cron.schedule('0 * * * *', () => {
    sendReminders(
      24,
      'Напоминаем: завтра в {time} у вас экскурсия «{title}». Код записи: {code}. Ждём вас в историческом парке «Россия — Моя история» (г. Тверь, ул. Советская, 34).'
    );
  });

  // Напоминание за 2 часа — каждые 30 минут
  cron.schedule('*/30 * * * *', () => {
    sendReminders(
      2,
      'Через 2 часа в {time} — ваша экскурсия «{title}»! Код записи: {code}. Не забудьте взять документы. Ждём вас!'
    );
  });

  console.log('[Cron] Задачи запущены: напоминания за 24ч и за 2ч до экскурсии');
}

module.exports = { startCronJobs };

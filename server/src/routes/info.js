const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /faq — list active FAQs ordered by `order`
router.get('/faq', async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    res.json(faqs);
  } catch (err) {
    next(err);
  }
});

// GET /contacts — park contacts/schedule (Tver)
router.get('/contacts', (req, res) => {
  res.json({
    name: 'Исторический парк «Россия — Моя история» (Тверь)',
    address: 'г. Тверь, ул. Советская, д. 34',
    phone: '+7 (4822) 77-78-30',
    email: 'tver@myhistorypark.ru',
    website: 'https://myhistorypark.ru/tver/',
    schedule: {
      open: 'СР–ВС 11:00–19:00',
      cashDesk: 'до 18:00',
      dayOff: 'Понедельник, вторник',
    },
    socialMedia: {
      vk: 'https://vk.com/myhistorypark_tver',
    },
    directions: [
      { type: 'bus', description: 'Остановка «Площадь Ленина» — автобусы № 20, 21, 30, 41, маршрутки № 5, 7, 212. 3 минуты пешком.' },
      { type: 'car', description: 'От Московского шоссе по ул. Вольного Новгорода до ул. Советской. Парковка на пл. Ленина.' },
      { type: 'train', description: 'Ж/д вокзал Тверь — 15 минут пешком по пр. Чайковского, далее ул. Советская.' },
      { type: 'moscow', description: 'Электричка / «Ласточка» до ст. Тверь (~1,5 часа).' },
    ],
  });
});

// GET /benefits — pricing/benefits info (Tver)
router.get('/benefits', (req, res) => {
  res.json({
    pricing: [
      { category: 'Взрослый (1 экспозиция)', price: 400 },
      { category: 'Единый билет (все экспозиции)', price: 900 },
      { category: 'Льготный (школьники, студенты, пенсионеры)', price: 200 },
      { category: 'Дети до 7 лет', price: 0 },
    ],
    benefits: [
      'Бесплатный вход для детей до 7 лет',
      'Скидка 50% для школьников, студентов очной формы и пенсионеров',
      'Бесплатный вход для ветеранов ВОВ и инвалидов I и II группы',
      'Бесплатные экскурсии для организованных школьных групп по предварительной заявке',
      'Скидка 20% для организованных групп от 10 человек',
    ],
  });
});

module.exports = router;

# План разработки VK Mini App для РМИ

## Обзор

- **Проект:** VK Mini App для исторического парка «Россия — Моя история»
- **Стек:** React + JavaScript + VKUI / Node.js + Express + Prisma / PostgreSQL + Redis
- **Срок:** 12 недель
- **Режим:** разработка → тестирование → (опционально) публикация в каталог VK

---

## Этап 1. Подготовка и проектирование — неделя 1

### 1.1 Регистрация приложения
- [x] Зайти на [dev.vk.com](https://dev.vk.com) → Мои приложения → Создать
- [x] Тип: «Мини-приложение»
- [x] Заполнить название: «Россия — Моя история»
- [x] Получить `app_id` и `secure_key`
- [x] Включить режим разработки

### 1.2 Инициализация проекта
- [x] Создать монорепозиторий:
  ```
  rmi-app/
  ├── client/       # VK Mini App (React)
  ├── server/       # Backend (Node.js)
  ├── admin/        # Админ-панель (React)
  └── docs/         # Документация
  ```
- [x] Инициализировать клиент (React + Vite + VKUI)
- [x] Инициализировать сервер (Express + Prisma + PostgreSQL в Docker)
- [x] Настроить Git: `.gitignore`
- [ ] Настроить VK Tunnel для локальной разработки (использовали dev-режим с mock-авторизацией)

### 1.3 Проектирование БД
- [ ] Нарисовать ER-диаграмму (Excalidraw / dbdiagram.io)
- [x] Написать `schema.prisma`:
  ```prisma
  model User {
    id        Int      @id @default(autoincrement())
    vkId      Int      @unique
    firstName String
    lastName  String
    phone     String?
    email     String?
    role      Role     @default(USER)
    bookings  Booking[]
    teacherRequests TeacherRequest[]
    createdAt DateTime @default(now())
  }

  model Exposition {
    id          Int      @id @default(autoincrement())
    title       String
    description String
    imageUrl    String?
    schedule    String
    isActive    Boolean  @default(true)
    excursions  Excursion[]
  }

  model Excursion {
    id           Int      @id @default(autoincrement())
    expositionId Int
    exposition   Exposition @relation(fields: [expositionId], references: [id])
    title        String
    price        Int
    maxGroupSize Int      @default(30)
    durationMin  Int
    timeSlots    TimeSlot[]
  }

  model TimeSlot {
    id             Int      @id @default(autoincrement())
    excursionId    Int
    excursion      Excursion @relation(fields: [excursionId], references: [id])
    date           DateTime @db.Date
    time           String
    availableSpots Int
    bookings       Booking[]
  }

  model Booking {
    id          Int      @id @default(autoincrement())
    userId      Int
    user        User     @relation(fields: [userId], references: [id])
    timeSlotId  Int
    timeSlot    TimeSlot @relation(fields: [timeSlotId], references: [id])
    peopleCount Int
    status      BookingStatus @default(PENDING)
    code        String   @unique
    createdAt   DateTime @default(now())
  }

  model Event {
    id        Int      @id @default(autoincrement())
    title     String
    content   String
    imageUrl  String?
    eventDate DateTime?
    type      EventType
    isActive  Boolean  @default(true)
    createdAt DateTime @default(now())
  }

  model TeacherRequest {
    id            Int      @id @default(autoincrement())
    userId        Int
    user          User     @relation(fields: [userId], references: [id])
    school        String
    className     String
    studentsCount Int
    expositionId  Int
    preferredDate DateTime @db.Date
    phone         String
    status        RequestStatus @default(PENDING)
    createdAt     DateTime @default(now())
  }

  model Faq {
    id       Int     @id @default(autoincrement())
    question String
    answer   String
    order    Int     @default(0)
    isActive Boolean @default(true)
  }

  enum Role { USER TEACHER MODERATOR ADMIN }
  enum BookingStatus { PENDING CONFIRMED CANCELLED COMPLETED }
  enum EventType { EXHIBITION NEWS LECTURE WORKSHOP }
  enum RequestStatus { PENDING REVIEWING CONFIRMED REJECTED }
  ```

### 1.4 Проектирование API
- [x] Описать все эндпоинты (метод, путь, параметры, ответ)
- [x] Описать формат ошибок: `{ error: string, code: number }`

### 1.5 Макеты в Figma
- [ ] Главная (баннер + быстрые действия + ближайшие события)
- [ ] Афиша (список карточек с фильтрами)
- [ ] Карточка экскурсии (описание + кнопка «Записаться»)
- [ ] Форма записи (4 шага)
- [ ] Мои бронирования
- [ ] Информация (как добраться, цены, FAQ)
- [ ] Профиль

> **Результат этапа:** проект инициализирован, схема БД готова, макеты нарисованы

---

## Этап 2. Инфраструктура и бэкенд — недели 2–3

### 2.1 Настройка сервера (неделя 2)
- [x] Разворачиваем на локальной машине
- [x] PostgreSQL 16 в Docker-контейнере (порт 5434, docker-compose.yml)
- [ ] Установить Redis (отложено до этапа уведомлений)
- [x] Node.js установлен
- [ ] Настроить PM2 (для продакшена)

### 2.2 Базовый API (неделя 2)
- [x] Структура сервера создана (app.js, routes/, middleware/, utils/, prisma.js)
- [x] Middleware авторизации VK (HMAC-SHA256 проверка + dev-режим с mock-пользователем)
- [x] CRUD для экспозиций: `GET /api/expositions`, `GET /api/expositions/:id`
- [x] CRUD для экскурсий: `GET /api/excursions`, `GET /api/excursions/:id`
- [x] Схема БД применена через `prisma db push`

### 2.3 Бизнес-логика (неделя 3)
- [x] Система слотов: `GET /api/excursions/:id/slots?date=2026-04-01`
- [x] Бронирование: `POST /api/bookings`, `GET /api/bookings/my`, `DELETE /api/bookings/:id`
- [x] События: `GET /api/events?type=NEWS&page=1&limit=10` (с фильтрацией и пагинацией)
- [x] Информация: `GET /api/info/faq`, `GET /api/info/contacts`, `GET /api/info/directions`
- [x] Заявки учителей: `POST /api/teacher-requests`, `GET /api/teacher-requests/my`
- [x] Seed-скрипт: Рюриковичи, Романовы, Пётр I, От великих потрясений + экскурсии + слоты + FAQ (Тверь)
- [x] Тесты (Jest): авторизация, бронирование, отмена, проверка лимитов (покрытие 94%)

> **Результат этапа:** API полностью работает, можно тестировать через Postman

---

## Этап 3. Фронтенд: информационные модули — недели 4–5

### 3.1 Каркас приложения (неделя 4)
- [x] Структура клиента создана (все 11 страниц + api/ + store/ + utils/)
- [x] Инициализация VK Bridge (с обработкой ошибок вне VK-среды)
- [x] Роутинг через vk-mini-apps-router (hash-router, 11 маршрутов)
- [x] Главная страница: баннер, быстрые действия, ближайшие события
- [x] Афиша: список экспозиций с переходом на детальную страницу
- [x] Детальная карточка выставки и экскурсии с кнопкой «Записаться»

### 3.2 Информационные разделы (неделя 5)
- [x] Экран «Информация» (Тверь): как добраться, график СР–ВС 11:00–19:00, контакты
- [x] Цены и льготы — в экране «Информация»
- [x] FAQ — аккордеон с вопросами и ответами, данные из БД
- [x] Правила посещения — в экране «Информация»
- [ ] Схема залов парка (SVG-карта)
- [x] Лента событий с фильтрами по типу и пагинацией «Загрузить ещё»
- [ ] Тёмная тема: проверить кастомные стили
- [ ] Lazy loading изображений

> **Результат этапа:** приложение открывается в VK, показывает всю информацию о парке

---

## Этап 4. Запись и бронирование — недели 6–7

### 4.1 Процесс бронирования (неделя 6)
- [x] Многошаговая форма (4 шага): выбор экскурсии → дата → время/кол-во → подтверждение
- [ ] Автозаполнение через VK Bridge (VKWebAppGetPhoneNumber, VKWebAppGetEmail)
- [x] SlotPicker: сетка слотов, серые = занято, счётчик мест
- [x] Расчёт стоимости в реальном времени
- [x] Валидация через react-hook-form + yup
- [x] Экран успешного бронирования с кодом записи

### 4.2 Личный кабинет и модуль учителя (неделя 7)
- [x] «Мои бронирования»: активные и прошедшие, статусы, кнопка отмены
- [x] Отмена бронирования: модальное подтверждение через VKUI Alert
- [x] «Для учителей»: форма (школа, класс, кол-во, экспозиция, дата, телефон)
- [x] Профиль: аватар из VK, имя
- [ ] Шаринг: VKWebAppShare

> **Результат этапа:** полный цикл бронирования работает

---

## Этап 5. Уведомления — неделя 8

### 5.1 Подписка
- [x] Запрос разрешения через `VKWebAppAllowNotifications` + `VKWebAppDenyNotifications`
- [x] Сохранение статуса подписки в БД (поле `notifyEnabled` в модели User)
- [x] API: `POST /api/notifications/subscribe`, `DELETE /api/notifications/subscribe`, `GET /api/notifications/status`

### 5.2 Отправка уведомлений (сервер)
- [ ] Bull для очереди (заменили на прямой вызов с паузой 1с — достаточно для текущего масштаба)
- [x] Cron-задачи через `node-cron`: напоминание за 24ч (каждый час) и за 2ч (каждые 30 мин)
- [x] Отправка через VK API `messages.send` (в dev-режиме логирует, требует `VK_GROUP_TOKEN`)
- [x] Массовая рассылка: `POST /api/notifications/broadcast` (только ADMIN)
- [x] Rate limiting: пауза 1с между запросами к VK API

### 5.3 Дополнительные интеграции
- [x] Добавление в избранное: `VKWebAppAddToFavorites` в Profile
- [ ] Подготовка к VK Pay (откладываем)

> **Результат этапа:** автоматические напоминания работают

---

## Этап 6. Админ-панель — недели 9–10

### 6.1 Основные модули (неделя 9)
- [x] React + Vite приложение в `admin/` (порт 5174)
- [x] Авторизация: ADMIN_SECRET → JWT (24ч), хранится в localStorage
- [x] Структура: Login, Dashboard, Bookings, TeacherRequests, Events, Faq, Notifications
- [x] CRUD событий и новостей с формой редактирования
- [x] Управление FAQ: создание/редактирование/удаление, сортировка по order
- [x] Таблица бронирований: фильтр по статусу, кнопки подтвердить/отклонить, пагинация

### 6.2 Контент и аналитика (неделя 10)
- [x] Дашборд (Recharts): бронирования за 7 дней (BarChart), статусы (PieChart), популярные экскурсии
- [x] Управление заявками учителей: просмотр + смена статуса (PENDING→REVIEWING→CONFIRMED/REJECTED)
- [x] Модуль массовых уведомлений: текст + шаблоны + кнопка отправки
- [ ] Drag-and-drop сортировка FAQ (отложено)

> **Результат этапа:** администратор управляет всем контентом через веб-интерфейс

---

## Этап 7. Тестирование и деплой — недели 11–12

### 7.1 Тестирование (неделя 11)
- [x] Unit-тесты бэкенда (Jest):
  - Авторизация VK
  - Создание/отмена бронирования
  - Проверка лимитов слотов
  - Бизнес-правила (24ч отмена, макс. группа)
  - **Покрытие: 94% (цель ≥ 80% — достигнута)**
- [x] Интеграционные тесты API (Supertest):
  - Полный цикл бронирования
  - Ошибки валидации
  - Доступ без авторизации
- [ ] E2E тесты (Playwright):
  - Открытие приложения → просмотр афиши → запись на экскурсию → подтверждение
  - Отмена бронирования
  - Подача заявки учителя
- [ ] Ручное тестирование:
  - iOS (Safari WebView) + Android (Chrome WebView)
  - Десктопный VK
  - Тёмная тема
  - Медленный интернет (3G throttling)
- [ ] Тестирование через VK Testers (если доступно)
- [ ] Нагрузочное тестирование: Artillery, 100 одновременных запросов
- [ ] Фикс найденных багов

### 7.2 Оптимизация и деплой (неделя 12)
- [ ] Оптимизация фронтенда:
  - Code splitting: `React.lazy()` для каждой страницы
  - Tree shaking через Vite
  - Сжатие: бандл < 200 КБ (gzip)
  - Изображения: WebP + srcset
- [ ] Оптимизация бэкенда:
  - Индексы PostgreSQL: `vk_id`, `date`, `status`, `exposition_id`
  - `EXPLAIN ANALYZE` на тяжёлые запросы
  - Redis кэш: расписание (TTL 5 мин), FAQ (TTL 1 час)
- [ ] Nginx:
  ```nginx
  server {
      listen 443 ssl http2;
      server_name rmi-app.example.com;

      gzip on;
      gzip_types text/css application/javascript application/json image/svg+xml;

      location / {
          root /var/www/rmi-app/client/dist;
          try_files $uri /index.html;
          expires 7d;
      }

      location /api {
          proxy_pass http://127.0.0.1:3000;
          proxy_set_header X-Real-IP $remote_addr;
      }

      location /admin {
          root /var/www/rmi-app/admin/dist;
          try_files $uri /admin/index.html;
      }
  }
  ```
- [ ] CI/CD (GitHub Actions):
  ```yaml
  # .github/workflows/deploy.yml
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
        - run: cd client && npm ci && npm run build
        - run: cd server && npm ci && npm test
        - # scp + ssh deploy to VPS
  ```
- [ ] PM2: `pm2 start ecosystem.config.cjs`
- [ ] Бэкап БД: `pg_dump` через cron ежедневно
- [ ] Заполнить карточку приложения VK: название, описание, скриншоты, иконка
- [ ] (Опционально) Отправить на модерацию VK

> **Результат этапа:** приложение задеплоено, работает, документация готова

---

## Чеклист для диплома

- [x] Приложение работает в режиме разработки (dev-режим с mock-авторизацией)
- [x] Все 6 модулей функционируют: афиша ✅, запись ✅, информация ✅, уведомления ✅, учителям ✅, админка ✅
- [ ] Скриншоты всех экранов для пояснительной записки
- [ ] ER-диаграмма базы данных
- [ ] Диаграмма архитектуры системы
- [x] Описание API-эндпоинтов (реализованы в коде)
- [ ] Результаты тестирования (покрытие, нагрузочные тесты)
- [ ] Исходный код на GitHub
- [ ] Инструкция по развёртыванию (README)
# РМИ — Россия Моя История (VK Mini App)

Система бронирования экскурсий для интерактивного исторического парка «Россия — Моя История».

## Требования

Перед началом установите следующие программы:

1. **Node.js** (v18 или выше) — https://nodejs.org/
2. **Docker Desktop** — https://www.docker.com/products/docker-desktop/
3. **Git** — https://git-scm.com/download/win
4. **cloudflared** (для демонстрации через VK) — https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

### Установка cloudflared на Windows

Скачайте установщик по ссылке:
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi

Установите и перезапустите терминал.

## Быстрый запуск

Все команды выполняются в терминале (PowerShell или CMD) из корневой папки проекта.

### 1. Клонирование репозитория

```bash
git clone <URL_репозитория>
cd RMS
```

### 2. Запуск базы данных

Убедитесь, что Docker Desktop запущен, затем выполните:

```bash
docker compose up -d
```

Дождитесь, пока контейнер запустится (10-15 секунд).

### 3. Установка зависимостей и настройка сервера

```bash
cd server
npm install
npx prisma migrate dev
npm run seed
```

### 4. Сборка клиента

Откройте **второй терминал** в корневой папке проекта:

```bash
cd client
npm install
npm run build
```

### 5. Запуск сервера

Вернитесь в первый терминал (папка `server`):

```bash
npm start
```

Должно появиться сообщение: `RMI API server running on port 3000`

Проверьте работу, открыв в браузере: http://localhost:3000/api/health

Ответ должен быть: `{"status":"ok","timestamp":"..."}`

### 6. Запуск туннеля для VK Mini App

Откройте **третий терминал** и выполните:

```bash
cloudflared tunnel --protocol http2 --url http://localhost:3000
```

В выводе найдите строку вида:

```
| https://something-random.trycloudflare.com
```

Скопируйте эту ссылку.

### 7. Настройка VK Mini App

1. Откройте https://dev.vk.com
2. Перейдите в Мои приложения → выберите приложение (ID: 54494236)
3. Настройки → в поле **Адрес** вставьте ссылку из cloudflared
4. Сохраните

### 8. Открытие приложения

Перейдите по ссылке: https://vk.com/app54494236

Приложение должно загрузиться внутри VK.

## Админ-панель

Админ-панель запускается отдельно (необязательно для демонстрации):

```bash
cd admin
npm install
npm run dev
```

Откройте http://localhost:5174 в браузере.

Логин: пароль `admin123`.

## Остановка

1. В терминале с cloudflared — нажмите `Ctrl+C`
2. В терминале с сервером — нажмите `Ctrl+C`
3. Остановите базу данных:

```bash
docker compose down
```

## Устранение неполадок

| Проблема | Решение |
|----------|---------|
| `docker compose up` не работает | Убедитесь, что Docker Desktop запущен |
| `npm start` — ошибка подключения к БД | Подождите 15 секунд после `docker compose up -d` и попробуйте снова |
| Белый экран в VK | Убедитесь, что сервер запущен и cloudflared работает без ошибок |
| cloudflared выдаёт ошибки QUIC | Используйте флаг `--protocol http2` |
| Приложение не открывается в VK | Проверьте, что в настройках VK Mini App указана актуальная ссылка cloudflared |
| Порт 3000 занят | Остановите другой процесс на этом порту или измените `PORT` в файле `server/.env` |

## Структура проекта

```
RMS/
├── client/          — VK Mini App (React + VKUI)
├── admin/           — Админ-панель (React)
├── server/          — Бэкенд (Express + Prisma)
├── docker-compose.yml — БД PostgreSQL
└── README.md
```

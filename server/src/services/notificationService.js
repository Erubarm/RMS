const axios = require('axios');

const VK_API_URL = 'https://api.vk.com/method/messages.send';
const VK_API_VERSION = '5.131';

/**
 * Отправляет уведомление пользователю через VK API.
 * В dev-режиме или при отсутствии токена — логирует в консоль.
 */
async function sendNotification(vkUserId, message) {
  const token = process.env.VK_GROUP_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';

  if (!token) {
    console.log(`[Уведомление] → vkId=${vkUserId}: ${message}`);
    return { ok: true, dev: true };
  }

  try {
    const { data } = await axios.get(VK_API_URL, {
      params: {
        user_id: vkUserId,
        message,
        access_token: token,
        v: VK_API_VERSION,
        random_id: Date.now(),
      },
    });

    if (data.error) {
      console.error(`[VK API] Ошибка для vkId=${vkUserId}:`, data.error);
      return { ok: false, error: data.error };
    }

    if (!isDev) {
      console.log(`[Уведомление отправлено] vkId=${vkUserId}`);
    }
    return { ok: true };
  } catch (err) {
    console.error(`[VK API] Сетевая ошибка для vkId=${vkUserId}:`, err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Массовая рассылка уведомлений.
 * Соблюдает rate limit: не более 1 сообщения за 1с на пользователя.
 */
async function sendBulkNotification(users, message) {
  const results = [];
  for (const user of users) {
    const result = await sendNotification(user.vkId, message);
    results.push({ vkId: user.vkId, ...result });
    // Пауза 1с между запросами чтобы не превысить лимит VK API
    await new Promise((r) => setTimeout(r, 1000));
  }
  return results;
}

module.exports = { sendNotification, sendBulkNotification };

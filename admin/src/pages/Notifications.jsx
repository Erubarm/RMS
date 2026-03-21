import React, { useState } from 'react';
import client from '../api/client';

export default function Notifications() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    setResult(null);
    setError('');
    try {
      const { data } = await client.post('/notifications/broadcast', { message });
      setResult(data);
      setMessage('');
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка при отправке');
    } finally {
      setSending(false);
    }
  };

  const TEMPLATES = [
    'Приглашаем на новую выставку в историческом парке «Россия — Моя история» (г. Тверь)! Подробности на сайте.',
    'Напоминаем о предстоящей экскурсии. Ждём вас! Адрес: ул. Советская, 34.',
    'Изменение расписания: парк работает в обычном режиме СР–ВС 11:00–19:00.',
  ];

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Массовая рассылка</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 8 }}>
              Текст сообщения
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите текст уведомления..."
              style={{ width: '100%', minHeight: 140, padding: '12px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{message.length} символов</div>
          </div>

          {error && <div style={{ background: '#fee', color: '#c62828', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {result && (
            <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              ✓ Рассылка запущена. Получателей: <b>{result.sent}</b>
              {!process.env.NODE_ENV === 'production' && <span> (в dev-режиме сообщения логируются в консоль сервера)</span>}
            </div>
          )}

          <button
            onClick={send}
            disabled={!message.trim() || sending}
            style={{ padding: '10px 24px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, cursor: !message.trim() || sending ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500, opacity: !message.trim() || sending ? .6 : 1 }}
          >
            {sending ? 'Отправка...' : '📤 Отправить всем подписчикам'}
          </button>
        </div>

        <div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#444' }}>Шаблоны</h3>
            {TEMPLATES.map((t, i) => (
              <button key={i} onClick={() => setMessage(t)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', background: '#f8f9fa', border: '1.5px solid #eee', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#555', marginBottom: 8, lineHeight: 1.4 }}>
                {t.slice(0, 80)}...
              </button>
            ))}
          </div>

          <div style={{ background: '#fff3cd', borderRadius: 12, padding: 16, fontSize: 12, color: '#856404', lineHeight: 1.6 }}>
            <b>⚠️ Важно:</b> Рассылка отправляется только пользователям, включившим уведомления. Для реальной отправки через VK укажите <code>VK_GROUP_TOKEN</code> в <code>.env</code>.
          </div>
        </div>
      </div>
    </div>
  );
}

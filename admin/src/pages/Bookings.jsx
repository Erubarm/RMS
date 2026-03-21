import React, { useEffect, useState } from 'react';
import client from '../api/client';

const STATUS_LABELS = { PENDING: ['Ожидает', '#FF9800'], CONFIRMED: ['Подтверждено', '#4CAF50'], CANCELLED: ['Отменено', '#f44336'], COMPLETED: ['Завершено', '#9E9E9E'] };
const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

function Badge({ status }) {
  const [label, color] = STATUS_LABELS[status] || [status, '#999'];
  return <span style={{ background: color + '22', color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{label}</span>;
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);

  const load = (p = 1, s = statusFilter) => {
    setLoading(true);
    client.get('/bookings', { params: { status: s || undefined, page: p, limit: 20 } })
      .then((r) => { setBookings(r.data.data); setTotal(r.data.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, statusFilter); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await client.patch(`/bookings/${id}`, { status });
      load(page);
    } catch { alert('Ошибка при обновлении статуса'); }
    finally { setUpdating(null); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Бронирования <span style={{ color: '#aaa', fontSize: 14, fontWeight: 400 }}>({total})</span></h2>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13 }}>
          <option value="">Все статусы</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]?.[0]}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['ID', 'Код', 'Экскурсия', 'Дата слота', 'Время', 'Чел.', 'Статус', 'Действия'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Загрузка...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Нет бронирований</td></tr>
            ) : bookings.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>{b.id}</td>
                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 500 }}>{b.code}</td>
                <td style={{ padding: '12px 16px' }}>{b.timeSlot?.excursion?.title || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{formatDate(b.timeSlot?.date)}</td>
                <td style={{ padding: '12px 16px' }}>{b.timeSlot?.time || '—'}</td>
                <td style={{ padding: '12px 16px' }}>{b.peopleCount}</td>
                <td style={{ padding: '12px 16px' }}><Badge status={b.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {b.status === 'PENDING' && (
                      <button onClick={() => updateStatus(b.id, 'CONFIRMED')} disabled={updating === b.id}
                        style={{ padding: '4px 10px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        ✓
                      </button>
                    )}
                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                      <button onClick={() => updateStatus(b.id, 'CANCELLED')} disabled={updating === b.id}
                        style={{ padding: '4px 10px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => { setPage(p => Math.max(1, p - 1)); load(Math.max(1, page - 1)); }} disabled={page === 1}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer' }}>←</button>
          <span style={{ padding: '6px 12px', fontSize: 13, color: '#666' }}>{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); load(Math.min(totalPages, page + 1)); }} disabled={page === totalPages}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1.5px solid #ddd', background: '#fff', cursor: 'pointer' }}>→</button>
        </div>
      )}
    </div>
  );
}

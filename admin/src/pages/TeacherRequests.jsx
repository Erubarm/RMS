import React, { useEffect, useState } from 'react';
import client from '../api/client';

const STATUS_LABELS = { PENDING: ['Ожидает', '#FF9800'], REVIEWING: ['На рассмотрении', '#2196F3'], CONFIRMED: ['Подтверждено', '#4CAF50'], REJECTED: ['Отклонено', '#f44336'] };

function Badge({ status }) {
  const [label, color] = STATUS_LABELS[status] || [status, '#999'];
  return <span style={{ background: color + '22', color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{label}</span>;
}

export default function TeacherRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    client.get('/teacher-requests', { params: { status: statusFilter || undefined } })
      .then((r) => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await client.patch(`/teacher-requests/${id}`, { status });
      load();
    } catch { alert('Ошибка'); }
    finally { setUpdating(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Заявки учителей <span style={{ color: '#aaa', fontSize: 14, fontWeight: 400 }}>({requests.length})</span></h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #ddd', fontSize: 13 }}>
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['Школа', 'Класс', 'Учеников', 'Экспозиция (ID)', 'Дата', 'Телефон', 'Статус', 'Действия'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Загрузка...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Нет заявок</td></tr>
            ) : requests.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.school}</td>
                <td style={{ padding: '12px 16px' }}>{r.className}</td>
                <td style={{ padding: '12px 16px' }}>{r.studentsCount}</td>
                <td style={{ padding: '12px 16px', color: '#aaa' }}>#{r.expositionId}</td>
                <td style={{ padding: '12px 16px' }}>{new Date(r.preferredDate).toLocaleDateString('ru-RU')}</td>
                <td style={{ padding: '12px 16px' }}>{r.phone}</td>
                <td style={{ padding: '12px 16px' }}><Badge status={r.status} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {r.status === 'PENDING' && (
                      <button onClick={() => updateStatus(r.id, 'REVIEWING')} disabled={updating === r.id}
                        style={{ padding: '4px 8px', background: '#2196F3', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                        Рассмотреть
                      </button>
                    )}
                    {r.status !== 'CONFIRMED' && r.status !== 'REJECTED' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'CONFIRMED')} disabled={updating === r.id}
                          style={{ padding: '4px 8px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                          Принять
                        </button>
                        <button onClick={() => updateStatus(r.id, 'REJECTED')} disabled={updating === r.id}
                          style={{ padding: '4px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

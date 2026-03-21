import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import client from '../api/client';

const COLORS = ['#4CAF50', '#2196F3', '#f44336', '#FF9800'];
const STATUS_RU = { confirmed: 'Подтверждено', pending: 'Ожидает', cancelled: 'Отменено' };

function StatCard({ label, value, color = '#1a1a2e', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,.06)', flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/stats').then((r) => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Загрузка...</div>;
  if (!stats) return <div style={{ color: '#e53935' }}>Не удалось загрузить статистику</div>;

  const pieData = Object.entries(stats.bookingsByStatus)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: STATUS_RU[key] || key, value }));

  const formatDate = (d) => {
    const parts = d.split('-');
    return `${parts[2]}.${parts[1]}`;
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Дашборд</h2>

      {/* Карточки статистики */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Всего бронирований" value={stats.totals.bookings} color="#2196F3" />
        <StatCard label="Пользователей" value={stats.totals.users} color="#4CAF50" />
        <StatCard label="Предстоящих (7 дней)" value={stats.totals.upcomingBookings} color="#FF9800" />
        <StatCard label="Заявок учителей" value={stats.totals.teacherRequestsPending} color="#9C27B0" sub="ожидают обработки" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* График бронирований по дням */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#444' }}>Бронирования за 7 дней</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.bookingsByDay.map(d => ({ ...d, date: formatDate(d.date) }))}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Бронирований" fill="#2196F3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie-chart статусов */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#444' }}>Статусы бронирований</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Нет данных</div>
          )}
        </div>
      </div>

      {/* Популярные экскурсии */}
      {stats.popularExcursions.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: '#444' }}>Популярные экскурсии</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.popularExcursions} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
              <Tooltip />
              <Bar dataKey="count" name="Бронирований" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

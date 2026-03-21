import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const NAV = [
  { to: '/admin/dashboard',        label: '📊 Дашборд' },
  { to: '/admin/bookings',         label: '🎟️ Бронирования' },
  { to: '/admin/teacher-requests', label: '🏫 Заявки учителей' },
  { to: '/admin/events',           label: '📰 События' },
  { to: '/admin/faq',              label: '❓ FAQ' },
  { to: '/admin/notifications',    label: '🔔 Рассылка' },
];

const s = {
  shell:   { display: 'flex', minHeight: '100vh' },
  sidebar: { width: 220, background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  logo:    { padding: '24px 20px 16px', fontSize: 16, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,.1)' },
  nav:     { flex: 1, padding: '12px 0' },
  link:    { display: 'block', padding: '10px 20px', color: 'rgba(255,255,255,.75)', textDecoration: 'none', fontSize: 14, borderRadius: 6, margin: '2px 8px', transition: 'background .15s' },
  active:  { background: 'rgba(255,255,255,.15)', color: '#fff' },
  logout:  { margin: 16, padding: '10px 16px', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  main:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:  { background: '#fff', padding: '16px 28px', borderBottom: '1px solid #e8e8e8', fontWeight: 600, fontSize: 15 },
  content: { flex: 1, padding: 28, overflowY: 'auto' },
};

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/');
  };

  const adminName = localStorage.getItem('admin_name') || 'Администратор';

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <div style={s.logo}>🏛️ РМИ Тверь<br /><span style={{ fontSize: 11, opacity: .6, fontWeight: 400 }}>Панель управления</span></div>
        <nav style={s.nav}>
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ ...s.link, ...(isActive ? s.active : {}) })}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '0 16px 8px', fontSize: 12, opacity: .5 }}>{adminName}</div>
        <button style={s.logout} onClick={logout}>Выйти</button>
      </aside>
      <main style={s.main}>
        <header style={s.header}>Россия — Моя история · Административная панель</header>
        <div style={s.content}><Outlet /></div>
      </main>
    </div>
  );
}

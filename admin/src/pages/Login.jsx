import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/admin/auth', { secret });
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_name', data.name);
      navigate('/admin/dashboard');
    } catch {
      setError('Неверный пароль. Проверьте ADMIN_SECRET в настройках сервера.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 40, width: 360, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏛️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>РМИ Тверь</h1>
          <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Административная панель</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#444' }}>
            Пароль администратора
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Введите пароль"
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 16 }}
            autoFocus
          />
          {error && <p style={{ color: '#e53935', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={!secret || loading}
            style={{ width: '100%', padding: '11px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: !secret || loading ? .6 : 1 }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}

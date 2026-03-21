import React, { useEffect, useState } from 'react';
import client from '../api/client';

const TYPES = ['EXHIBITION', 'NEWS', 'LECTURE', 'WORKSHOP'];
const TYPE_LABELS = { EXHIBITION: 'Выставка', NEWS: 'Новость', LECTURE: 'Лекция', WORKSHOP: 'Мастер-класс' };
const EMPTY = { title: '', content: '', imageUrl: '', eventDate: '', type: 'NEWS', isActive: true };

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>{label}</label>{children}</div>;
}

const inp = { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none' };
const btn = (color) => ({ padding: '9px 18px', background: color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 });

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | event-object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    client.get('/events').then((r) => setEvents(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (e) => {
    setForm({ title: e.title, content: e.content, imageUrl: e.imageUrl || '', eventDate: e.eventDate ? e.eventDate.split('T')[0] : '', type: e.type, isActive: e.isActive });
    setModal(e);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, eventDate: form.eventDate || null };
      if (modal === 'create') await client.post('/events', payload);
      else await client.put(`/events/${modal.id}`, payload);
      setModal(null);
      load();
    } catch (e) { alert(e.response?.data?.error || 'Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Скрыть событие?')) return;
    try { await client.delete(`/events/${id}`); load(); } catch { alert('Ошибка'); }
  };

  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>События и новости</h2>
        <button onClick={openCreate} style={btn('#1a1a2e')}>+ Добавить</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Загрузка...</div>
          : events.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Нет событий</div>
          : events.map((e) => (
            <div key={e.id} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,.05)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, background: '#e3f2fd', color: '#1976D2', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>{TYPE_LABELS[e.type]}</span>
                  {!e.isActive && <span style={{ fontSize: 11, color: '#aaa' }}>скрыто</span>}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{e.title}</div>
                <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480 }}>{e.content}</div>
                {e.eventDate && <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{new Date(e.eventDate).toLocaleDateString('ru-RU')}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => openEdit(e)} style={{ padding: '6px 14px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Изменить</button>
                {e.isActive && <button onClick={() => remove(e.id)} style={{ padding: '6px 14px', background: '#fee', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#f44336' }}>Скрыть</button>}
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Новое событие' : 'Редактировать событие'} onClose={() => setModal(null)}>
          <Field label="Заголовок *"><input style={inp} value={form.title} onChange={f('title')} /></Field>
          <Field label="Тип *">
            <select style={inp} value={form.type} onChange={f('type')}>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="Содержание *"><textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={form.content} onChange={f('content')} /></Field>
          <Field label="Дата события"><input type="date" style={inp} value={form.eventDate} onChange={f('eventDate')} /></Field>
          <Field label="URL изображения"><input style={inp} value={form.imageUrl} onChange={f('imageUrl')} placeholder="https://..." /></Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={f('isActive')} />
            <label htmlFor="isActive" style={{ fontSize: 13, color: '#555' }}>Опубликовано</label>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} disabled={saving || !form.title || !form.content} style={btn('#1a1a2e')}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
            <button onClick={() => setModal(null)} style={{ ...btn('#f0f0f0'), color: '#333' }}>Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

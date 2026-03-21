import React, { useEffect, useState } from 'react';
import client from '../api/client';

const EMPTY = { question: '', answer: '', order: 0 };
const inp = { width: '100%', padding: '8px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 13, outline: 'none' };
const btn = (color) => ({ padding: '9px 18px', background: color, color: color === '#f0f0f0' ? '#333' : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 });

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    client.get('/faq').then((r) => setFaqs(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit = (faq) => { setForm({ question: faq.question, answer: faq.answer, order: faq.order }); setModal(faq); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await client.post('/faq', form);
      else await client.put(`/faq/${modal.id}`, form);
      setModal(null);
      load();
    } catch { alert('Ошибка сохранения'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Удалить вопрос?')) return;
    try { await client.delete(`/faq/${id}`); load(); } catch { alert('Ошибка'); }
  };

  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>FAQ <span style={{ color: '#aaa', fontSize: 14, fontWeight: 400 }}>({faqs.length})</span></h2>
        <button onClick={openCreate} style={btn('#1a1a2e')}>+ Добавить</button>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Загрузка...</div>
          : faqs.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>Нет вопросов</div>
          : faqs.map((faq) => (
            <div key={faq.id} style={{ background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,.05)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888', flexShrink: 0 }}>{faq.order}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{faq.question}</div>
                <div style={{ fontSize: 13, color: '#888' }}>{faq.answer}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={() => openEdit(faq)} style={{ padding: '5px 12px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Изменить</button>
                <button onClick={() => remove(faq.id)} style={{ padding: '5px 12px', background: '#fee', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#f44336' }}>Удалить</button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Новый вопрос' : 'Редактировать вопрос'} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>Вопрос *</label>
            <input style={inp} value={form.question} onChange={f('question')} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>Ответ *</label>
            <textarea style={{ ...inp, minHeight: 100, resize: 'vertical' }} value={form.answer} onChange={f('answer')} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 5 }}>Порядок</label>
            <input type="number" style={{ ...inp, width: 100 }} value={form.order} onChange={f('order')} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} disabled={saving || !form.question || !form.answer} style={btn('#1a1a2e')}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
            <button onClick={() => setModal(null)} style={btn('#f0f0f0')}>Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

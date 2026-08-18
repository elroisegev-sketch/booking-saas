import { useEffect, useState } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app';
const gallerySrc = (item) => `/gallery-file/${item.id}`;

const card = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(161,23,56,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function GalleryAdminTab({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    fetch(`${BACKEND}/api/gallery`, { headers: { Authorization: 'Bearer ' + token } })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveOrder = async (nextItems) => {
    const token = localStorage.getItem('token');
    setItems(nextItems);
    await fetch(`${BACKEND}/api/gallery/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ ids: nextItems.map((x) => x.id) }),
    });
  };

  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    saveOrder(next);
    showToast('הסדר עודכן');
  };

  const remove = async (id) => {
    if (!confirm('למחוק את התמונה מהגלריה?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND}/api/gallery/${id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    });
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (preview && preview.id === id) setPreview(null);
    showToast('התמונה נמחקה');
  };

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      showToast('רק JPG או PNG');
      return;
    }
    if (file.size > 1_800_000) {
      showToast('התמונה גדולה מדי — עד 1.8MB');
      return;
    }
    setUploading(true);
    try {
      const image = await readFileAsDataUrl(file);
      const token = localStorage.getItem('token');
      const r = await fetch(`${BACKEND}/api/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ image }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'upload failed');
      setItems((prev) => [...prev, data]);
      showToast('התמונה עלתה ✅');
    } catch (err) {
      showToast(err.message || 'שגיאה בהעלאה');
    }
    setUploading(false);
  };

  return (
    <div className="admin-gallery-tab">
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
        >
          <img
            src={gallerySrc(preview)}
            alt={`תמונה ${preview.index}`}
            style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute', top: '1.5rem', left: '1.5rem',
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: '40px', height: '40px', color: 'white', fontSize: '1.2rem', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="admin-gallery-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: 0 }}>גלריה 📸</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '6px 0 0', lineHeight: 1.6 }}>
            כל התמונות שמופיעות ללקוחות — כאן מוסיפים, מסדרים ומוחקים. לחצי על תמונה לתצוגה גדולה.
          </p>
        </div>
        <label className="admin-gallery-upload-btn" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.1rem',
          borderRadius: '999px', background: uploading ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)',
          color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: uploading ? 'not-allowed' : 'pointer',
          flexShrink: 0,
        }}>
          {uploading ? 'מעלה...' : '+ תמונה חדשה'}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>

      {loading ? (
        <div style={{ ...card, padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>טוענת גלריה...</div>
      ) : items.length === 0 ? (
        <div style={{ ...card, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🖼️</div>
          <p style={{ fontWeight: 700, color: '#A11738', margin: '0 0 8px' }}>אין תמונות בגלריה</p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            העלי תמונות חדשות — הן יופיעו ללקוחות בדף הפתיחה.
          </p>
        </div>
      ) : (
        <>
          <p className="admin-gallery-count">{items.length} תמונות · מספר קטן = מופיעה קודם</p>
          <div className="admin-gallery-grid">
            {items.map((item, idx) => (
              <div key={item.id} className="admin-gallery-item" style={card}>
                <button
                  type="button"
                  className="gallery-thumb"
                  onClick={() => setPreview({ id: item.id, index: idx + 1 })}
                >
                  <img
                    src={gallerySrc(item)}
                    alt={`תמונה ${idx + 1}`}
                    loading="lazy"
                  />
                  <span className="gallery-badge">#{idx + 1}</span>
                </button>

                <div className="gallery-item-info">
                  <p className="gallery-item-title">תמונה {idx + 1}</p>
                  <p className="gallery-item-hint">ככל שמספר קטן יותר — מופיעה קודם בגלריה</p>
                  <button
                    type="button"
                    className="gallery-preview-link"
                    onClick={() => setPreview({ id: item.id, index: idx + 1 })}
                  >
                    🔍 תצוגה גדולה
                  </button>
                </div>

                <div className="gallery-item-actions">
                  <div className="gallery-order-btns">
                    <button
                      type="button"
                      className="gallery-order-btn"
                      disabled={idx === 0}
                      onClick={() => move(idx, -1)}
                      aria-label={`הזזי תמונה ${idx + 1} קדימה בגלריה`}
                    >
                      <span className="gallery-order-icon" aria-hidden="true">▲</span>
                      <span className="gallery-order-label">קודם</span>
                    </button>
                    <button
                      type="button"
                      className="gallery-order-btn"
                      disabled={idx === items.length - 1}
                      onClick={() => move(idx, 1)}
                      aria-label={`הזזי תמונה ${idx + 1} אחורה בגלריה`}
                    >
                      <span className="gallery-order-icon" aria-hidden="true">▼</span>
                      <span className="gallery-order-label">הבא</span>
                    </button>
                  </div>
                  <button type="button" className="gallery-delete-btn" onClick={() => remove(item.id)} aria-label={`מחקי תמונה ${idx + 1}`}>מחק</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

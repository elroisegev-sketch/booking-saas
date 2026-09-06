import { useEffect, useState } from 'react';
import { fetchCustomers } from '../../../lib/customersApi';
import CustomerFilters from './CustomerFilters';
import CustomerListItem from './CustomerListItem';
import CustomerProfileDrawer from './CustomerProfileDrawer';
import { cardStyle, fieldStyle } from './customerUtils';

export default function CustomersTab({ showToast, onBookCustomer, initialFilter = 'all' }) {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const load = () => {
    setLoading(true);
    setError('');
    fetchCustomers({ q: debouncedQ, filter })
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'שגיאה בטעינת הלקוחות');
        setRows([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [debouncedQ, filter]);

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: '0 0 1rem' }}>לקוחות</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="חיפוש לפי שם או טלפון"
        style={{ ...fieldStyle, marginBottom: '0.75rem' }}
      />
      <CustomerFilters value={filter} onChange={setFilter} />

      {loading && <p style={{ textAlign: 'center', padding: '2rem', color: '#A11738', fontWeight: 700 }}>טוען...</p>}
      {error && !loading && (
        <div style={{ ...cardStyle, padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#991b1b', fontWeight: 700 }}>{error}</p>
          <button type="button" onClick={load} style={{ marginTop: '10px', border: 'none', background: '#F7C1C3', color: '#A11738', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}>נסי שוב</button>
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div style={{ ...cardStyle, padding: '2.5rem 1.25rem', textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontWeight: 700, margin: 0 }}>אין לקוחות לתצוגה</p>
        </div>
      )}
      {!loading && !error && rows.map((c) => (
        <CustomerListItem key={c.id} customer={c} onClick={() => setOpenId(c.id)} />
      ))}

      {openId && (
        <CustomerProfileDrawer
          customerId={openId}
          showToast={showToast}
          onClose={() => setOpenId(null)}
          onBook={(customer) => {
            setOpenId(null);
            onBookCustomer(customer);
          }}
          onUpdated={() => load()}
        />
      )}
    </div>
  );
}

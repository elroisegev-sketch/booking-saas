export const SOURCE_OPTIONS = [
  { value: 'instagram', label: 'אינסטגרם' },
  { value: 'facebook_ads', label: 'מודעות פייסבוק' },
  { value: 'google', label: 'גוגל' },
  { value: 'referral', label: 'המלצה' },
  { value: 'organic', label: 'אורגני' },
  { value: 'other', label: 'אחר' },
];

export const FILTERS = [
  { id: 'all', label: 'כולן' },
  { id: 'new', label: 'חדשות' },
  { id: 'returning', label: 'חוזרות' },
  { id: 'regular', label: 'קבועות' },
  { id: 'rebook_due', label: 'צריכות לחזור' },
  { id: 'inactive', label: 'לא פעילות' },
  { id: 'vip', label: 'VIP' },
];

const STATUS_META = {
  new: { label: 'חדשה', bg: 'rgba(34,197,94,0.12)', color: '#15803d' },
  returning: { label: 'חוזרת', bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8' },
  regular: { label: 'קבועה', bg: 'rgba(161,23,56,0.10)', color: '#A11738' },
  rebook_due: { label: 'צריכה לחזור', bg: 'rgba(245,158,11,0.16)', color: '#b45309' },
  inactive: { label: 'לא פעילה', bg: 'rgba(107,114,128,0.14)', color: '#4b5563' },
};

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.new;
}

export function sourceLabel(value) {
  return SOURCE_OPTIONS.find((o) => o.value === value)?.label || '';
}

export function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^972/, '0');
  return /^0[2-9]\d{7,8}$/.test(digits);
}

export function waLink(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '').replace(/^972/, '0');
  const intl = '972' + digits.replace(/^0/, '');
  const url = `https://wa.me/${intl}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

export function fmtMoney(n) {
  return `₪${Math.round(parseFloat(n || 0)).toLocaleString('he-IL')}`;
}

export function fmtShortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
}

export function daysAgoLabel(days) {
  if (days == null) return '';
  if (days === 0) return 'היום';
  if (days === 1) return 'אתמול';
  return `לפני ${days} ימים`;
}

export function visitLabel(count) {
  if (count === 1) return 'ביקור אחד';
  return `${count} ביקורים`;
}

export const cardStyle = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(161,23,56,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
};

export const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.7rem 0.9rem',
  borderRadius: '12px',
  border: '1.5px solid rgba(247,193,195,0.55)',
  fontSize: '0.9rem',
  fontFamily: 'Varela Round, sans-serif',
  outline: 'none',
  background: 'rgba(255,255,255,0.85)',
  direction: 'rtl',
};

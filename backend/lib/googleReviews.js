// ביקורות גוגל למסך הבית.
// בלי מפתח API מוחזרת הרשימה השמורה. עם GOOGLE_PLACES_API_KEY השרת מושך
// כל כמה שעות את 5 הביקורות החדשות, ממזג אותן לרשימה הקיימת, ומעדכן ציון וכמות.

const FALLBACK_REVIEWS = [
  { name: 'Maayan Abay', when: 'היום', service: '', text: 'עבודה מקצועית פשוט מושלםםם', time: 0 },
  { name: 'inbal danino', when: 'היום', service: '', text: 'ליאור מדהימה מקצועית. מקום ממש נקי למי שחשוב לה, לי זה משמעותי.', time: 0 },
  { name: 'משפחת נמט', when: 'היום', service: '', text: 'ליאור עדינה וקשובה. עזרה מאוד לבת שלי לעבור את הטיפול שככ חששה ממנו.', time: 0 },
  { name: 'שירה כהן', when: 'לפני 4 חודשים', service: "לק ג'ל", text: 'ממש ממש ממליצה על ליאור. קודם כל את נכנסת וישר מרגישה בנח. ליאור פשוט חמודה ברמות, מלא סבלנות וחיוך, פשוט נותנת לך להרגיש בנח. עבודה מדהימה — עשיתי אצלה לק ג׳ל ונשאר לי יציב וחזק, עבודה נקייה ויפה. לא תתחרטו ולא ממומן.', time: 0 },
  { name: 'hagit danino', when: 'לפני 6 חודשים', service: 'ציפורניים וגבות', text: 'מקצועית מאוד, אסתטית, יצירתית. עושה אצלה גם ציפורניים וגם גבות. מאוד מרוצה מהתוצאות.', time: 0 },
  { name: 'Halel Danino', when: 'לפני 6 חודשים', service: 'מניקור', text: 'הייתי אצל הרבה מניקוריסטיות. כשהגעתי אליה הפכתי ללקוחה קבועה כבר קרוב לשנתיים. מאוד מקצועית, חד משמעית שווה את הכסף.', time: 0 },
  { name: 'נחמי פרידמן', when: 'לפני 4 חודשים', service: 'מניקור', text: 'ליאור המהממת! תמיד בחיוך, בנחת ובסבלנות. מקצוענית ודייקנית והעבודות שלה מושלמות ממש.', time: 0 },
  { name: 'יעלה נדם', when: 'לפני 6 חודשים', service: 'עיצוב גבות, הרמת ריסים', text: 'הקוסמטיקאית הכי מקצועית וחמה שאני מכירה. מדהימה ומוכשרת.', time: 0 },
  { name: 'תאיר נתן', when: 'לפני 6 חודשים', service: 'הרמת ריסים, מניקור', text: 'מקצועית ברמות. עבודה מהממת ויסודית.', time: 0 },
  { name: 'Gabriella Green', when: 'לפני 4 חודשים', service: '', text: 'נעימה, אסתטית ותוצאות מהממות.', time: 0 },
];

const FALLBACK = {
  rating: '5.0',
  reviewCount: FALLBACK_REVIEWS.length,
  reviews: FALLBACK_REVIEWS,
};

const PLACE_QUERY = 'ליאור שגב היופי שלך גבעת שמואל';
const PLACE_BIAS = 'circle:1500@32.074775,34.845265';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

let memoryPlaceId = process.env.GOOGLE_PLACE_ID || '';
let timer = null;

function reviewKey(review) {
  return String(review.name || '').trim().toLowerCase();
}

function formatRating(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return FALLBACK.rating;
  return num.toFixed(1);
}

function publicReview(review) {
  return {
    name: review.name,
    when: review.when || '',
    service: review.service || '',
    text: review.text,
  };
}

function mergeReviews(existing, incoming) {
  const order = new Map();
  const byName = new Map();
  (existing || []).forEach((review, index) => {
    const key = reviewKey(review);
    if (!key || !review.text) return;
    order.set(key, index);
    byName.set(key, { ...review, time: Number(review.time) || 0 });
  });

  for (const review of incoming || []) {
    const key = reviewKey(review);
    const text = String(review.text || '').trim();
    if (!key || !text) continue;
    const prev = byName.get(key);
    if (prev) {
      byName.set(key, {
        ...prev,
        when: review.when || prev.when,
        time: Number(review.time) || prev.time || 0,
      });
    } else {
      order.set(key, order.size + 1000);
      byName.set(key, {
        name: review.name.trim(),
        when: review.when || '',
        service: review.service || '',
        text,
        time: Number(review.time) || 0,
      });
    }
  }

  return [...byName.values()].sort((a, b) => {
    const ta = Number(a.time) || 0;
    const tb = Number(b.time) || 0;
    if (ta !== tb) return tb - ta;
    return (order.get(reviewKey(a)) ?? 0) - (order.get(reviewKey(b)) ?? 0);
  });
}

function syncIntervalMs() {
  const n = parseInt(process.env.GOOGLE_REVIEWS_SYNC_MS, 10);
  if (!Number.isFinite(n) || n < 60 * 60 * 1000) return SIX_HOURS_MS;
  return n;
}

async function ensureTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS google_reviews_cache (
      id INT PRIMARY KEY,
      rating TEXT NOT NULL,
      review_count INT NOT NULL,
      reviews JSONB NOT NULL,
      synced_at TIMESTAMPTZ,
      place_id TEXT
    )
  `);
}

function rowToPayload(row) {
  const reviews = Array.isArray(row.reviews) ? row.reviews : [];
  return {
    rating: row.rating || FALLBACK.rating,
    reviewCount: Number(row.review_count) || reviews.length,
    reviews,
    syncedAt: row.synced_at || null,
    placeId: row.place_id || '',
  };
}

async function readCache(db) {
  const { rows } = await db.query(
    'SELECT rating, review_count, reviews, synced_at, place_id FROM google_reviews_cache WHERE id = 1'
  );
  if (!rows[0]) return null;
  return rowToPayload(rows[0]);
}

async function writeCache(db, payload) {
  await db.query(
    `INSERT INTO google_reviews_cache (id, rating, review_count, reviews, synced_at, place_id)
     VALUES (1, $1, $2, $3::jsonb, NOW(), $4)
     ON CONFLICT (id) DO UPDATE SET
       rating = EXCLUDED.rating,
       review_count = EXCLUDED.review_count,
       reviews = EXCLUDED.reviews,
       synced_at = NOW(),
       place_id = COALESCE(EXCLUDED.place_id, google_reviews_cache.place_id)`,
    [payload.rating, payload.reviewCount, JSON.stringify(payload.reviews), payload.placeId || null]
  );
}

async function resolvePlaceId(apiKey, db) {
  if (memoryPlaceId) return memoryPlaceId;
  if (db) {
    const cached = await readCache(db);
    if (cached && cached.placeId) {
      memoryPlaceId = cached.placeId;
      return memoryPlaceId;
    }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', PLACE_QUERY);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id,name');
  url.searchParams.set('language', 'iw');
  url.searchParams.set('locationbias', PLACE_BIAS);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== 'OK' || !data.candidates || !data.candidates[0]) {
    throw new Error(`find place failed: ${data.status || response.status} ${data.error_message || ''}`.trim());
  }
  const candidate = data.candidates[0];
  if (!/שגב|היופי|lior/i.test(candidate.name || '')) {
    throw new Error(`unexpected place: ${candidate.name || 'unknown'}`);
  }
  memoryPlaceId = candidate.place_id;
  return memoryPlaceId;
}

async function fetchNewestFromGoogle(apiKey, placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews');
  url.searchParams.set('reviews_sort', 'newest');
  url.searchParams.set('reviews_no_translations', 'true');
  url.searchParams.set('language', 'iw');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json();
  if (data.status !== 'OK' || !data.result) {
    throw new Error(`place details failed: ${data.status || response.status} ${data.error_message || ''}`.trim());
  }
  if (!/שגב|היופי|lior/i.test(data.result.name || '')) {
    throw new Error(`unexpected place: ${data.result.name || 'unknown'}`);
  }

  const incoming = (data.result.reviews || []).map((review) => ({
    name: review.author_name,
    when: review.relative_time_description || '',
    service: '',
    text: review.text || '',
    time: review.time || 0,
  }));

  return {
    rating: formatRating(data.result.rating),
    reviewCount: Number(data.result.user_ratings_total) || 0,
    reviews: incoming,
  };
}

async function syncGoogleReviews(db) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return { skipped: true };

  await ensureTable(db);
  const placeId = await resolvePlaceId(apiKey, db);
  const remote = await fetchNewestFromGoogle(apiKey, placeId);
  const current = (await readCache(db)) || FALLBACK;
  const reviews = mergeReviews(current.reviews, remote.reviews);
  const payload = {
    rating: remote.rating,
    reviewCount: remote.reviewCount || reviews.length,
    reviews,
    placeId,
  };
  await writeCache(db, payload);
  console.log(`★ Google reviews synced: ${payload.reviewCount} total, ${reviews.length} on site`);
  return payload;
}

async function getPublicReviews(db) {
  try {
    await ensureTable(db);
    const cached = await readCache(db);
    if (cached && cached.reviews.length) return cached;
  } catch (err) {
    console.error('google reviews cache read:', err.message);
  }
  return { ...FALLBACK, syncedAt: null };
}

function toPublicPayload(data) {
  return {
    rating: data.rating || FALLBACK.rating,
    reviewCount: data.reviewCount || FALLBACK.reviewCount,
    reviews: (data.reviews || FALLBACK.reviews).map(publicReview),
  };
}

function startReviewsWorker(db) {
  if (timer) return timer;
  const ms = syncIntervalMs();
  let loggedSkip = false;

  const tick = async () => {
    try {
      const result = await syncGoogleReviews(db);
      if (result && result.skipped && !loggedSkip) {
        loggedSkip = true;
        console.log('★ Google reviews sync skipped (set GOOGLE_PLACES_API_KEY to enable)');
      }
    } catch (err) {
      console.error('google reviews sync:', err.message);
    }
  };

  timer = setInterval(tick, ms);
  if (typeof timer.unref === 'function') timer.unref();
  console.log(`★ Google reviews worker started (interval=${ms}ms)`);
  tick();
  return timer;
}

function stopReviewsWorker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  FALLBACK,
  mergeReviews,
  formatRating,
  getPublicReviews,
  toPublicPayload,
  syncGoogleReviews,
  startReviewsWorker,
  stopReviewsWorker,
};

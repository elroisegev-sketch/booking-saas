const LEGACY_GALLERY_PATHS = require('./legacyGalleryPaths');

function mimeFromPath(path) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function assetUrl(base, path) {
  return base.replace(/\/$/, '') + encodeURI(path);
}

async function seedLegacyGalleryIfNeeded(db) {
  const frontend = process.env.FRONTEND_URL || 'https://www.lioryourbeauty.com';
  const slug = 'lior-segev';

  await db.query(
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS gallery_legacy_seeded BOOLEAN DEFAULT false'
  ).catch(() => {});

  const biz = await db.query(
    'SELECT id, COALESCE(gallery_legacy_seeded, false) AS gallery_legacy_seeded FROM users WHERE slug=$1',
    [slug]
  );
  if (!biz.rows.length) return;

  const { id: businessId, gallery_legacy_seeded: alreadySeeded } = biz.rows[0];
  if (alreadySeeded) return;

  const count = await db.query(
    'SELECT COUNT(*)::int AS n FROM gallery_images WHERE business_id=$1',
    [businessId]
  );
  if (count.rows[0].n > 0) {
    await db.query('UPDATE users SET gallery_legacy_seeded=true WHERE id=$1', [businessId]);
    return;
  }

  console.log('📸 Importing legacy gallery into database…');
  let imported = 0;

  for (let i = 0; i < LEGACY_GALLERY_PATHS.length; i++) {
    const path = LEGACY_GALLERY_PATHS[i];
    try {
      const res = await fetch(assetUrl(frontend, path));
      if (!res.ok) {
        console.warn(`gallery seed skip ${path}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) continue;
      const mime = (res.headers.get('content-type') || '').split(';')[0] || mimeFromPath(path);
      await db.query(
        'INSERT INTO gallery_images (business_id, sort_order, mime, data) VALUES ($1,$2,$3,$4)',
        [businessId, i, mime, buf]
      );
      imported++;
    } catch (err) {
      console.warn(`gallery seed error ${path}:`, err.message);
    }
  }

  await db.query('UPDATE users SET gallery_legacy_seeded=true WHERE id=$1', [businessId]);
  console.log(`✅ Legacy gallery import done (${imported}/${LEGACY_GALLERY_PATHS.length} images)`);
}

module.exports = { seedLegacyGalleryIfNeeded };

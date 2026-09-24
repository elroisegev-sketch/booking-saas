const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { mergeReviews, formatRating } = require('../lib/googleReviews');

const saved = [
  { name: 'ישנה', when: 'לפני חודש', service: 'מניקור', text: 'טקסט ערוך', time: 0 },
  { name: 'עוד אחת', when: 'לפני חודשיים', service: '', text: 'נשאר', time: 0 },
];

describe('mergeReviews', () => {
  it('adds a new review and keeps older ones that Google did not return', () => {
    const merged = mergeReviews(saved, [
      { name: 'חדשה', when: 'לפני שעה', text: 'וואו', time: 200 },
      { name: 'ישנה', when: 'לפני 5 שבועות', text: 'טקסט גולמי מגוגל', time: 100 },
    ]);
    assert.deepEqual(merged.map((review) => review.name), ['חדשה', 'ישנה', 'עוד אחת']);
    assert.equal(merged[1].text, 'טקסט ערוך');
    assert.equal(merged[1].service, 'מניקור');
    assert.equal(merged[1].when, 'לפני 5 שבועות');
  });

  it('ignores reviews without text', () => {
    const merged = mergeReviews(saved, [{ name: 'ריקה', when: 'היום', text: '   ', time: 300 }]);
    assert.equal(merged.some((review) => review.name === 'ריקה'), false);
  });
});

describe('formatRating', () => {
  it('shows one decimal', () => {
    assert.equal(formatRating(5), '5.0');
    assert.equal(formatRating(4.83), '4.8');
    assert.equal(formatRating(null), '5.0');
  });
});

import React from 'react';

/**
 * Stars - renders a 0-5 star rating using filled / half / empty stars.
 *
 * Props:
 *   rating - number 0..5
 *   count  - optional number of ratings to show next to the stars
 *   size   - optional font-size in px (default 20)
 */
function Stars({ rating = 0, count, size = 20 }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push('full');
    else if (value >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }

  const symbol = { full: '★', half: '⯨', empty: '☆' };

  return (
    <span className="stars" style={{ fontSize: `${size}px` }} title={`${value.toFixed(1)} / 5`}>
      {stars.map((s, idx) => (
        <span key={idx} className={`star star-${s}`} style={{ color: s === 'empty' ? '#d0d0d0' : '#f5b301' }}>
          {s === 'half' ? '★' : symbol[s]}
        </span>
      ))}
      <span className="stars-value" style={{ marginLeft: 8, fontSize: size * 0.7, color: '#666', fontWeight: 600 }}>
        {value.toFixed(1)}
        {count !== undefined && count !== null && (
          <span style={{ fontWeight: 400 }}> ({count} {count === 1 ? 'rating' : 'ratings'})</span>
        )}
      </span>
    </span>
  );
}

export default Stars;

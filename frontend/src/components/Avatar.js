import React, { useState } from 'react';
import '../styles/Avatar.css';

// Avatar - shows a user's profile photo, falling back to a colored initials
// circle if there is no photo or the image fails to load (e.g. offline).
function Avatar({ src, name, size = 48 }) {
  const [failed, setFailed] = useState(false);

  const initials = (name || 'U')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic accent color from the name so each user looks distinct.
  const palette = ['#6D5FA6', '#A06A8C', '#5572A0', '#A0824F', '#4F938C', '#A06B4F'];
  const idx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  const bg = palette[idx];

  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (src && !failed) {
    return (
      <img
        className="avatar avatar-img"
        src={src}
        alt={name || 'User'}
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="avatar avatar-initials" style={{ ...style, background: bg }} aria-label={name}>
      {initials}
    </span>
  );
}

export default Avatar;

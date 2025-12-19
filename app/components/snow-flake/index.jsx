'use client';

import { useEffect, useMemo } from 'react';

export default function SnowFlake({
  enabled = true,
  intervalMs = 250,
  zIndex = 9999,
}) {
  const snowflakeChars = useMemo(() => ['❄', '❅', '❆', '✳', '✴', '✵'], []);

  useEffect(() => {
    if (!enabled) return;

    const container = document.getElementById('snowflakes-container');
    if (!container) return;

    const createSnowflake = () => {
      const flake = document.createElement('div');
      flake.className = 'snowflake';

      const inner = document.createElement('i');
      inner.className = 'snowflake-inner';
      inner.textContent =
        snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
      inner.style.fontStyle = 'normal';

      // позиція з запасом, щоб sway не різало
      flake.style.left = Math.random() * 96 + 2 + 'vw';

      // розмір
      inner.style.fontSize = Math.random() * 8 + 10 + 'px'

      // тривалості
      const fallDuration = Math.random() * 12 + 14; // 14–26s
      const swayDuration = Math.random() * 4 + 5; // 5–9s

      flake.style.setProperty('--fall-duration', `${fallDuration}s`);
      inner.style.setProperty('--sway-duration', `${swayDuration}s`);

      // старт / кінець падіння (через transform)
      flake.style.setProperty(
        '--start-y',
        `-${Math.random() * 20 + 10}vh`
      );
      flake.style.setProperty(
        '--end-y',
        `${Math.random() * 60 + 100}vh`
      );

      inner.style.setProperty(
        '--sway-amp',
        `${Math.random() * 14 + 12}px`
      );

      flake.appendChild(inner);
      container.appendChild(flake);

      const lifetimeMs = Math.ceil((fallDuration + 2) * 1000);
      window.setTimeout(() => flake.remove(), lifetimeMs);
    };

    const interval = window.setInterval(createSnowflake, intervalMs);
    return () => window.clearInterval(interval);
  }, [enabled, intervalMs, snowflakeChars]);

  return (
    <div
      id="snowflakes-container"
      className="pointer-events-none fixed inset-0 h-full w-full overflow-visible"
      style={{ zIndex }}
      aria-hidden="true"
    />
  );
}

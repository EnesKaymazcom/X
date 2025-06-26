'use client';

import React, { useEffect, useState } from 'react';

const NoiseTexture = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* SVG filter definition */}
      <svg
        className="fixed w-0 h-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
        </defs>
      </svg>

      {/* Noise overlay - motion.dev style */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'a\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.5\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23a)\' opacity=\'0.3\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
          filter: 'contrast(150%) brightness(150%)',
          opacity: 0.25,
          mixBlendMode: 'normal',
        }}
      />
    </>
  );
};

export default NoiseTexture;

'use client';

import React, { useEffect, useState } from 'react';

const Background = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Ana arkaplan - koyu siyah */}
      <div className="fixed inset-0 -z-20 bg-base-100 overflow-hidden"></div>

      {/* Gradient blobs - motion.dev sitesindeki gibi */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute top-0 -left-40 w-[800px] h-[800px] bg-primary/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob-slow"></div>
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-secondary/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob-slow animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-accent/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob-slow animation-delay-4000"></div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-base-100/80 to-base-100"></div>
      </div>
    </>
  );
};

export default Background;

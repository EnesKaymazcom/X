'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[700px] mb-16 overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="text-primary">Premium</span> Dijital Ürünler
            </h1>
            <div className="h-1 w-24 bg-primary my-6 mx-auto lg:mx-0"></div>
            <p className="py-6 text-base-content/80 text-xl leading-relaxed">
              NesDesign ile profesyonel web şablonları ve dijital ürünlerle online varlığınızı güçlendirin. Sürükle-bırak, kodsuz, kolay düzenlenebilir şablonlar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/products" className="btn btn-primary btn-lg">
                Alışverişe Başla
              </Link>
              <Link href="/categories" className="btn btn-outline btn-lg hover:bg-base-300">
                Koleksiyonları Keşfet
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-lg">
            <div className="relative">
              <Image
                src="https://framerusercontent.com/images/qCqn8hnWqJQo3VrXgTiPVZdbc.jpg"
                alt="Premium Web Templates"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl object-cover w-full h-[400px] border border-base-300"
                priority
              />
              <div className="absolute -bottom-4 -right-4 bg-base-200 p-4 rounded-lg shadow-lg border border-base-300">
                <div className="badge badge-primary">Yeni</div>
                <p className="font-semibold mt-1">Premium Dijital Ürünler</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

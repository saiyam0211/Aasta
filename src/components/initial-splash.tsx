'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function InitialSplash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('aasta_splash_v1');
      if (!seen) {
        setShow(true);
        // Ensure splash is visible for 3000ms for perceived smoothness
        const t = setTimeout(() => {
          setShow(false);
          sessionStorage.setItem('aasta_splash_v1', '1');
        }, 3000);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#002a01' }}
    >
      <div className="w-[260px] h-[260px]">
        <Lottie animationData={require('../../public/lotties/aasta.json')} loop autoplay />
      </div>
    </div>
  );
}



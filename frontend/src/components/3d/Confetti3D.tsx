import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const Confetti3D: React.FC = () => {
  useEffect(() => {
    // Multi-stage confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#00f0ff', '#7000ff']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ff007f', '#f59e0b']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#10b981', '#00f0ff']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#ffffff', '#7000ff']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#00f0ff', '#ff007f']
    });
  }, []);

  return null;
};

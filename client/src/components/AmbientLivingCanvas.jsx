import React, { useEffect, useRef } from 'react';

/**
 * AmbientLivingCanvas: Renders floating organic sunset wine, raspberry, and apricot light meshes
 * and 3D micro-particles to give the workspace physical immersion.
 */
export default function AmbientLivingCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Sunset Palette Orbs: #FFBB94, #FB9590, #DC586D, #852E4E
    const orbs = [
      { x: width * 0.15, y: height * 0.2, radius: 320, color: 'rgba(255, 187, 148, 0.05)', vx: 0.18, vy: 0.15 },
      { x: width * 0.85, y: height * 0.3, radius: 380, color: 'rgba(220, 88, 109, 0.045)', vx: -0.15, vy: 0.18 },
      { x: width * 0.45, y: height * 0.85, radius: 350, color: 'rgba(133, 46, 78, 0.04)', vx: 0.12, vy: -0.16 },
      { x: width * 0.7, y: height * 0.7, radius: 280, color: 'rgba(251, 149, 144, 0.04)', vx: -0.14, vy: -0.12 }
    ];

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 1.6 + 0.4,
      radius: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      color: ['#FFBB94', '#FB9590', '#DC586D'][Math.floor(Math.random() * 3)],
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25 - 0.08
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      const mouseParallaxX = (mouseX - width / 2) * 0.04;
      const mouseParallaxY = (mouseY - height / 2) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing sunset light orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < -100 || orb.x > width + 100) orb.vx *= -1;
        if (orb.y < -100 || orb.y > height + 100) orb.vy *= -1;

        const posX = orb.x + mouseParallaxX * 0.6;
        const posY = orb.y + mouseParallaxY * 0.6;

        const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, orb.radius);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(19, 10, 17, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(posX, posY, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw 3D micro-particles
      particles.forEach((p) => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const px = p.x + mouseParallaxX * p.z;
        const py = p.y + mouseParallaxY * p.z;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.8 + Math.sin(time + p.x) * 0.2);
        ctx.beginPath();
        ctx.arc(px, py, p.radius * p.z, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.98
      }}
    />
  );
}

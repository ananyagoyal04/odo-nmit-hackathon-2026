import React, { useState, useEffect, useRef } from 'react';

const WORKSPACE_SPACES = [
  {
    id: 1,
    title: 'Private Office',
    subtitle: 'Dedicated executive & focus suites',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    tag: 'Executive Focus'
  },
  {
    id: 2,
    title: 'Open Desks',
    subtitle: 'Collaborative high-speed hot desks',
    image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=600&auto=format&fit=crop&q=80',
    tag: 'Community Hub'
  },
  {
    id: 3,
    title: 'Meeting Rooms',
    subtitle: 'Equipped with 4K conference audio/video',
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=600&auto=format&fit=crop&q=80',
    tag: 'Collaboration'
  },
  {
    id: 4,
    title: 'Virtual Office',
    subtitle: 'Premium business address & mail handling',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop&q=80',
    tag: 'Digital Presence'
  },
  {
    id: 5,
    title: 'Innovation Lounge',
    subtitle: 'Casual breakout pods & artisan coffee bar',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    tag: 'Creative Energy'
  },
  {
    id: 6,
    title: 'Auditorium Hall',
    subtitle: 'Townhall presentations & all-hands sessions',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80',
    tag: 'All-Hands'
  }
];

export default function RevolvingFrames3D() {
  const [rotation, setRotation] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startRotation = useRef(0);

  // Smooth continuous rotation in background
  useEffect(() => {
    let animId;
    const animate = () => {
      if (!isDragging.current) {
        setRotation((prev) => (prev + 0.18) % 360);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Mouse gyro movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 12;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const totalCards = WORKSPACE_SPACES.length;
  const radius = 340; // Cylinder radius in 3D space

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        perspective: '1500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.28
      }}
    >
      {/* 3D Rotating Carousel Cylinder */}
      <div
        style={{
          width: '320px',
          height: '240px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-5 - mouseOffset.y * 0.4}deg) rotateY(${rotation + mouseOffset.x * 0.6}deg)`
        }}
      >
        {WORKSPACE_SPACES.map((space, index) => {
          const angle = (index * (360 / totalCards));
          return (
            <div
              key={space.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '320px',
                height: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(224, 159, 103, 0.4)',
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                backgroundColor: 'rgba(25, 20, 18, 0.95)',
                backfaceVisibility: 'visible',
                transition: 'border-color 0.3s ease'
              }}
            >
              <img
                src={space.image}
                alt={space.title}
                style={{
                  width: '100%',
                  height: '140px',
                  objectFit: 'cover',
                  filter: 'brightness(0.85) contrast(1.1)'
                }}
              />
              <div style={{ padding: '0.65rem 0.9rem', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--copper)' }}>
                    {space.title}
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--copper-subtle)',
                      color: 'var(--copper)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      border: '1px solid var(--border-copper)'
                    }}
                  >
                    {space.tag}
                  </span>
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                  {space.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

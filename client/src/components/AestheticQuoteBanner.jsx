import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';

const AESTHETIC_QUOTES = [
  {
    quote: "Simplicity is prerequisite for reliability. Build with intention and precision.",
    author: "Edsger W. Dijkstra",
    role: "Computer Scientist & Pioneer"
  },
  {
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
    role: "Apple Co-Founder"
  },
  {
    quote: "Great companies are built on exceptional culture, atomic execution, and deep care for craft.",
    author: "Satya Nadella",
    role: "Microsoft CEO"
  },
  {
    quote: "The details are not the details. They make the design.",
    author: "Charles Eames",
    role: "Iconic Industrial Designer"
  },
  {
    quote: "Focus on being productive instead of busy. Elegance is achieved when there is nothing left to take away.",
    author: "Tim Ferriss",
    role: "Author & Technologist"
  }
];

export default function AestheticQuoteBanner() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AESTHETIC_QUOTES.length);
        setFade(true);
      }, 300);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % AESTHETIC_QUOTES.length);
      setFade(true);
    }, 200);
  };

  const current = AESTHETIC_QUOTES[index];

  return (
    <div
      className="card"
      style={{
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(76, 29, 61, 0.4), rgba(39, 22, 36, 0.7), rgba(24, 14, 22, 0.95))',
        border: '1px solid var(--border-copper)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem 1.75rem',
        boxShadow: 'var(--shadow-pill)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--coral), var(--rose))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px var(--rose-glow)'
            }}
          >
            <Quote size={18} />
          </div>

          <div style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.25s ease' }}>
            <p style={{ color: 'var(--text-main)', fontSize: '0.975rem', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.4 }}>
              &ldquo;{current.quote}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--peach)' }}>
                {current.author}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                · {current.role}
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={handleNext}
          title="Next Inspirational Quote"
          style={{ borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem' }}
        >
          <RefreshCw size={13} /> Next Quote
        </button>
      </div>
    </div>
  );
}

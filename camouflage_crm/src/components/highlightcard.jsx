import React, { useEffect, useState } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/highlightcard.css';

const HighlightsSection = () => {
  const [highlights, setHighlights] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const visibleCount = 4;

  useEffect(() => {
    fetch(`${baseURL}/api/highlights`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setHighlights(data))
      .catch(err => console.error("Highlights fetch failed:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setStartIndex(prev => (prev + visibleCount) % highlights.length);
        setFlip(false);
      }, 1000); // should match the transition duration
    }, 10000);

    return () => clearInterval(interval);
  }, [highlights]);

  if (!highlights.length) return <div className="highlight-card loading">Loading highlights...</div>;

  const visibleCards = highlights.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="highlight-flip-container">
      {visibleCards.map((card, index) => (
        <article
          className={`highlight-card ${flip ? 'flip' : ''} card-${index}`}
          key={index}
        >
          <div className="overlay"></div>
          <img src={`${baseURL}/${card.image}`} alt={card.title} className="highlight-image" />
          <div className="highlight-info">
            <h4>{card.title}</h4>
            <p>{card.description}</p>
            <span className="highlight-price">{card.price}</span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default HighlightsSection;

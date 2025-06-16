import React, { useState, useEffect,  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/hero.css';

const HeroSection = ({
  imageSources = [],
  videoSources = [],
  isVideoMode = false,
  title = '',
  subtitle = '',
  buttons = [],
  showChat = false,
  rotateInterval = 15000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentMedia = isVideoMode ? videoSources[currentIndex] : imageSources[currentIndex];
  const navigate = useNavigate();

  // effect to change the video background in the hero
  useEffect(() => {
    if ((isVideoMode && videoSources.length > 1) || (!isVideoMode && imageSources.length > 1)) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % (isVideoMode ? videoSources.length : imageSources.length));
      }, rotateInterval);

      return () => clearInterval(interval);
    }
  }, [isVideoMode, videoSources.length, imageSources.length, rotateInterval]);

    
//  event handler for button clicks in the hero section
  const handleButtonClick = (id) => {
    if (id === 'newslette-btnr') {
      navigate('/contact#newsletter-focus');
    }
    if (id === 'booking-btn') {
      navigate('/packages');
      // Handle booking logic or navigation
    }
      if (id === 'explore-destinations-btn') {
      navigate('/destinations', {
      state: { scrollToGallery: true } })

      }
  };
  



// handle livechat using whatsApp
const openWhatsApp = () => {
  const phoneNumber = '254737721239';
  const message = '';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

  return (
    <section className="hero-section">
      {isVideoMode ? (
        <video
          className="hero-video"
          autoPlay
          muted
          playsInline
          key={currentMedia}
        >
          <source src={currentMedia} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          className="hero-video"
          src={currentMedia}
          alt={title}
        />
      )}

      <div className="hero-overlay" />
      <div className="hero-content">
        <h2 className='title'>{title}</h2>
        <p className='hero-subtitle'>{subtitle}</p>
        <div className="cta">
          {buttons.map((btn) => (
            <button key={btn.id} onClick={() => handleButtonClick(btn.id)}>
              {btn.text}
            </button>
          ))}
      {showChat && (
        <div className="live-chat" onClick={openWhatsApp}>
           Chat On WhatsApp
        </div>
      )}  
            </div>
      </div>
    </section>
  );
};

export default HeroSection;

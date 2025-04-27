// Packages.js
import React, { useState, useEffect, useRef } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/packages.css';
import NewsletterSignup from './newsletter';
import BookingForm from './booking';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const bookingFormRef = useRef();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${baseURL}/api/packages`);
        const data = await res.json();
        setPackages(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPackages();
  }, []);

  const handleToggleTimeline = async (pkg) => {
    if (!showTimeline || selectedPackage?._id !== pkg._id) {
      try {
        const res = await fetch(`${baseURL}/api/packages/${pkg._id}`);
        const data = await res.json();
        setTimelineData(data.itinerary || []);
        setSelectedPackage(pkg);
        setShowTimeline(true);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
      }
    } else {
      setShowTimeline(false);
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    bookingFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="packages-page">
      <section className="packages-carousel-section">
        <div className="carousel-background">
          <img src="media/images/packageshero.jpg" alt="blurred backdrop" className="blurred-bg" />
        </div>

        <div className="carousel-wrapper">
          <button className="carousel-nav left">&lt;</button>
          <div className="carousel-track">
            {packages.slice(0, 5).map((pkg) => (
              <article className="carousel-card" key={pkg._id}>
                <div className="card-image">
                  <img src={`${baseURL}/${pkg.image}`} alt={pkg.name} />
                  <div className="image-overlay" />
                </div>
                <div className="card-info">
                  <h2>{pkg.name}</h2>
                  <p className="description">{pkg.description}</p>
                  <button className="booking-btn" onClick={() => handleSelectPackage(pkg)}>Book Now</button>
                  <button className="card-details-btn" onClick={() => handleToggleTimeline(pkg)}>&#8744;</button>
                </div>
              </article>
            ))}
          </div>
          <button className="carousel-nav right">&gt;</button>
        </div>
      </section>

      {showTimeline && selectedPackage && (
        <section className="tour-timeline">
          <div className="timeline-header">
            <h2 className="timeline-title">
              {selectedPackage.name} <span className="discount-tag">20% OFF</span>
            </h2>
          </div>
          <div className="tour-features-row">
            <div className="feature-icon"><i className="fas fa-utensils"></i> All meals</div>
            <div className="feature-icon"><i className="fas fa-hotel"></i> Accommodation</div>
            <div className="feature-icon"><i className="fas fa-bus-alt"></i> Transport</div>
            <div className="feature-icon"><i className="fas fa-ticket-alt"></i> Entry Tickets</div>
            <div className="feature-icon"><i className="fas fa-user-shield"></i> Travel Insurance</div>
          </div>

          {timelineData.map((day, idx) => (
            <div className="timeline-entry" key={idx}>
              <div className="timeline-left">
                <div className="day-label">Day {idx + 1}</div>
                <div className="timeline-line"><span className="line-marker" /></div>
              </div>
              <div className="timeline-right">
                <h4 className="entry-title">{day.title}</h4>
                <p className="entry-description">{day.description}</p>
              </div>
              <img src={`${baseURL}/${day.image}`} alt={`Day ${idx + 1}`} className="timeline-image" />
            </div>
          ))}
        </section>
      )}

      <div ref={bookingFormRef}>
        <BookingForm selectedPackage={selectedPackage} />
      </div>

      <section className="about-footer-cta">
        <div className="footer-grid">
          <div className="footer-section latest-news">
            <h6>Latest News</h6>
            <ul>
              <li>🌍 Top 10 Destinations for 2025</li>
              <li>🏕️ Travel Gear You Must Have</li>
              <li>✈️ How to Plan Efficient Travel</li>
            </ul>
          </div>
          <div className="footer-section contact-info">
            <h5>Contact Info</h5>
            <p><i className="fa-solid fa-map-pin"></i> Nairobi, Kenya</p>
            <p><i className="fa-solid fa-envelope"></i> info@camouflagetours.com</p>
            <p><i className="fa-solid fa-phone"></i> +254-890-0055</p>
          </div>
          <NewsletterSignup />
          <div className="footer-section footer-tags">
            <h5>Popular Tags</h5>
            <div className="tag-list">
              {["Adventure", "Hiking", "Beach", "Cultural", "Luxury", "Safari"].map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Packages;

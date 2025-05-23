import React from 'react';
import '../assets/css/destinationdetails.css';
import { baseURL } from '../utils/config';

const DestinationDetails = ({ destination, onClose }) => {
  // DEFENSIVE CHECK
  if (!destination) return <p>Loading destination details...</p>;
  // EXTRACT FIELDS FROM DESTINATION
const {
  name,
  description,
  image,
  
  details = {}
} = destination;

const {
  duration,
  startingPrice,
  related = [],
  highlights = [],
  parkdetails = [],
} = details;


  return (
    <div className="destination-details-container">
      {/* ========== BANNER SECTION ========== */}
      <div className="destination-banner">
        <img src={`${baseURL}/${image}`} alt={name} />
      </div>

      {/* ========== MAIN INFO SECTION ========== */}
      <section className="main-info">
        <div className="title-block">
          <h1>{name}</h1>
          <p>{description || "No description available."}</p>
        </div>

        {duration && (
          <div className="destination-duration">
            <h3>Recommended Duration</h3>
            <p>{duration}</p>
          </div>
        )}

        {startingPrice && (
          <div className="price-block">
            <h3>Starting price</h3>
            <h2>${startingPrice}</h2>
          </div>
        )}
      </section>

     {/* ========== PARK DETAILS ========== */}
{parkdetails && Object.keys(parkdetails).length > 0 && (
  <section className="destination-info-section">
    <h2>Park Details</h2>
    <ul className="info-list">
      {Object.entries(parkdetails).map(([title, description], idx) => (
        <li key={idx}>
          <strong>{title}:</strong> {description}
        </li>
      ))}
    </ul>
  </section>
)}


      {/* ========== RELATED LOCATIONS ========== */}
      {related.length > 0 && (
        <section className="related-locations">
          <h3>Related Destinations</h3>
          <div className="related-cards">
            {related.map((place, idx) => (
              <div className="related-card" key={idx}>
                <img src={`${baseURL}/${image}`} alt={name} />

                <p>{place.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========== HIGHLIGHTS SECTION ========== */}
      {highlights.length > 0 && (
        <section className="destination-highlights">
          <h3>Highlights</h3>
          <div className="destination-highlight-list">
            {highlights.map((item, index) => (
              <div className="destination-highlight-card" key={index}>
        <img src={`${baseURL}/${image}`} alt={name} />
                <div className="destination-highlight-text">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      <div className="destination-close-btn">
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DestinationDetails;

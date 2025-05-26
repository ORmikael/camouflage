// ===============================
// USER TOUR CAROUSEL COMPONENT
// ===============================

import React from 'react';
import '../../assets/css/userprofile/usertourcarousel.css';

const UserTourCarousel = ({ highlights = [] }) => {
  if (!Array.isArray(highlights)) {
    console.error("Highlights is not an array:", highlights);
    return <div>No highlights available.</div>;
  }

  return (
    <div className="main-carousel-wrapper">
      <h4>Your Safari Highlights</h4>
      <div className="carousel-wrapper">
        {highlights.map((tour) => (
          <div className="profile-carousel-card" key={tour.id}>
            <img
              className="profile-carousel-card-img"
              src={tour.image}
              alt={tour.name}
            />
            <div className="tour-name">{tour.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserTourCarousel;

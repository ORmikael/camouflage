import "../assets/css/home.css";
import "../assets/css/colors.css";

import React, { useRef } from "react";

import HeroSection from "./hero";
import HighlightCard from "./highlightcard";
import Reviews from "./reviews";
import TourCalendar from "./calendar";
import TourMap from "./map";
import VideoGallery from './videogallery';


function Home() {
  const calendarRef = useRef(null);
  const mapRef = useRef(null);

  return (
    <main className="home-wrapper">
      {/* Hero Section */}
      <HeroSection
  imageSources={[
    '/media/images/homehero1.jpg',
    '/media/images/homehero2.jpg',
    '/media/images/homehero3.jpg',
  ]}
  videoSources={[
    '/media/videos/homehero.mp4',
    '/media/videos/destinationhero.mp4',
    '/media/videos/abouthero.mp4',
    '/media/videos/packageshero.mp4',
  ]}
  isVideoMode={false}
  title="Twende Safari"
  subtitle="Explore the World with Us."
  buttons={[
    { text: 'Join Newsletter', id: 'newslette-btnr' },
    { text: 'Book Today', id: 'booking-btn' }
  ]}
  showChat={true}
/>


   

      {/* Highlights Section */}
      <section className="highlights">
        <h2>Our Top Destinations</h2>
          <HighlightCard  />
        
      </section>

        


      {/* Reviews Section */}
      <Reviews />
      
      {/* Calendar and Map Section */}
      <section className="details-view">
        {/* <div className="calendar" id="calendar-section" ref={calendarRef}>
          <TourCalendar />
        </div> */}
        <div className="map" id="map-section" ref={mapRef}>
          <TourMap />
        </div>
      </section>
           {/* video gallery*/}

           <section className="videos-section">
           <div className="overlay" />

  <div className="videos-section-header">
    
    <h3>Rediscover Our Planet Like Never Before </h3>
   <p> Step beyond the ordinary and explore hidden gems across the globe. Our curated tours are designed to awaken your sense of adventure and connect you with nature, culture, and unforgettable experiences.</p>

  </div>
  <img src='/media/images/videogallerybg.jpg'
        alt="videosection background" className="videogallery" />
  <div className="video-gallery-layout">
    <VideoGallery />
  </div>
</section>
  
    </main>
  );
}

export default Home;

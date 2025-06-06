import React, { useEffect, useState } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/destinations.css';
import HeroSection from './hero';
import NewsletterSignup from './newsletter';

import { useLocation } from 'react-router-dom';
import DestinationDetails from './destinationdetails';












const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [error, setError] = useState(null);
  const [isGalleryVisible, setGalleryVisible] = useState(false);
  const [displayedDestinations, setDisplayedDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const location = useLocation();
  const [showDetails, setShowDetails] = useState(false);


// effect to fetch all destinations   // 
  useEffect(() => {
    fetch(`${baseURL}/api/destinations`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setDestinations)
      .catch(err => {
        console.error("Failed to fetch destinations:", err);
        setError("Failed to load destinations.");
      });
  }, []);

useEffect(() => {
  const idToScrollTo = location.state?.scrollToId;
  if (idToScrollTo && destinations.length > 0) {
    const match = destinations.find(dest => dest._id === idToScrollTo);
    if (match) {
      setSelectedDestination(match);

      setTimeout(() => {
        const el = document.getElementById(`destination-card-${idToScrollTo}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlighted');
          setTimeout(() => el.classList.remove('highlighted'), 2000);
        }

        // ✅ Clear the state so it doesn’t persist
        window.history.replaceState({}, document.title);
      }, 300);
    }
  }
}, [location.state, destinations]);



function openDestinationDetails(destination) {
  setSelectedDestination(destination);
  setShowDetails(true);

  setTimeout(() => {
    const section = document.getElementById("destination-details-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });

      // ✅ Clear navigation state after scroll
      window.history.replaceState({}, document.title);
    }
  }, 100);
}



 
// then scrolls to the DestinationDetails component.
function handleExploreClick(destination) {
  setSelectedDestination(destination);

 

  // Smooth scroll to the details section
  setTimeout(() => {
    const section = document.getElementById("destination-details-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }, 100); // Allow state to update
}
 useEffect(() => {
  if (location.state?.openDetails && location.state.destination) {
    openDestinationDetails(location.state.destination);

    // ✅ Clear openDetails state
    window.history.replaceState({}, document.title);
  }
}, [location.state]);



  useEffect(() => {
    const shuffleAndSet = () => {
      const shuffled = [...destinations].sort(() => Math.random() - 0.5);
      setDisplayedDestinations(shuffled.slice(0, 10));
    };
  
    if (destinations.length > 0) {
      shuffleAndSet(); // initial display
      const interval = setInterval(shuffleAndSet, 10000); // every 10 seconds
      return () => clearInterval(interval); // cleanup
    }
  }, [destinations]);
  


// scroll to destination gallery using hero btn 
  useEffect(() => {
    if (location.state?.scrollToGallery) {
      setGalleryVisible(true);

      setTimeout(() => {
        const el = document.getElementById('destinations-gallery');
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.state])

  // scroll to destination gallery using foooter btn 
  function scrollToGallery() {
  const el = document.getElementById('destinations-gallery');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}



  return (
    <main className="destinations-page">

      
<HeroSection
  imageSources={['/media/images/abouthero.jpg','/media/images/destinationhero.jpg','/media/images/destinationhero1.jpg','/media/images/destinationhero2.jpg','/media/images/destinationhero3.jpg','/media/images/destinationhero4.jpg']}
  isVideoMode={false}
  title="Destinations"
  subtitle=" Explore...   Expirience...    Discover hidden gems !"
  buttons={[
    { text: 'Explore Destinations', id: 'explore-destinations-btn' }
  ]}/>      <section className="destinations-list">
  {error ? (
    <p className="error-message">{error}</p>
  ) : (
    <>
      <div className="left-vertical">
        {destinations[0] && (
          <article className="destination-card">
            <img src={`${baseURL}/${destinations[0].image}`} alt={destinations[0].name} />
            
          </article>
        )}
      </div>

      <div className="right-grid">
  <div className="right-grid-row top-row">
    {destinations.slice(1, 3).map((dest, index) => (
      <article className="destination-card" key={`top-${index}`}>
        <img src={`${baseURL}/${dest.image}`} alt={dest.name} />
        
      </article>
    ))}
  </div>

  <div className="right-grid-row bottom-row">
    {destinations.slice(3, 5).map((dest, index) => (
      <article className="destination-card" key={`bottom-${index}`}>
        <img src={`${baseURL}/${dest.image}`} alt={dest.name} />
      </article>
    ))}
  </div>
</div>

    </>
  )}
</section>



     
      <section className="destination-highlight-section">
  <div className="highlight-text">
    <h2>Embark on a Journey That Goes Beyond Sightseeing</h2>
    <p>
      Dive into a world of curated experiences crafted for explorers, nature lovers, and culture seekers.
      Our packages bring you close to the heart of East Africa’s unmatched beauty and heritage.
    </p>
    <ul className="features-list">
    <li><i className="fas fa-shield-alt icon accent-icon"></i> Guided tours with local experts</li>
      <li><i className="fas fa-hand-holding-usd icon accent-icon"></i> Transparent pricing, no hidden costs</li>
      <li><i className="fas fa-home icon accent-icon"></i> Comfortable, vetted accommodations</li>
    </ul>
  </div>

  <div className="highlight-media">
    <div className="main-image">
      <img src="/media/images/mountain.jpeg" alt="Tour highlight" />
    </div>
    {/* <div className="thumbnail-row">
      <img src="/media/images/thumb1.jpg" alt="Highlight 1" className="thumb" />
      <img src="/media/images/thumb2.jpg" alt="Highlight 2" className="thumb" />
    </div> */}
  </div>
</section>
<section id="destinations-gallery" className="destinations-gallery">

  <h2>Curated gems for that perfect getaway </h2>
  {displayedDestinations.map((dest, index) => (

    <div
  key={dest._id}
  id={`destination-card-${dest._id}`}
  className="destination-card gallery-card"
>
  {/* CARD CONTENT */}

 <article className="" key={index}>
          <div className='overlay'/>

      <img src={`${baseURL}/${dest.image}`} alt={dest.name} />
      <div className="card-info">
        <h3>{dest.name}</h3>
        <p>{dest.description}</p>
      </div>
      <button className="explore-arrow-btn"
        onClick={() => handleExploreClick(dest)}
      >
      <i class="fa-solid fa-arrow-right-long"></i>
      </button>
    </article></div>

   
  ))}
</section>

{ selectedDestination && (
  <div id="destination-details-section">
    <DestinationDetails
      destination={selectedDestination}
      onClose={() => setSelectedDestination(null)}
    />
  </div>
)}



<section className="destination-footer-cta">
  <div className="destination-grid">

    
    {/* Call to Action */}
    <div className="destination-section">
      <h5>Immerse Yourself In Diverse African Cltures & Explore Stunning Landscapes </h5>
      
    </div>
    {/* newslettern  */}
    <NewsletterSignup/>


    <div className="destination-section ">
      <p>Adventure awaits... unleash your nomadic spirit </p>
<button onClick={scrollToGallery} className="scroll-to-gallery-btn">
  Explore Destinations
</button>
      
    </div>
    

  </div>
</section>

    </main>
  );
};

export default Destinations;

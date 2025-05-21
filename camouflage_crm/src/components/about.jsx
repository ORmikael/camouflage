import React from "react";

import "../assets/css/about.css";
import "../assets/css/colors.css";
import HeroSection from "./hero"; 
import TeamSection from "./teamsection";
import { Link, useNavigate } from "react-router-dom";
import NewsletterSignup from "./newsletter";

const About = () => {

  const navigate = useNavigate()
  const handlenavigate =()=>navigate('/packages')
  return (
    <main className="about-page">
    <div className="overlay"></div>

<HeroSection
  imageSources={['/media/images/abouthero.jpg','/media/images/abouthero1.jpg','/media/images/abouthero2.jpg','/media/images/abouthero3.jpg']}
  isVideoMode={false}
  title="About Us"
  subtitle="Discover who we are and what drives us"
  buttons={[]}
/>


      {/* Company Introduction */}
      <section className="about-intro">
        <div className="intro-left">
          <h2>Safaris & Tours Begin With Us!!</h2>
          <p>
            CamoTrails Safaris is an East African tour company passionate about
            crafting unforgettable experiences for international tourists, corporate,
            and group travelers. We create immersive safaris, beach getaways, and
            cultural adventures, combining comfort, authenticity, and local expertise.
          </p>
          <div className="bullet-points">
            <ul>
              <li>Authentic experiences</li>
              <li>Local, knowledgeable guides</li>
              <li>Curated & flexible packages</li>
            </ul>
            <ul>
              <li>Safe transport & stays</li>
              <li>Group & solo friendly</li>
              <li>Eco & community focused</li>
            </ul>
          </div>
          <div className="cta-row">
            <a href="/packages" className="cta-button">Book a Tour</a>
            <span className="call-now">OR +254-73772 1239 | +254-74218 9659</span>
          </div>
        </div>
        <div className="intro-right">
          <img src='/media/images/videogallerybg.jpg' alt="About intro img" className="intro-image" />
        </div>
      </section>

      <section className="mission-vision-values-showcase">
      <div className="mission-vision">
        <h3>Our Vision</h3>
        <p>To become East Africa’s most trusted brand in delivering authentic and memorable travel experiences.</p>
        <h3>Our Mission</h3>
        <p>To connect travelers with East Africa’s beauty through seamless, culturally rich tours.</p>
      </div>
        <div className="content-layout">
        
          <div className="left-column">
              <div className="image-grid">
              <img src="/media/images/destinationhero1.jpg" alt="Destination 1" />
              <img src="/media/images/destinationhero2.jpg" alt="Destination 2" />
              <img src="/media/images/destinationhero3.jpg" alt="Destination 3" />
              <img src="/media/images/destinationhero4.jpg" alt="Destination 4" />
            </div>
          </div>

          <div className="right-column">
            <div className="core-values">
              <h3>Core Values</h3>
              <ul>
                <li><strong>Authenticity:</strong> Real, meaningful experiences</li>
                <li><strong>Excellence:</strong> Top service, safety, and satisfaction</li>
                <li><strong>Integrity:</strong> Transparency in action</li>
                <li><strong>Innovation:</strong> Unique and creative tour design</li>
                <li><strong>Empowerment:</strong> Supporting local communities</li>
              </ul>

              <div className="core-values-action">
                <h5>Didn’t Find Any Packages?</h5>
                <div className="cta-row">
                  <span className="call-now">
                    <i className="fas fa-phone"></i> +254-73112-1239
                  </span>
                  <span className="or-separator">OR</span>
                  <a href="/packages" className="cta-button">More Packages</a>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="quote-block">
          <blockquote>
            “The best travel experience I’ve ever had. Everything was smooth from booking to return. I cant wait to go back!”
          </blockquote>
          <footer>- Happy Client</footer>
        </div>
      </section>


      {/* Team Section */}

      <TeamSection/>


      {/* CTA Footer */}
      <section className="about-footer-cta">
  <div className="footer-grid">

    {/* Quick Links */}
    <div className="footer-section quick-links">
      <h5>Quick Links</h5>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/destinations">Destinations</Link></li>
        <li><Link to="/packages">Packages</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
      </ul>
    </div>

   {/* Contact Info */}
<div className="footer-section contact-info">
  <h5>Contact Info</h5>
  <p><i className="fa-solid fa-map-pin"></i> Nairobi, Kenya</p>
  <p><i className="fa-solid fa-envelope"></i> info@camotrailsafari.co.ke</p>
  <p><i className="fa-solid fa-phone"></i> +254-73772 1239 | +254-74218 9659 </p>
</div>
      {/* Newsletter Signup */}
    <NewsletterSignup/>

    {/* Call to Action */}
    <div className="footer-section make-reservation">
      <h5>Make a Reservation</h5>
      <p>Secure your spot now and start your adventure with us!</p>
      <button className="reserve-btn" onClick={handlenavigate}> 
      <i className="fa-solid fa-headset"></i> Book Now
      </button>
    </div>

    


  </div>
</section>
    </main>
  );
};

export default About;

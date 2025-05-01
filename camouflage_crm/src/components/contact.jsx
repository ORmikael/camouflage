import React from "react";
import "../assets/css/contact.css";
import HeroSection from "./hero";
import { Link } from "react-router-dom";
import NewsletterSignup from "./newsletter";


const Contact = () => {
  return (
    <main className="contact-page">

      {/* Hero Section */}

      <HeroSection
  imageSources={['media/images/abouthero.jpg']}
  isVideoMode={false}
  title="Contact Us"
  subtitle="We’re here to help with bookings, inquiries, and more."
  buttons={[]}
/>
       {/* CTA Footer */}
       <section className="contact-cta">
        <h2>Get In Touch</h2>
        <p>Let’s Plan Your Next Adventure</p>
      </section>

      {/* Contact Form Section */}
      <div className="contact-wrapper">
  

      <form className="contact-form">
        <h3>Send Us A Message</h3>
        <div className="form-row">
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Email Address" />
        </div>
        <div className="form-row">
          <input type="text" placeholder="Phone Number" />
          <input type="text" placeholder="Address" />
        </div>
        <textarea rows="4" placeholder="Your Message"></textarea>
        <div className="submit-btn-wrapper">
          <button type="submit"><i className="fa-solid fa-paper-plane"></i> Send Message</button>
        </div>
      </form>
      <div className="company-info">
    <h3>Contact Us</h3>
    <p><i className="fa-solid fa-location-dot"></i> Nairobi, Kenya</p>
    <p><i className="fa-solid fa-envelope"></i> info@camouflagetours.com</p>
    <p><i className="fa-solid fa-phone"></i> +254-890-0055</p>

    <div className="social-icons">
      <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
      <a href="#"><i className="fa-brands fa-twitter"></i></a>
      <a href="#"><i className="fa-brands fa-instagram"></i></a>
    </div>
  </div>
</div>
{/* <div className="empty-space" style={{height:'50vh'}}></div> */}


    

      {/* Footer Quick Links */}
      <section className="contact-footer-cta">
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
  <p><i className="fa-solid fa-envelope"></i> info@camouflagetours.com</p>
  <p><i className="fa-solid fa-phone"></i> +254-79900-4096</p>
</div>

    
    {/* Newsletter Signup */}
    <NewsletterSignup/>

    {/* Call to Action */}
    <div className="footer-section make-reservation">
      <h5>Make a Reservation</h5>
      <p>Secure your spot now and start your adventure with us!</p>
      <button className="reserve-btn">
      <i className="fa-solid fa-headset"></i> Book Now
      </button>
    </div>


  </div>
</section>
    </main>
  );
};

export default Contact;

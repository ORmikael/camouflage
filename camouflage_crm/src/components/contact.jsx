import React, { useState } from "react";
import "../assets/css/contact.css";
import HeroSection from "./hero";
import { Link, useNavigate } from "react-router-dom";
import NewsletterSignup from "./newsletter";
import { baseURL } from "../utils/config";

const Contact = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: ""
  });

  const [statusMsg, setStatusMsg] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    const res = await fetch(`${baseURL}/api/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const result = await res.json();
    setStatusMsg(result.message || "Message sent!");

    //  WAIT 1 SECOND THEN CLEAR FIELDS
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        message: ""
      });
    }, 100);
     setTimeout(() => {
      
      setStatusMsg("");
    }, 2500);

  } catch (err) {
    console.error(err);
    setStatusMsg("Something went wrong. Try again.");
  }
}


  return (
    <main className="contact-page">
      <HeroSection
        imageSources={["media/images/abouthero.jpg"]}
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

      {/* Contact Form */}
      <div className="contact-wrapper">
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send Us A Message</h3>
          <div className="form-row">
            <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            <input type="text" name="address" placeholder="Address"  value={formData.address} onChange={handleChange} />
          </div>
          <textarea rows="4" name="message" placeholder="Your Message" value={formData.message} onChange={handleChange} required />
          <div className="submit-btn-wrapper">
            <button type="submit"><i className="fa-solid fa-paper-plane"></i> Send Message</button>
          </div>
          {statusMsg && <p className="status-msg">{statusMsg}</p>}
        </form>

        {/* Company Info */}
        <div className="company-info">
          <h3>Contact Us</h3>
          <p><i className="fa-solid fa-location-dot"></i> Nairobi, Kenya</p>
          <p><i className="fa-solid fa-envelope"></i> info@camotrailsafari.co.ke</p>
          <p><i className="fa-solid fa-phone"></i> +254-73772 1239 | +254-74218 9659 </p>

          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>

      {/* Footer Quick Links */}
      <section className="contact-footer-cta">
        <div className="footer-grid">
          {/* Quick Links */}
          {/* <div className="footer-section quick-links">
            <h5>Quick Links</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/destinations">Destinations</Link></li>
              <li><Link to="/packages">Packages</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div> */}

          {/* Contact Info */}
          <div className="footer-section contact-info">
            <h5>Contact Info</h5>
            <p><i className="fa-solid fa-map-pin"></i> Nairobi, Kenya</p>
            <p><i className="fa-solid fa-envelope"></i> info@camotrailsafari.co.ke</p>
            <p><i className="fa-solid fa-phone"></i> +254-73772 1239 | +254-74218 9659</p>
          </div>

          <NewsletterSignup />

          {/* Reservation CTA */}
          <div className="footer-section make-reservation">
            <h5>Make a Reservation</h5>
            <p>Secure your spot now and start your adventure with us!</p>
            <button className="reserve-btn" onClick={()=>navigate('/packages')}><i className="fa-solid fa-headset"></i> Book Now</button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;

// components/FooterCTA.jsx
import { Link } from "react-router-dom";
import NewsletterSignup from "./newsletter";
// import '../assets/css/footercta.css'

import '../assets/css/colors.css'

const FooterCTA = ({
  variant = "default",
  quickLinks = true,
  contactInfo = true,
  newsletter = true,
  ctaContent,
  customSections = []
}) => {
  const gridClass = variant === "destination" ? "destination-grid" : "footer-grid";
  const sectionClass = variant === "destination" ? "destination-footer-cta" : variant === "packages" ? "packages-footer-cta" : "about-footer-cta";

  return (
    <section className={sectionClass}>
      <div className={gridClass}>
        {/* Quick Links */}
        {quickLinks && (
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
        )}

        {/* Contact Info */}
        {contactInfo && (
          <div className="footer-section contact-info">
            <h5>Contact Info</h5>
            <p><i className="fa-solid fa-map-pin"></i> Nairobi, Kenya</p>
            <p><i className="fa-solid fa-envelope"></i> info@camouflagetours.com</p>
            <p><i className="fa-solid fa-phone"></i> +254-79900-4096</p>
          </div>
        )}

        {/* Newsletter */}
        {newsletter && <NewsletterSignup />}

        {/* Call-to-action section or injected custom sections */}
        {ctaContent ? (
          <div className="footer-section make-reservation">
            {ctaContent}
          </div>
        ) : null}

        {/* Additional custom sections (array of JSX) */}
        {customSections.map((section, idx) => (
          <div className="footer-section" key={idx}>{section}</div>
        ))}
      </div>
    </section>
  );
};

export default FooterCTA;

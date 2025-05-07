import "../assets/css/footer.css";
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const socialLinks = [
  { Icon: FaFacebook, url: 'https://facebook.com' },
  { Icon: FaInstagram, url: 'https://instagram.com' },
  { Icon: FaLinkedin, url: 'https://linkedin.com' },
];

function Footer() {
  return (
    <footer className="about-footer">
      <ul className="social-links">
  <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a></li>
  <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a></li>
  <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a></li> {/* Twitter Icon */}
  <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a></li>
</ul>

      <p>&copy; 2025 CamoTrail Safaris. All rights reserved.</p>
    </footer>
  );
}

export default Footer;


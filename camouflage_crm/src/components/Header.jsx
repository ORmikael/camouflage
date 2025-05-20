import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/header.css";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false); // for hamburger menu

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const scrollToSection = id => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("focus-effect");
      setTimeout(() => {
        element.classList.remove("focus-effect");
      }, 1200);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };



  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 29;
      setIsSticky(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header className={`header ${isSticky ? "sticky" : ""}`}>

      <div className="header__container">
        <div className="header__logo">
          <img src="/logo1.png" alt="Logo" />
        </div>

        {/* Nav Links */}
        <nav className={`header__nav ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/About" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/Destinations" onClick={() => setMenuOpen(false)}>Destinations</Link>
          <Link to="/Packages" onClick={() => setMenuOpen(false)}>Packages</Link>
          <Link to="/Contact" onClick={() => setMenuOpen(false)}>Contact Us</Link>
        </nav>

        {/* Icons */}
        <div className="header__icons">
          {/* <span>🔍</span> */}
          {/* <span onClick={() => scrollToSection("calendar-section")}>📅</span>
          <span onClick={() => scrollToSection("map-section")}>🗺️</span>

          <div className="theme-toggle">
            <button onClick={toggleTheme}>{theme === "light" ? "🌞" : "🌙"}</button>
          </div> */}

<span><i className="fas fa-search"></i></span>
<Link to="/profile" className="header__profile-icon" aria-label="Profile">
  <i className="fas fa-user"></i>
</Link>

        </div>

        {/* Hamburger */}
        <div className="humbuger__menu">
          <button onClick={toggleMenu}>☰</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
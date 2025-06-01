import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../assets/css/header.css";
import { useRef } from "react";
import SearchResults from "./searchresult";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [menuOpen, setMenuOpen] = useState(false); // for hamburger menu
   const [searchTerm, setSearchTerm] = useState('');
  const [searchActive, setSearchActive] = useState(false);
    const inputRef = useRef(null);



    // =========== search modal effects & functionality handler  ===============
    // CLOSE WHEN CLICKING OUTSIDE
  const wrapperRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSearchActive(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // CLOSE ON ESC KEY
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSearchActive(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);


  // CLOSE SEARCH  ITEM CLICK 

  const closeSearch = () => {
  setSearchActive(false);
  setSearchTerm('');
};
    // ===============================================


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
          {/* <img src="/camotrail logo.png" alt="Logo" /> */}
          <img src="/logo1.png" alt="Logo" />
          {/* <img src="/logo2.png" alt="Logo" /> */}
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


          {/* search  */}
         {/* =================================== */}
      {/* SEARCH ICON + EXPANDABLE INPUT FIELD */}
      {/* =================================== */}
      <div className="search-wrapper" ref={wrapperRef}>
        {!searchActive ? (
          <span onClick={() => {
            setSearchActive(true);
            setTimeout(() => inputRef.current?.focus(), 100); // delay for render
          }}>
            <i className="fas fa-search"></i>
          </span>
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search destinations, packages, videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}

        {/* =================================== */}
        {/* CONDITIONAL SEARCH RESULT MODAL */}
        {/* =================================== */}
        <div className="search-overlay-wrapper">
          {searchActive && searchTerm.trim() !== '' && (
            <SearchResults query={searchTerm} 
              onClose={() => setSearchActive(false)}
               closeSearch={closeSearch} />
          )}
        </div>
      </div>

          {/* user profile and dashboard */}
        <Link to="/profile" className="header__profile-icon" aria-label="Profile">
          <i className="fas fa-user"></i>
        </Link>

        </div>

        
  
        {/* Hamburger */}
        <div className="humbuger__menu">
          <button id="navToggle" onClick={toggleMenu}>☰</button>
        </div>
  
      </div>
    </header>
  );
};

export default Header;
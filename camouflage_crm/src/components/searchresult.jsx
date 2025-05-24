import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../assets/css/searchresult.css'; 
import {baseURL}  from "../utils/config"

const SearchResults = ({ query, onClose, closeSearch }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    destinations: [],
    packages: [],
    videos: [],
    images: [],
  });
  const [error, setError] = useState(null);

   const navigate = useNavigate();

   
const handleDestinationClick = (destination) => {
  // CLOSE SEARCH MODAL
  setTimeout(() => {
      closeSearch();
    
  }, 150);

  // DELAYED NAVIGATION FOR UI SMOOTHNESS
  setTimeout(() => {
    navigate('/destinations', {
      state: { scrollToId: destination._id },
    });
  }, 500); // Adjust delay (ms) to match your animation speed
};

// ========================== PACKAGE SEARCH CLICK HANDLER ==========================
const handlePackageClick = (pkg) => {
  // CLOSE SEARCH MODAL
  setTimeout(() => closeSearch(), 150);
  

  // NAVIGATE TO PACKAGES PAGE WITH STATE
  setTimeout(() => {
    navigate('/packages', {
      state: { scrollToId: pkg._id }
    });
  }, 500); // Match with your UI transition speed
};


  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        // =============================== 
        // API CALL: SEARCH ENDPOINT
        // ===============================
        const response = await fetch(`${baseURL}/api/search?q=${encodeURIComponent(query)}`);

        // ===============================
        // HANDLE NON-200 STATUS
        // ===============================
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        // ===============================
        // HANDLE BACKEND RESPONSE FORMAT
        // ===============================
        if (data.status === 'success') {
          setResults(data.results);
        } else {
          setError(data.message || 'Failed to fetch search results.');
        }
      } catch (err) {
        console.error('[SEARCH] Error:', err);
        setError('Something went wrong. Try again.');
      }

      setLoading(false);
    };

    fetchResults();
  }, [query]);

  if (!query) return null;

  return (
    <div className="search-results-wrapper">
      {/* =============================== */}
      {/* SEARCH HEADER WITH CLOSE BUTTON */}
      {/* =============================== */}
      <div className="search-header">
        <h2>Search Results for: "{query}"</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      {/* =============================== */}
      {/* LOADING / ERROR / RESULTS */}
      {/* =============================== */}
      {loading && <div className="loading">Searching, please wait...</div>}

      {!loading && error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="search-results-content">
          {results.destinations.length > 0 && (
            <div className="result-group">
              <h3>Destinations</h3>
              <ul className="result-list">
                {results.destinations.map((item, idx) => (
                  <li key={idx} onClick={() =>{ handleDestinationClick(item) }}>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.packages.length > 0 && (
            <div className="result-group">
              <h3>Packages</h3>
              <ul className="result-list">
                {results.packages.map((item, idx) => (
                  <li key={idx} onClick={() => handlePackageClick(item)}>
                  {item.name}
                </li>

                ))}
              </ul>
            </div>
          )}

          {/* {results.videos.length > 0 && (
            <div className="result-group">
              <h3>Videos</h3>
              <ul className="result-list">
                {results.videos.map((item, idx) => (
                  <li key={idx} onClick={() => handleDestinationClick(item)}>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* {results.images.length > 0 && (
            <div className="result-group">
              <h3>Images</h3>
              <ul className="result-list">
                {results.images.map((item, idx) => (
                  <li key={idx} onClick={() => window.location.href = `/images/${item.slug || item._id}`}>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )} */}

          {/* =============================== */}
          {/* NO RESULTS MESSAGE */}
          {/* =============================== */}
          {Object.values(results).every(arr => arr.length === 0) && (
            <div className="no-results">No results found for "{query}".</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;

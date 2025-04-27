import React, { useState, useEffect, useRef } from 'react';
import '../assets/css/newsletter.css';
import { baseURL } from '../utils/config';

const NewsletterSignup = () => {
  const emailInputRef = useRef(null);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type = 'success' | 'error'
  
  // Automatically clear feedback after 3 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

//   focus on newsletter form input feild
  useEffect(() => {
    const shouldFocus = window.location.hash === '#newsletter-focus';
    if (shouldFocus && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);


//   prevent default form submision 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${baseURL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({ message: data.error || 'Something went wrong', type: 'error' });
      } else {
        setFeedback({ message: data.message, type: 'success' });
        setEmail('');
      }
    } catch (err) {
      setFeedback({ message: 'Network error. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="footer-section newsletter">
      <h5>Join Our Newsletter</h5>
      <p>Don't miss exclusive offers and travel stories. Be in the know.</p>
      {feedback.message && (
        <p className={`newsletter-feedback ${feedback.type}`}>
          {feedback.message}
        </p>
      )}
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <input
          ref={emailInputRef}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">
          <i className="fa-solid fa-envelope-circle-check"></i> Subscribe
        </button>
      </form>

     
    </div>
  );
};

export default NewsletterSignup;

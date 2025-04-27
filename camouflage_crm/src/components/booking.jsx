import "../assets/css/booking.css";
import React, { useState, useEffect } from 'react';
import { baseURL } from "../utils/config";

const BookingForm = ({ selectedPackage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    date: '',
    notes: '',
    package: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedPackage?._id) {
      setFormData(prev => ({ ...prev, package: selectedPackage._id }));
    }
  }, [selectedPackage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseURL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'An error occurred');
      } else {
        setSuccess(result.message || 'Booking successful!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          travelers: 1,
          date: '',
          notes: '',
          package: selectedPackage?._id || '',
        });
      }
    } catch (err) {
      setError('Failed to submit booking. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      
      <input name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
      <input name="travelers" type="number" value={formData.travelers} onChange={handleChange} min="1" />
      <input name="date" type="date" value={formData.date} onChange={handleChange} required />
      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional Notes" />
      
      <button type="submit">Confirm Booking</button>
    </form>
  );
};

export default BookingForm;

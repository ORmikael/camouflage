import React, { useState, useEffect, useRef } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/booking.css';

const BookingForm = ({ selectedPackage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    date: '',
    notes: '',
  });

  const [status, setStatus] = useState({ success: '', error: '' });
  const bookingSectionRef = useRef(null);
  const packagesSectionRef = useRef(null);

  useEffect(() => {
    if (selectedPackage) {
      // Optionally, you can prefill or update form data based on selectedPackage
    }
  }, [selectedPackage]);

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const calculateEndDate = (startDate, durationText) => {
    const match = durationText.match(/(\d+)\s*days?/i);
    if (!match) return '';
    const days = parseInt(match[1], 10);
    const start = new Date(startDate);
    start.setDate(start.getDate() + days);
    return start.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: '', error: '' });

    if (!selectedPackage) {
      setStatus({ error: 'Please select a package before booking.', success: '' });
      scrollToRef(packagesSectionRef);
      return;
    }

    const endDate = calculateEndDate(formData.date, selectedPackage.duration);
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    
      packageId: selectedPackage._id,
      date: formData.date,
      endDate: endDate, // computed or selected
      travelers: parseInt(formData.travelers, 10),
    
      paymentMethod: "Credit Card",
      amount: parseFloat(selectedPackage.price.replace('$', '')),
      currency: "USD"
    };
    

    try {
      const response = await fetch(`${baseURL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(payload);
      
      const result = await response.json();

      if (!response.ok) {
        setStatus({ error: result.error || 'Booking failed.', success: '' });
      } else {
        setStatus({ success: result.message || 'Booking successful!', error: '' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          travelers: 1,
          date: '',
          notes: '',
        });
      }
    } catch (error) {
      setStatus({ error: 'An unexpected error occurred.', success: '' });
    }
  };

  return (
    <>
      <section ref={packagesSectionRef} id="packages-section">
        {/* Packages listing component or content goes here */}
      </section>

      <section ref={bookingSectionRef} id="booking-form-section">
        <form onSubmit={handleSubmit} className="booking-form">
          {status.error && <div className="form-error">{status.error}</div>}
          {status.success && <div className="form-success">{status.success}</div>}

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
          />
          <input
            name="travelers"
            type="number"
            value={formData.travelers}
            onChange={handleChange}
            min="1"
            required
          />
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional Notes"
          />

          <button type="submit">Confirm Booking</button>
        </form>
      </section>
    </>
  );
};

export default BookingForm;

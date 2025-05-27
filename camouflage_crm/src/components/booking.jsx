import React, { useState, useEffect, useRef } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/booking.css';

const BookingForm = ({ selectedPackage, setSelectedPackage}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelers: 1,
    date: '',
    notes: '',
  });

  const [status, setStatus] = useState({ success: '', error: '' });
  const [redirect_url, setRedirect_url] = useState('');
  const bookingSectionRef = useRef(null);
  const packagesSectionRef = useRef(null);
  const feedbackRef = useRef(null)
// ================used for rebooking of previously biiked safaris==================================
 useEffect(() => {
  const savedBooking = JSON.parse(localStorage.getItem("rebookData"));
  console.log("[REBOOK] Loaded booking:", savedBooking);

  if (savedBooking) {
    // PREFILL FORM DATA
    setFormData((prev) => ({
      ...prev,
      name: savedBooking.name || "",
      email: savedBooking.email || "",
      phone: savedBooking.phone || "",
      travelers: "" ,
      date: "", // Force fresh date input for rebooking
    }));

    // SET SELECTED PACKAGE FROM BOOKING
    if (savedBooking.packageId) {
    const start = new Date(savedBooking.date);
    const end = new Date(savedBooking.endDate);

    const durationInDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

      setSelectedPackage({
        _id: savedBooking.packageId,
        duration: `${durationInDays} `, 
        price: `$${savedBooking.amount || "0"}`,
      });
    } else {
      console.warn("[REBOOK] Missing packageId in saved booking data.");
    }

    // CLEAN UP
    localStorage.removeItem("rebookData");
  }
}, []);

// ===============================================================================================

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
    
      packageId: selectedPackage?._id ,
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
      // Always update redirect_url if present
      if (result.redirect_url) {
        setRedirect_url(result.redirect_url);
      }
      
      console.log("Redirect URL:", result.redirect_url);
    } catch (error) {
      setStatus({ error: 'An unexpected error occurred.', success: '' });
    }
    

  };
  // Scroll to feedback on status change
useEffect(() => {
  if ((status.success || status.error) && feedbackRef.current) {
    feedbackRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}, [status]);




// Auto-dismiss feedback after delay
useEffect(() => {
  if (status.success || status.error) {
    const timer = setTimeout(() => {
      setStatus({ success: '', error: '' });
    }, 5000);

    // Clear selected package
    setSelectedPackage(null);

    return () => clearTimeout(timer);
  }
}, [status]);


  return (
    <div className='packages-booking-wrapper'>
      <section ref={packagesSectionRef} id="packages-section">
        {/* Packages listing component or content goes here */}
      </section>
     


      <section ref={bookingSectionRef} id="booking-form-section">
        <form onSubmit={handleSubmit} className="booking-form" id="booking-form">
        <div ref={feedbackRef}>
  {status.error && <div className="form-error">{status.error}</div>}
  {status.success && <div className="form-success">{status.success}</div>}
</div>

          <div class="step-tracker">
        <div class="step completed">Reserve</div>
        <div class="step completed">Make Payment</div>
        <div class="step active">Await Confirmation</div>
        <div class="step">Enjoy Safari!</div>
      </div>
      <hr style={{ margin: '1rem 0px', }} />
      <div className="form-row">
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
            placeholder="No.Travelers" 

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
          </div>
          
          {/* <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional Notes"
          /> */}

          <button type="submit">Confirm Booking</button>
        </form>
      </section>
     {redirect_url && (
  <div className="iframe-container">
    <iframe
      title="Payment Gateway"
      src={redirect_url}
      style={{
        width: '100%',
        height: '600px',
        border: 'none',
        marginTop: '2rem',
      }}
      allowFullScreen
    ></iframe>
  </div>
)}

    </div>
  );
};

export default BookingForm;

// ===============================
// COMPONENT: MyBookings.jsx
// ===============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../utils/config";
import "../../assets/css/userprofile/mybookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ===============================
  // FETCH BOOKINGS
  // ===============================
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseURL}/api/bookings/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("[BOOKINGS] Response:", data);

        if (data.status === "success") {
          setBookings(data.bookings);
        } else {
          console.error("[BOOKINGS]", data.message);
        }
      } catch (err) {
        console.error("[BOOKINGS]", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  // ===============================
  // CANCEL BOOKING
  // ===============================
  const handleCancel = async (bookingId) => {
    try {
      const res = await fetch(`${baseURL}/api/bookings/cancel/${bookingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.status === "success") {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        console.log("[CANCEL]", data.message);
      } else {
        console.error("[CANCEL]", data.message);
      }
    } catch (err) {
      console.error("[CANCEL]", err);
    }
  };

  // ===============================
  // BOOK AGAIN ACTION
  // ===============================
  const handleBookAgain = (booking) => {
    if (!booking) {
      console.error("[BOOK AGAIN] Info for rebooking is missing:", booking);
      return;
    }

    localStorage.setItem("rebookData", JSON.stringify(booking));
    navigate("/packages");
  };

  // ===============================
  // CLOSE PANEL HANDLER
  // ===============================
  const handleCloseBookings = () => {
    navigate("/profile", { replace: true }); // Removes #bookings from URL
  };

  // ===============================
  // HELPERS
  // ===============================
  const isPast = (dateStr) => new Date(dateStr) < new Date();
  const upcoming = bookings.filter((b) => !isPast(b.date));
  const past = bookings.filter((b) => isPast(b.date));

  // ===============================
  // CONDITIONAL RENDERING
  // ===============================
  if (loading) return <p>Loading your bookings...</p>;
  if (bookings.length === 0) return <p>You have no bookings yet.</p>;

  // ===============================
  // RENDER SECTION
  // ===============================
  return (
    <div className="booking-wrapper">
      {/* ============ CLOSE SECTION ============ */}
      <button
        className="close-section-btn"
        onClick={handleCloseBookings}
        title="Close My Bookings"
      >
        ×
      </button>

      {/* <h2 className="text-2xl font-bold mb-4">My Bookings</h2> */}
      <div>


      {/* ============ UPCOMING TRIPS ============ */}
      {upcoming.length > 0 && (
        <>
          <h3 className="section-title">Upcoming Trips</h3>
          <ul className="booking-list">
            {upcoming.map((booking) => (
              <li key={booking._id} className="booking-card upcoming">
                <p><strong>Trip:</strong> {booking.trip_name}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {booking.status}</p>

                <button
                  onClick={() => handleCancel(booking._id)}
                  className="action-btn cancel"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      </div>
<hr style={{ width: '100%', margin: '.5rem 0', opacity: 0.2 }} />

      <div>

      {/* ============ PAST TRIPS ============ */}
      {past.length > 0 && (
        <>
          <h3 className="section-title">Past Trips</h3>
          <ul className="booking-list">
            {past.map((booking) => (
              <li key={booking._id} className="booking-card past">
                <p><strong>Trip:</strong> {booking.trip_name}</p>
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {booking.status}</p>

                <button
                  onClick={() => handleBookAgain(booking)}
                  className="action-btn rebook"
                >
                  Book Again
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      </div>
    </div>
  );
};

export default MyBookings;

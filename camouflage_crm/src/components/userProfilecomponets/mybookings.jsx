// ===============================
// COMPONENT: MyBookings.jsx
// ===============================
import { useEffect, useState } from "react";
import { baseURL } from "../../utils/config";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

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
            "Content-Type": "application/json"
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
      const res = await fetch(`${baseURL}/api/bookings/cancel${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (data.status === "success") {
        setBookings(bookings.filter(b => b._id !== bookingId));
        console.log("[CANCEL]", data.message);
      } else {
        console.error("[CANCEL]", data.message);
      }
    } catch (err) {
      console.error("[CANCEL]", err);
    }
  };

  // ===============================
  // HELPERS
  // ===============================
  const isPast = (dateStr) => new Date(dateStr) < new Date();

  const upcoming = bookings.filter(b => !isPast(b.date));
  const past = bookings.filter(b => isPast(b.date));

  if (loading) return <p>Loading your bookings...</p>;
  if (bookings.length === 0) return <p>You have no bookings yet.</p>;

  // ===============================
  // RENDER SECTION
  // ===============================
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      {/* ============ UPCOMING TRIPS ============ */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Upcoming Trips</h3>
        <ul className="space-y-4">
          {upcoming.map((booking) => (
            <li key={booking._id} className="p-4 border rounded shadow bg-white">
              <p><strong>Trip:</strong> {booking.trip_name}</p>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              <button
                onClick={() => handleCancel(booking._id)}
                className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ============ PAST TRIPS ============ */}
      <section>
        <h3 className="text-xl font-semibold mb-2">Past Trips</h3>
        <ul className="space-y-4">
          {past.map((booking) => (
            <li key={booking._id} className="p-4 border rounded shadow bg-gray-100">
              <p><strong>Trip:</strong> {booking.trip_name}</p>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              <button
                onClick={() => console.log("[BOOK AGAIN]", booking)}
                className="mt-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Book Again
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default MyBookings;

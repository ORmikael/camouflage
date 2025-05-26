// components/ReviewModal.jsx
import React, { use, useState } from "react";
import "../../assets/css/userprofile/makereview.css"
import { baseURL } from "../../utils/config";

// ==========================================
// REVIEW MODAL COMPONENT
// ==========================================
const ReviewModal = ({ show, onClose, user }) => {
  
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(3);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SUBMIT REVIEW FUNCTION
  // ==========================================
  const submitReview = async () => {
    console.log("[REVIEW][SUBMIT] Submitting review...");

    // ===============================
    // INPUT VALIDATION
    // ===============================
    if (!reviewText.trim()) {
      alert("Review text cannot be empty.");
      return;
    }

    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5.");
      return;
    }

    try {
      setLoading(true);

      // ===============================
      // BUILD REQUEST PAYLOAD
      // ===============================
      const payload = {
        user_id: user.userId,
        text: reviewText,
        rating: rating,
      };

      console.log("[REVIEW][PAYLOAD]", payload);

      // ===============================
      // SEND REQUEST TO BACKEND
      // ===============================
      const response = await fetch(`${baseURL}/api/reviews/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // ===============================
      // HANDLE RESPONSE
      // ===============================
      if (response.ok && result.status === "success") {
        console.log("[REVIEW][SUCCESS]", result.message);
        alert("Review submitted successfully!");
        setReviewText("");
        setRating(3);
        onClose(); // Close modal
      } else {
        console.error("[REVIEW][ERROR]", result.message);
        alert(result.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error("[REVIEW][EXCEPTION]", err);
      alert("An error occurred while submitting your review.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  if (!show) return null;

  return (
    <div className="review-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Leave a Review</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <textarea
          placeholder="Write your review..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <label>
          Rating: {rating}
          <input
            type="range"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
          />
        </label>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={submitReview} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

import { useEffect, useState } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/reviews.css';
import mountainbg from "../assets/images/lush canopy.jpg"

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0); // <-- ✅ THIS LINE FIXES THE ERROR

 useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${baseURL}/api/reviews/fetch`);
      const json = await res.json();

      if (json.status === "success" && Array.isArray(json.data)) {
        setReviews(json.data);  // ✅ Only the array part
      } else {
        console.error("Invalid reviews response:", json);
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  fetchReviews();
}, []);


  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 2) % reviews.length); // show 2 cards
    }, 10000);
    return () => clearInterval(interval);
  }, [reviews]);

if (!Array.isArray(reviews) || reviews.length === 0) {
  return <p>No reviews available.</p>;
}

  return (
    <div className="reviews">
      {/* <div className="overlay"/> */}
      <h2 className='review-title'>What our clients are  saying ... </h2>
      <img
        src='/media/images/reviewbg3.jpg'
        alt="Background"
        className="review-bg"
      />
      <div className="review-overlay">
        {reviews.slice(current, current + 2).map((review, idx) => (
          <article className="review-card animate" key={idx}>

            <img
              src={`${baseURL}${review.avatar}`}
              alt={`${review.name}'s avatar`}
              className="avatar"
            />
            <div className="review-content">
              <h4>{review.name}</h4>
              <p className="review-text">"{review.text}"</p>
              <div className="review-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < review.rating ? 'filled-star' : 'empty-star'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Reviews;

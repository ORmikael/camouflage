// ===============================
// PROFILE PAGE MAIN LAYOUT
// Enhanced UI/UX + Styling Revision
// ===============================

import '../assets/css/colors.css';
import '../assets/css/profile.css';
import React, { useEffect, useState } from 'react';
import { baseURL } from "../utils/config";
import { Link, useLocation } from 'react-router-dom';

import UserSidebar from './userProfilecomponets/UserSidebar';
import UserTourCarousel from './userProfilecomponets/UserTourCarousel';
import UserActivityTimeline from './userProfilecomponets/UserActivityTimeline';
import LoadingMessage from './errorloadingpage';
import MyBookings from './userProfilecomponets/mybookings';
import ReviewModal from './userProfilecomponets/makereview';

const ProfilePage = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  // const activeSection = location.hash === "#bookings";
  const [activeSection, setActiveSection] = useState(null);
  
  const [showModal, setShowModal] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  

  // ===============================
  // MAIN EFFECT: FETCH USER PROFILE DATA
  // ===============================
useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    console.error("[USER] No user found in localStorage");
    return;
  }

  try {
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?.userId) {
      console.error("[USER] userId missing in parsed user object");
      return;
    }

    setCurrentUser(parsedUser);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${baseURL}/api/profile/usr?user_id=${parsedUser.userId}`);
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error('[PROFILE_FETCH]', err);
      }
    };

    fetchProfile();
  } catch (parseError) {
    console.error("[USER] Failed to parse user from localStorage", parseError);
  }
}, [showModal]);



  // ===============================
// SYNC ACTIVE SECTION WITH URL HASH
// ===============================
useEffect(() => {
  const hash = location.hash.replace("#", "");
  
  // Reset modal visibility always
  setShowModal(false);

  // Reset section properly
  if (hash === "") {
    setActiveSection(null);
  } else {
    setActiveSection(hash);
  }
}, [location.hash]);


 

  if (!userData) return <LoadingMessage />;

  // ===============================
  // PARSE USER STATS ARRAYS
  // ===============================
  let highlightsArray = [];
  let activitiesArray = [];

  try {
    highlightsArray = JSON.parse(userData.stats.highlights);
    if (!Array.isArray(highlightsArray)) highlightsArray = [];

    activitiesArray = JSON.parse(userData.stats.activities);
    if (!Array.isArray(activitiesArray)) activitiesArray = [];
  } catch (error) {
    console.error('[PARSE_STATS]', error);
  }



  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="profile-page">
      <UserSidebar userData={userData} />

      <main className="profile-main">
        {/* ===================== HERO SECTION ===================== */}
        <section className="profile-hero">
          <div className="hero-ooverlay">
            <h1>Welcome back, {userData.name?.split(" ")[0]}</h1>
            <Link to="/destinations">
              <button className="cta-button">Explore Destinations</button>
            </Link>
          </div>
        </section>

        {/* ===================== BODY SECTION ===================== */}
        <div className="profile-section-wrapper">
         <section className="tour-carousel">
  {activeSection === "bookings" ? (
    <MyBookings />
  ) : showModal  ? (
    <ReviewModal
  show={showModal}
  onClose={() => setShowModal(false)}
  user={currentUser}
 
/>


  ) : (
    <div className="recommendation-section">
      {/* UTILITY BUTTONS */}
      <div className="usr-utilities">
        <button className="utility-button" title="Edit Profile">
          <i className="fas fa-user utility-icon"></i>
        </button>
        <button className="utility-button" title="Contact Support">
          <i className="fas fa-life-ring utility-icon"></i>
        </button>
        <button
          className="utility-button"
          title="Make Review"
           onClick={() => {
            setShowModal(true);
            window.location.hash = "review"; // ensures URL updates
          }}
        >
          <i className="fas fa-star utility-icon"></i>
        </button>
      </div>

      <UserTourCarousel highlights={highlightsArray} />

      {/* STATIC RECOMMENDATION */}
      <div className="recommendation-card">
        <img
          src="/media/images/mountain.jpeg"
          alt="Lion Safari"
          className="recommendation-image"
        />
        <div className="recommendation-text">
          <h3>Dream Safari in Masai Mara</h3>
          <p>Explore the wild beauty of Kenya's most iconic reserve.</p>
          <Link to="/packages">
            <button className="recommend-btn">View Package</button>
          </Link> 
        </div>
      </div>
    </div>
  )}
</section>


          {/* ===================== ACTIVITY SECTION ===================== */}
          <section className="activity-section">
            <h2>Recent Activity</h2>
            <UserActivityTimeline activities={activitiesArray} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
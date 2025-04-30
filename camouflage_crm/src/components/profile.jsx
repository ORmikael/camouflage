import '../assets/css/colors.css';
import '../assets/css/profile.css';
import React, { useEffect, useState }  from 'react'; 
import {baseURL} from "../utils/config"
import { Link } from 'react-router-dom';




import UserSidebar from './userProfilecomponets/UserSidebar';
import UserTourCarousel from './userProfilecomponets/UserTourCarousel';
import UserActivityTimeline from './userProfilecomponets/UserActivityTimeline';
import LoadingMessage from './errorloadingpage';

const ProfilePage = () => {

  const [userData, setUserData] = useState(null);
  



   useEffect(() => {
    const testFetch = async () => {
      const userId = '680c656c89ad9cc4da0485fd'
      try {
        console.log('baseURL:', baseURL);
        const res = await fetch(`${baseURL}/api/profile/usr?user_id=${userId}`);
        console.log('Response object:', res);
  
        const data = await res.json();
        console.log('User data:', data);
  
        setUserData(data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
  
    testFetch();
  }, []);

  if (!userData) return <LoadingMessage/>;

  
  let highlightsArray = [];
  let activitiesArray = []

try {
  // parse hightlights and actvities stored as strings to objects for use in the child componenss
 
  highlightsArray = JSON.parse(userData.stats.highlights);
  if (!Array.isArray(highlightsArray)) {
    console.error("Parsed highlights is not an array:", highlightsArray);
    highlightsArray = [];
  } 

    activitiesArray = JSON.parse(userData.stats.activities);
    
  if (!Array.isArray(activitiesArray)) {
    console.error("Parsed highlights is not an array:", activitiesArray);
    activitiesArray = [];
  }
} catch (error) {
  console.error("Failed to parse highlights JSON:", error);
}
  return (
    <div className="profile-page">
      <UserSidebar userData={userData} />
      <main className="profile-main">
        <section className="profile-hero">
          <div className="hero-ooverlay">
            
            <h1>Welcome back, Michael</h1>
            <Link to="/destinations"><button className="cta-button">Explore Destinations</button></Link>
          </div>
        </section>
        <div className="profile-section-wrapper">

        <section className="tour-carousel">

          <div className="recommendation-section">
          
            
<div className="usr-utilities">
    <button className="utility-button" title="Settings">
      <i className="fas fa-cogs utility-icon"></i>
    </button>
    <button className="utility-button" title="Account">
      <i className="fas fa-user utility-icon"></i>
    </button>
    <button className="utility-button" title="Support">
      <i className="fas fa-life-ring utility-icon"></i>
    </button>
    <button className="utility-button" title="Travel Maps">
      <i className="fas fa-map-marked-alt utility-icon"></i>
    </button>
    <button className="utility-button" title="Visa Info">
      <i className="fas fa-passport utility-icon"></i>
    </button>
    <button className="utility-button" title="Hotels">
      <i className="fas fa-hotel utility-icon"></i>
    </button>
    <button className="utility-button" title="Car Rentals">
      <i className="fas fa-car utility-icon"></i>
    </button>
    <button className="utility-button" title="Local Guides">
      <i className="fas fa-globe-africa utility-icon"></i>
    </button>
  </div>
          

            <UserTourCarousel highlights={highlightsArray} />
            <div className="recommendation-card">
              <img
                src="/media/images/mountain.jpeg" // Use same image from hero
                alt="Lion Safari"
                className="recommendation-image"
              />
              <div className="recommendation-text">
                <h3>Dream Safari in Masai Mara</h3>
                <p>Explore the wild beauty of Kenya's most iconic reserve.</p>
                <Link to="/packages"><button className="recommend-btn">View Package</button></Link>
              </div>
              
            </div>
          </div>
        </section>

        <section className="activity-section"  >
          <h2>Recent Activity</h2>
          <UserActivityTimeline  activities={activitiesArray}/>
          
        </section>
        
        </div>
       

      </main>
    </div>
  );
};

export default ProfilePage;

import React from 'react';
import "../../assets/css/userprofile/usersidebar.css";
import { Link,useNavigate } from 'react-router-dom';
import { baseURL } from '../../utils/config';



const UserSidebar = ({ userData }) => {
  const navigate = useNavigate()


  const handleLogout = async () => {

    try {
      const token = localStorage.getItem("token");

      // ===============================
      // LOGOUT REQUEST TO BACKEND
      // ===============================
      const res = await fetch(`${baseURL}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("[LOGOUT] Backend response:", data);
    } catch (err) {
      console.error("[LOGOUT ERROR]", err);
    } finally {
      // ===============================
      // CLEAR FRONTEND STORAGE
      // ===============================
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      // ===============================
      // REDIRECT TO LANDING PAGE
      // ===============================
      navigate("/");
    }
  };


  return (
    <aside className="user-sidebar">
      <div className="profile-box">
<img 
  src={
    `${baseURL}/${userData.avatar || "media/images/mountain.jpeg"}`
  }
  alt="User"
  className="profile-pic"
/>
        <h3 className="user-name">{userData.name}</h3>
        <p className="user-role">{userData.role}</p>
      </div>
      <div className="user-stats">
        <div>
          <span className="stat-number">{userData.stats.tours}</span>
          <span className="stat-label">Tours</span>
        </div>
        <div>
          <span className="stat-number">{userData.stats.reviews}</span>
          <span className="stat-label">Reviews</span>
        </div>
        <div>
          <span className="stat-number">{userData.stats.gems}</span>
          <span className="stat-label">Gems</span>
        </div>
      </div>
      {/* <ul className="sidebar-nav">
        <li>My Bookings</li>
        <li>Saved Destinations</li>
        <li>Travel Highlights</li>
        <li>Blog</li>
        <li>Archive</li>
        <li>Back To Home</li>
      </ul> */}


<ul className="sidebar-nav">
  <li>
          <button onClick={() => navigate("/profile#bookings")}>
            My Bookings
          </button>
        </li>  


  {/* <li><Link to="/highlights">Travel Highlights</Link></li> */}
  {/* <li><Link to="/blog">Blog</Link></li> */}
  {/* <li><Link to="/saved">Saved Destinations</Link></li> */}
  {/* <li><Link to="/archive">Archive</Link></li> */}
  <li><Link to="/">Back To Home</Link></li>
  <li><button onClick={handleLogout}>Logout</button></li>
</ul>

    </aside>
  );
};

export default UserSidebar;

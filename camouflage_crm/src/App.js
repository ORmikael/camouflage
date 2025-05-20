import './App.css';
import { Routes, Route,useLocation } from "react-router-dom";

import Home from './components/home';
import About from './components/about';
import Destinations from './components/destinations';
import Packages from './components/packages';
import Contact from './components/contact';
import ProfilePage from './components/profile';

import Header from './components/Header';
import Footer from './components/Footer';
import MediaUploader from './components/media_uploader';
import AuthPage from './components/authpage';

import ProtectedRoute from './components/protectedroutes';
import AdminDashboard from './components/admindash';
import StaffDashboard from './components/staffdash';
import MyBookings from './components/userProfilecomponets/mybookings';

function App() {

  const location = useLocation();
  const hiddenHeaderPaths = ["/profile", "/login", "/signup"];
  const isHidden = hiddenHeaderPaths.includes(location.pathname);

  // const isProfilePage = location.pathname === '/profile'; 
  return ( 
  <>

    {!isHidden && <Header />}
    <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/profile" element={<ProfilePage />} /> */}
          <Route path="/uploadmedia" element={<MediaUploader />} />
          {/* {console.log(!isProfilePage)} */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />


          {/* ===================protected routes =================== */}



          {/* Normal User Route */}
          <Route path="/profile" element={ <ProtectedRoute allowedRoles={["user", "staff", "management"]}><ProfilePage /></ProtectedRoute>}/>

          {/* administrative routes  */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={["staff", "management"]}><StaffDashboard /></ProtectedRoute>}/>
          <Route path="/admin"  element={<ProtectedRoute allowedRoles={["management"]}><AdminDashboard /></ProtectedRoute>}/>

    </Routes>

    {!isHidden && <Footer />}
  </>
    
  );
}

export default App;

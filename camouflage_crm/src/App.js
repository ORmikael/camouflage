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

function App() {

  const location = useLocation();
  const isProfilePage = location.pathname === '/profile'; 
  return ( 
  <>

    {!isProfilePage && <Header />}
    <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/uploadmedia" element={<MediaUploader />} />
          {/* {console.log(!isProfilePage)} */}

    </Routes>

    {!isProfilePage && <Footer />}
  </>
    
  );
}

export default App;

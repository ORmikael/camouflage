import React, { useEffect, useState } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/videogallery.css';

const MAX_DISPLAY = 8;

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [visibleVideos, setVisibleVideos] = useState([]);

  useEffect(() => {
    fetch(`${baseURL}/api/videos`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setVideos(data);
        setVisibleVideos(data.slice(0, MAX_DISPLAY));
      })
      .catch(console.error);
  }, []);

  // Random swap logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (videos.length <= MAX_DISPLAY) return;
  
      const currentIds = visibleVideos.map(v => v.id || v.src); // Use ID if available
      const unused = videos.filter(v => !currentIds.includes(v.id || v.src));
  
      if (unused.length === 0) return; // No unseen videos left
  
      const newVideo = unused[Math.floor(Math.random() * unused.length)];
      const replaceIndex = Math.floor(Math.random() * MAX_DISPLAY);
  
      const next = [...visibleVideos];
      next[replaceIndex] = newVideo;
      setVisibleVideos(next);
    }, 10000);
  
    return () => clearInterval(interval);
  }, [videos, visibleVideos]);
  

  // prevent multiple playing videos at the same time 
  useEffect(() => {
    const videos = document.querySelectorAll("video");
    const videoStates = new Map(); // Track which videos were playing
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
  
        if (entry.isIntersecting) {
          // Resume only if previously playing
          if (videoStates.get(video)) {
            video.play();
          }
        } else {
          // Save state if playing, then pause
          videoStates.set(video, !video.paused);
          video.pause();
        }
      });
    }, {
      threshold: 0.5 // Adjust depending on how much visibility you want
    });
  
    videos.forEach((video) => observer.observe(video));
  
    return () => {
      videos.forEach((video) => observer.unobserve(video));
      observer.disconnect();
    };
  }, []);
  
  

  return (
    <div className="video-grid">
        <span className="watch-container">
  <button className="watch-button">▶</button>
  <span className="watch-label">View In Gallery</span>
</span>
      {visibleVideos.map((video, idx) => (
        <div className={`video-slot video-${idx + 1}`} key={idx}>
          <video controls poster={`${baseURL}${video.thumbnail}`}>
            <source src={`${baseURL}${video.src}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
};

export default VideoGallery;

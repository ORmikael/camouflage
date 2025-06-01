import React, { useEffect, useState, useRef } from 'react';
import { baseURL } from '../utils/config';
import '../assets/css/videogallery.css';

const MAX_DISPLAY = 8;

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [visibleVideos, setVisibleVideos] = useState([]);
  const [playing, setPlaying] = useState({});
  const [muted, setMuted] = useState({});
  const [progress, setProgress] = useState({});

  const videoRefs = useRef([]);

  // ===============================
  // FETCH VIDEO DATA
  // ===============================
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

  // ===============================
  // RANDOM SWAP LOGIC
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      if (videos.length <= MAX_DISPLAY) return;

      const currentIds = visibleVideos.map(v => v.id || v.src);
      const unused = videos.filter(v => !currentIds.includes(v.id || v.src));
      if (unused.length === 0) return;

      const newVideo = unused[Math.floor(Math.random() * unused.length)];
      const replaceIndex = Math.floor(Math.random() * MAX_DISPLAY);

      const next = [...visibleVideos];
      next[replaceIndex] = newVideo;
      setVisibleVideos(next);
    }, 10000);

    return () => clearInterval(interval);
  }, [videos, visibleVideos]);

  // ===============================
  // AUTOPAUSE BASED ON VISIBILITY
  // ===============================
  useEffect(() => {
    const videoEls = videoRefs.current;
    const videoStates = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const vid = entry.target;
          if (entry.isIntersecting) {
            if (videoStates.get(vid)) vid.play();
          } else {
            videoStates.set(vid, !vid.paused);
            vid.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoEls.forEach(v => v && observer.observe(v));

    return () => {
      videoEls.forEach(v => v && observer.unobserve(v));
      observer.disconnect();
    };
  }, [visibleVideos]);

  // ===============================
  // VIDEO EVENT LISTENER: PROGRESS TRACKING
  // ===============================
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;

      const updateProgress = () => {
        setProgress(prev => ({
          ...prev,
          [idx]: (vid.currentTime / vid.duration) * 100 || 0
        }));
      };

      vid.addEventListener('timeupdate', updateProgress);
      return () => vid.removeEventListener('timeupdate', updateProgress);
    });
  }, [visibleVideos]);

  // ===============================
  // CONTROL FUNCTIONS
  // ===============================
  const togglePlay = (idx) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      setPlaying(p => ({ ...p, [idx]: true }));
    } else {
      vid.pause();
      setPlaying(p => ({ ...p, [idx]: false }));
    }
  };

  const toggleMute = (idx) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;

    vid.muted = !vid.muted;
    setMuted(m => ({ ...m, [idx]: vid.muted }));
  };

  const handleSeek = (e, idx) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;

    const val = parseFloat(e.target.value);
    vid.currentTime = (val / 100) * vid.duration;
  };

  const toggleFullscreen = (idx) => {
    const vid = videoRefs.current[idx];
    if (!vid) return;

    if (vid.requestFullscreen) vid.requestFullscreen();
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="video-grid">
      <span className="watch-container">
        <button className="watch-button">▶</button>
        <span className="watch-label">View In Gallery</span>
      </span>

      {visibleVideos.map((video, idx) => (
        <div className={`video-slot video-${idx + 1}`} key={idx}>
          <div className="custom-video-wrapper">
            <video
              ref={(ref) => (videoRefs.current[idx] = ref)}
              poster={`${baseURL}${video.thumbnail}`}
              onClick={() => togglePlay(idx)}
            >
              <source src={`${baseURL}${video.src}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <div className="custom-controls">
  <button id="play-toggle" onClick={() => togglePlay(idx)}>
{playing[idx] ? '⏸' : '▶'}
  </button>

  <input
    id="seek-bar"
    type="range"
    min="0"
    max="100"
    value={progress[idx] || 0}
    onChange={(e) => handleSeek(e, idx)}
  />

  <button id="mute-toggle" onClick={() => toggleMute(idx)}>
    {muted[idx] ? '🔇' : '🔊'}
  </button>

  <button id="fullscreen-toggle" onClick={() => toggleFullscreen(idx)}>
    ⛶
  </button>
</div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGallery;

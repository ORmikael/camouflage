import React, { useState } from 'react';
import "../assets/css/mediauploader.css";
import { baseURL } from '../utils/config';

const MediaUploader = () => {
  const [mediaClass, setMediaClass] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const [allMedia, setAllMedia] = useState([]);
  const [singleMediaId, setSingleMediaId] = useState('');
  const [singleMedia, setSingleMedia] = useState(null);

  // ================================
  // HANDLE MEDIA UPLOAD
  // ================================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!mediaClass || !uploadedBy || !file) return;

    const formData = new FormData();
    formData.append("media_class", mediaClass);
    formData.append("uploaded_by", uploadedBy);
    formData.append("file", file);

    try {
      const res = await fetch(`${baseURL}/api/media/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  // ================================
  // FETCH ALL MEDIA
  // ================================
  const fetchAllMedia = async () => {
    try {
      const res = await fetch(`${baseURL}/api/media/all`);
      const data = await res.json();
      if (data.status === "success") {
        setAllMedia(data.media);
      }
    } catch (err) {
      console.error("[FETCH ALL] ❌ Error:", err);
    }
  };

  // ================================
  // FETCH SINGLE MEDIA AND EMBED
  // ================================
  const fetchSingleMedia = async (fileId, targetSelector) => {
    try {
      const res = await fetch(`${baseURL}/api/media/embed?file_id=${fileId}`);
      const data = await res.json();
      if (data.status === "success") {
        setSingleMedia(data);
        const target = document.querySelector(targetSelector);
        if (target) target.src = data.media_url;
      }
    } catch (err) {
      console.error("[FETCH ONE] ❌ Error:", err);
    }
  };

  return (
    <div className="media-uploader">
      <h2>Media Upload</h2>

      {/* ===================== */}
      {/* UPLOAD FORM */}
      {/* ===================== */}
      <form onSubmit={handleUpload}>
        <div>
          <label>Media Class:</label>
          <select value={mediaClass} onChange={(e) => setMediaClass(e.target.value)}>
            <option value="">Select Class</option>
            <option value="avatar">Avatar</option>
            <option value="package-img">Package Image</option>
            <option value="destination-img">Destination Image</option>
            <option value="itenary-img">Itenary Image</option>
            <option value="package-highlights">Package Highlights</option>
            <option value="video-documentary">Video Documentary</option>
            <option value="video-highlights">Video Highlights</option>
            <option value="destination-highlights">Destination Highlights</option>
          </select>
        </div>
        <div>
          <label>Uploaded By:</label>
          <input type="text" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} />
        </div>
        <div>
          <label>File:</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit">Upload</button>
      </form>

      {/* ===================== */}
      {/* FETCH ALL MEDIA */}
      {/* ===================== */}
      <div className="fetch-section">
        <h3>All Media</h3>
        <button onClick={fetchAllMedia}>Fetch All</button>
        {allMedia.length > 0 && (
          <ul>
            {allMedia.map((item) => (
              <li key={item.id}>
                <strong>{item.filename}</strong>
                {item.media_url && (
                  <>
                    {" — "}
                    <a href={item.media_url} target="_blank" rel="noopener noreferrer">View</a>
                    {" | "}
                    <button onClick={() => fetchSingleMedia(item.id, '#embed-target')}>Embed</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ===================== */}
      {/* EMBED TARGET PREVIEW */}
      {/* ===================== */}
      <div style={{ marginTop: "2rem" }}>
        <h4>Preview Embed Target:</h4>
        <img id="embed-target" alt="Media preview will appear here" width="300" />
      </div>
    </div>
  );
};

export default MediaUploader;

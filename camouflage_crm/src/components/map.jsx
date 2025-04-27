import React from 'react';
// import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import '../assets/css/map.css'; // ✅ Important: include Leaflet's CSS

function TourMap() {
  return (
    <MapContainer center={[ -1.286389, 36.817223 ]}  zoom={10} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}

export default TourMap;

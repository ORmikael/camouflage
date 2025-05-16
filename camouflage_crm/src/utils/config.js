// src/utils/config.js

export const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.camotrailsafari.co.ke' // or your production backend domain
  : 'http://localhost:5000';         // for local development

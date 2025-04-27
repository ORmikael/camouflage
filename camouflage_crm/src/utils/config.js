// src/utils/config.js

export const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://your-s3-bucket-url.com' // or your production backend domain
  : 'http://localhost:5000';         // for local development

// Centralised API base URL.
// In production (Netlify), set REACT_APP_API_URL to your Render URL,
// e.g. REACT_APP_API_URL=https://chessbet-api.onrender.com
// Locally it falls back to the dev server.
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

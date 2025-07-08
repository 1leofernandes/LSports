module.exports = {
    apiBaseUrl: process.env.API_BASE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://resenha-backend.onrender.com')
  };
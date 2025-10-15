const isRenderDeployment = () => {
  return (
    typeof window !== 'undefined' && 
    (window.location.hostname.includes('onrender.com') || 
     window.location.hostname.includes('fixit-37b4.on.render.com') ||
     window.location.hostname.includes('fixit-6c7l.on.render.com'))
  ) || 
  (typeof process !== 'undefined' && 
   process.env.RENDER === 'true'
  );
};

export const API_BASE_URL = isRenderDeployment() 
  ? 'https://fixit-37b4.on.render.com/api'
  : 'http://localhost:5000/api';

export const FRONTEND_BASE_URL = isRenderDeployment()
  ? 'https://fixit-37b4.on.render.com'
  : 'http://localhost:8080';

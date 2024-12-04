import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loadingScreen from '../assets/loading-screen.png';
import pantrypalsLogo from '../assets/pantrypals.png';

const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    
    const timer = setTimeout(() => {
      // If token exists, redirect to home, otherwise to login
      navigate(token ? '/home' : '/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0 -top-2 flex items-center justify-center">
        <img 
          src={loadingScreen} 
          alt="Background" 
          className="w-full h-[100%] object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen">
        <div className="flex-grow"></div> {/* Spacer */}
        
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src={pantrypalsLogo} 
              alt="PantryPals Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-white text-3xl font-bold">PANTRYPALS</h1>
          </div>
          <p className="text-white text-l">Cook, Share, and Savor Together</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
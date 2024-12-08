import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthChoice = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleSocialAuth = () => {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 2000); // Modal will disappear after 2 seconds
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <img 
        src="/images/background.png" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Coming Soon Modal */}
      {showModal && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/80 text-white px-6 py-4 rounded-lg z-50 text-center">
          This feature will be available soon
        </div>
      )}

      {/* Content */}
      <div className="relative h-screen flex flex-col justify-end pb-12 px-6">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/images/pantrypals.png" 
            alt="PantryPals Logo" 
            className="w-8 h-8"
          />
          <span className="text-white text-xl font-bold ml-2">PANTRYPALS</span>
        </div>

        {/* Heading */}
        <h1 className="text-white text-2xl font-bold text-center mb-8">
          Cook with Confidence
        </h1>

        {/* Auth Buttons */}
        <div className="space-y-3">
          {/* Social Buttons Row */}
          <div className="flex space-x-3 mb-3">
            {/* Google Button */}
            <button 
              onClick={handleSocialAuth}
              className="w-1/2 bg-white flex items-center justify-center py-3 px-4 rounded-full"
            >
              <img 
                src="/images/google-logo.png" 
                alt="Google" 
                className="w-5 h-5"
              />
            </button>

            {/* Facebook Button */}
            <button 
              onClick={handleSocialAuth}
              className="w-1/2 bg-[#1877F2] flex items-center justify-center py-3 px-4 rounded-full"
            >
              <img 
                src="/images/facebook-logo.png" 
                alt="Facebook" 
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Email Signup Button */}
          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-white text-black font-bold py-3 px-4 rounded-full"
          >
            Sign Up with Email
          </button>
        </div>

        {/* Login Link */}
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 text-white text-center w-full"
        >
          Already have an account? <span className="underline">Log In</span>
        </button>

        {/* Terms */}
        <p className="mt-6 text-white/80 text-xs text-center px-8">
          By signing up, you agree to our{' '}
          <span className="underline">Terms of Service</span> and{' '}
          <span className="underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default AuthChoice; 
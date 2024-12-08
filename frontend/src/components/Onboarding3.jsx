import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding3 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-400 px-6 py-8 flex flex-col">
      {/* Back Button - moved to left */}
      <div className="flex justify-start">
        <button 
          onClick={() => navigate('/onboarding2')} 
          className="text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      </div>

      {/* Main Image - increased width */}
      <div className="flex justify-center -mx-6">
        <img
          src="/images/onboarding3.png"
          alt="Recipe Library"
          className="w-screen object-contain"
        />
      </div>

      {/* Heading Section */}
      <div className="flex flex-col items-center text-center -mt-12">
        <h1 className="text-white text-2xl font-bold mb-3">
          Your Personal Recipe Library
        </h1>
        <p className="text-white text-sm opacity-90">
          Save and access all your favorite recipes in one spot.
        </p>
      </div>

      {/* Navigation Section - removed dots, only Get Started button */}
      <div className="mt-auto">
        <button 
          onClick={() => navigate('/login')} 
          className="w-full bg-white text-orange-400 px-6 py-3 rounded-full text-sm font-bold"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Onboarding3; 
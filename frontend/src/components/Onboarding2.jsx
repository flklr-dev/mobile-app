import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding2 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-400 px-6 py-8 flex flex-col">
      {/* Main Image */}
      <div className="flex justify-center mt-4">
        <img
          src="/images/onboarding2.png"
          alt="Meal Plan"
          className="w-[600px] h-[400px] object-contain"
        />
      </div>

      {/* Heading Section */}
      <div className="flex flex-col items-center mt-8 text-center">
        <h1 className="text-white text-2xl font-bold mb-3">
          Plan Your Weekly Meals
        </h1>
        <p className="text-white text-sm opacity-90">
          Easily add recipes to your meal plan and organize your week
        </p>
      </div>

      {/* Navigation Section */}
      <div className="mt-auto flex items-center justify-between">
        <button 
          onClick={() => navigate('/login')} 
          className="text-white underline text-sm"
        >
          Skip
        </button>
        
        <div className="flex space-x-2 ml-12">
          <div 
            onClick={() => navigate('/onboarding1')}
            className="w-2 h-2 rounded-full bg-white/50 cursor-pointer"
          ></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white/50"></div>
        </div>

        <button 
          onClick={() => navigate('/onboarding3')} 
          className="bg-white text-orange-400 px-6 py-2 rounded-full text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Onboarding2; 
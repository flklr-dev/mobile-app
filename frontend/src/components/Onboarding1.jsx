import React from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding1 = () => {
  const navigate = useNavigate();

  const cards = [
    { id: 1, title: 'Budget', image: '/images/save-money.png' },
    { id: 2, title: 'Low Carb', image: '/images/low-carb.png' },
    { id: 3, title: 'Festive', image: '/images/festive.png' },
    { id: 4, title: 'Fresh Crisp', image: '/images/fresh-crisp.png' },
    { id: 5, title: 'Meal Prep', image: '/images/meal-prep-food.png' },
    { id: 6, title: 'One Pot', image: '/images/one-pot.png' },
    { id: 7, title: 'Seasonal', image: '/images/seasonal-picks.png' },
    { id: 8, title: 'Vegan', image: '/images/vegan.png' },
    { id: 9, title: 'Under 20', image: '/images/under-20.png' },
  ];

  return (
    <div className="min-h-screen bg-orange-400 px-6 py-8 flex flex-col">
      {/* Grid of Cards */}
      <div className="grid grid-cols-3 gap-2 mt-8">
        {cards.map((card) => (
          <div key={card.id} className="flex flex-col items-center">
            <div className="bg-white p-2 rounded-2xl w-full">
              <img
                src={card.image}
                alt={card.title}
                className="w-full aspect-square object-cover rounded-xl mb-2"
              />
              <span className="text-[#463C33] text-sm text-center block">
                {card.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Heading Section */}
      <div className="flex flex-col items-center mt-10 text-center">
        <h1 className="text-white text-2xl font-bold mb-3">
          Discover Recipes You'll Love
        </h1>
        <p className="text-white text-sm opacity-90">
          Get recipe recommendations based on your tastes and meal plans
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
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div 
            onClick={() => navigate('/onboarding2')}
            className="w-2 h-2 rounded-full bg-white/50 cursor-pointer"
          ></div>
          <div 
            onClick={() => navigate('/onboarding3')}
            className="w-2 h-2 rounded-full bg-white/50 cursor-pointer"
          ></div>
        </div>

        <button 
          onClick={() => navigate('/onboarding2')} 
          className="bg-white text-orange-400 px-6 py-2 rounded-full text-sm font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Onboarding1; 
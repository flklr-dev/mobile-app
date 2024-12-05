import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNavbar from './BottomNavbar';
import { useNavigate } from 'react-router-dom';

const SearchScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input focus
  const handleSearchFocus = () => {
    navigate('/search-results', { 
      state: { 
        query: searchQuery,
        type: 'all'
      }
    });
  };

  // Handle category/ingredient click
  const handleCategoryClick = (category, type) => {
    navigate('/search-results', { 
      state: { 
        query: category,
        type: type // 'category' or 'ingredient'
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Search Input */}
      <div className="mt-24 px-4 py-4">
        <div 
          className="bg-white flex items-center p-2 rounded-full shadow-md border-2 border-orange-500"
          onClick={handleSearchFocus}
        >
          <FaSearch size={20} className="text-orange-500 mr-3" />
          <input
            type="text"
            placeholder="Search Recipes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="w-full text-gray-700 focus:outline-none"
          />
        </div>
      </div>

      {/* By Ingredients Section */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-semibold text-orange-600">By Ingredients</h2>
        <div className="flex space-x-2 overflow-x-auto py-4 no-scrollbar">
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Egg', 'ingredient')}
          >
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Chicken', 'ingredient')}
          >
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Pasta', 'ingredient')}
          >
            <img src="src/assets/images/pasta.png" alt="Pasta" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Pasta</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Egg', 'ingredient')}
          >
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Chicken', 'ingredient')}
          >
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Pasta', 'ingredient')}
          >
            <img src="src/assets/images/pasta.png" alt="Pasta" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Pasta</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Egg', 'ingredient')}
          >
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div 
            className="flex flex-col items-center min-w-[80px] cursor-pointer"
            onClick={() => handleCategoryClick('Chicken', 'ingredient')}
          >
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => navigate('/all-ingredients')}
            className="text-orange-500 text-sm font-medium underline"
          >
            Show all ingredients
          </button>
        </div>
      </section>

      {/* By Meal Section */}
      <section className="px-4 py-6 pt-0 pb-24">
        <h2 className="text-xl font-semibold mb-4 text-orange-600">By Meal</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col space-y-0">
            <div 
              onClick={() => handleCategoryClick('Breakfast', 'category')} 
              className="cursor-pointer"
            >
              <img
                src="src/assets/images/breakfast.png"
                alt="Breakfast"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            <div 
              onClick={() => handleCategoryClick('Lunch', 'category')}
              className="cursor-pointer"
            >
              <img
                src="src/assets/images/lunch.png"
                alt="Lunch"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            <div 
              onClick={() => handleCategoryClick('Dinner', 'category')}
              className="cursor-pointer"
            >
              <img
                src="src/assets/images/dinner.png"
                alt="Dinner"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-0">
            <div 
              onClick={() => handleCategoryClick('Snacks', 'category')}
              className="cursor-pointer"
            >
              <img
                src="src/assets/images/snacks.png"
                alt="Snacks"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            <div 
              onClick={() => handleCategoryClick('Desserts', 'category')}
              className="cursor-pointer"
            >
              <img
                src="src/assets/images/desserts.png"
                alt="Desserts"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <BottomNavbar />
    </div>
  );
};

export default SearchScreen;

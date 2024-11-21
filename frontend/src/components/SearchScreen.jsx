import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNavbar from './BottomNavbar';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [setRecipes] = useState([]); // State to store fetched recipes

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://localhost:5000/recipes');  // Fetch from the server
        const data = await response.json();
        setRecipes(data);  // Set the fetched recipes to the state
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
  }, []);  // Empty dependency array means this runs once after the component mounts

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Search Input */}
      <div className="mt-24 px-4 py-4">
        <div className="bg-white flex items-center p-2 rounded-full shadow-md border-2 border-orange-500">
          <FaSearch size={20} className="text-orange-500 mr-3" />
          <input
            type="text"
            placeholder="Search Recipes"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-gray-700 focus:outline-none"
          />
        </div>
      </div>

      {/* By Ingredients Section */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-semibold text-orange-600">By Ingredients</h2>
        <div className="flex space-x-2 overflow-x-auto py-4">
          {/* Each ingredient */}
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/pasta.png" alt="Pasta" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Pasta</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/pasta.png" alt="Pasta" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Pasta</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/egg.png" alt="Egg" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Egg</label>
          </div>
          <div className="flex flex-col items-center min-w-[80px]">
            <img src="src/assets/images/chicken.png" alt="Chicken" className="w-14 h-14 object-cover rounded-full" />
            <label className="text-[#463C33] text-sm">Chicken</label>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <button className="text-orange-500 underline">
            Show all recipes
          </button>
        </div>
      </section>

      {/* By Meal Section */}
      <section className="px-4 py-6 pt-0 pb-24">
        <h2 className="text-xl font-semibold mb-4 text-orange-600">By Meal</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Column 1 */}
          <div className="flex flex-col space-y-0">
            {/* Breakfast */}
            <div>
              <img
                src="src/assets/images/breakfast.png"
                alt="Breakfast"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            {/* Lunch */}
            <div>
              <img
                src="src/assets/images/lunch.png"
                alt="Lunch"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            {/* Dinner */}
            <div>
              <img
                src="src/assets/images/dinner.png"
                alt="Dinner"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
          </div>
          {/* Column 2 */}
          <div className="flex flex-col space-y-0">
            {/* Snacks */}
            <div>
              <img
                src="src/assets/images/snacks.png"
                alt="Snacks"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
            {/* Desserts */}
            <div>
              <img
                src="src/assets/images/desserts.png"
                alt="Desserts"
                className="w-full h-[85%] object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation Bar */}
      <BottomNavbar />
    </div>
  );
};

export default SearchScreen;

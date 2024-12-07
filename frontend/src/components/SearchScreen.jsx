import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import Header from '../components/Header';
import BottomNavbar from './BottomNavbar';
import { useNavigate } from 'react-router-dom';

const SearchScreen = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchFocus = () => {
    navigate('/search-results', { 
      state: { 
        query: searchQuery,
        type: 'all'
      }
    });
  };

  const handleCategoryClick = (category, type) => {
    navigate('/search-results', { 
      state: { 
        query: category,
        type: type
      }
    });
  };

  const ingredients = [
    { id: 1, name: "Egg", image: "/images/egg.png" },
    { id: 2, name: "Chicken", image: "/images/chicken.png" },
    { id: 3, name: "Pasta", image: "/images/pasta.png" },
    { id: 4, name: "Rice", image: "/images/rice.png" },
    { id: 5, name: "Beef", image: "/images/beef.png" },
    { id: 6, name: "Pork", image: "/images/pork.png" },
    { id: 7, name: "Banana", image: "/images/banana.png" },
    { id: 8, name: "Milk", image: "/images/milk.png" },
    { id: 9, name: "Cheese", image: "/images/cheese.png" },
    { id: 10, name: "Chocolate", image: "/images/chocolate.png" },
    { id: 11, name: "Salmon", image: "/images/salmon.png" },
    { id: 12, name: "Shrimp", image: "/images/shrimp.png" },
    { id: 13, name: "Strawberries", image: "/images/strawberry.png" },
    { id: 14, name: "Grapes", image: "/images/grapes.png" },
    { id: 15, name: "Potato", image: "/images/potato.png" },
    { id: 16, name: "Tomato", image: "/images/tomato.png" },
    { id: 17, name: "Peanut Butter", image: "/images/peanut-butter.png" },
    { id: 18, name: "Bread", image: "/images/bread.png" },
    { id: 19, name: "Brocolli", image: "/images/brocolli.png" },
    { id: 20, name: "Carrot", image: "/images/carrot.png" },
    { id: 21, name: "Coconut Milk", image: "/images/coconut-milk.png" },
    { id: 22, name: "Green Beans", image: "/images/green-beans.png" },
    { id: 23, name: "Spinach", image: "/images/spinach.png" },
    { id: 24, name: "Lettuce", image: "/images/lettuce.png" },
    { id: 25, name: "Pineapple", image: "/images/pineapple.png" },
    { id: 26, name: "Cucumber", image: "/images/cucumber.png" },
    { id: 27, name: "Sweet Potato", image: "/images/sweet-potato.png" },
    { id: 28, name: "Corn", image: "/images/corn.png" },
    { id: 29, name: "Eggplant", image: "/images/eggplant.png" },
    { id: 30, name: "Squash", image: "/images/squash.png" },
    { id: 31, name: "Kangkong", image: "/images/kangkong.png" },
    { id: 32, name: "Tofu", image: "/images/tofu.png" },
  ];

  const meals = [
    { name: 'Breakfast', image: '/images/breakfast.png' },
    { name: 'Lunch', image: '/images/lunch.png' },
    { name: 'Dinner', image: '/images/dinner.png' },
    { name: 'Snacks', image: '/images/snacks.png' },
    { name: 'Desserts', image: '/images/desserts.png' }
  ];

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
        <h2 className="text-xl font-bold text-orange-600">By Ingredients</h2>
        <div className="flex space-x-2 overflow-x-auto py-4 no-scrollbar">
          {ingredients.map((ingredient) => (
            <div 
              key={ingredient.id}
              className="flex flex-col items-center min-w-[80px] cursor-pointer"
              onClick={() => handleCategoryClick(ingredient.name, 'ingredient')}
            >
              <img 
                src={ingredient.image}
                alt={ingredient.name} 
                className="w-14 h-14 object-cover rounded-full"
              />
              <label className="text-[#463C33] text-sm text-center">{ingredient.name}</label>
            </div>
          ))}
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

      {/* By Meal Section - Updated styling */}
      <section className="px-4 py-6 pt-0 pb-24">
        <h2 className="text-xl font-bold mb-4 text-orange-600">By Meal</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            {meals.slice(0, 3).map((meal) => (
              <div 
                key={meal.name}
                onClick={() => handleCategoryClick(meal.name, 'category')} 
                className="relative cursor-pointer h-[100px] rounded-2xl overflow-hidden bg-[#463C33]"
              >
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20">
                  <span className="absolute top-3 left-3 text-white text-xl font-bold">
                    {meal.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {meals.slice(3).map((meal) => (
              <div 
                key={meal.name}
                onClick={() => handleCategoryClick(meal.name, 'category')}
                className="relative cursor-pointer h-[100px] rounded-2xl overflow-hidden bg-[#463C33]"
              >
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20">
                  <span className="absolute top-3 left-3 text-white text-xl font-bold">
                    {meal.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomNavbar />
    </div>
  );
};

export default SearchScreen;

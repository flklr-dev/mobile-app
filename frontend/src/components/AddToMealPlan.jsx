import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AddToMealPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;
  const preSelectedCategory = location.state?.preSelectedCategory;

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    preSelectedCategory ? [preSelectedCategory] : []
  );

  // Get week days starting from today
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const toggleDay = (date) => {
    const dateStr = date.toISOString().split('T')[0]; // Get just the date part
    setSelectedDays(prev => 
      prev.includes(dateStr) 
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create meal plan entries for each selected day and category combination
      const mealPlanEntries = selectedDays.flatMap(date => 
        selectedCategories.map(category => ({
          recipeId: recipe._id,
          date: date,
          category: category
        }))
      );

      await axios.post('http://localhost:5000/auth/add-meal-plan', {
        mealPlans: mealPlanEntries
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Added to meal plan successfully!', {
        position: "top-center",
        autoClose: 2000
      });

      // Navigate back to meal plan after short delay
      setTimeout(() => {
        navigate('/meal-plan');
      }, 2000);

    } catch (error) {
      console.error('Error adding to meal plan:', error);
      toast.error('Failed to add to meal plan. Please try again.', {
        position: "top-center"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* Simple Header - removed h1 */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <FaChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="pt-24 px-4 pb-10">
        {/* Recipe Preview - updated styling */}
        <div className="mb-6">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden">
            <img
              src={`http://localhost:5000/${recipe?.image}`}
              alt={recipe?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-xl font-bold text-white">{recipe?.title}</h2>
            </div>
          </div>
        </div>

        {/* Week Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">When would you like to cook this?</h3>
          <div className="mb-2 text-center">
            <span className="text-gray-600 font-medium">This Week</span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex space-x-3 py-2">
              {getWeekDays().map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleDay(date)}
                    className={`flex-shrink-0 w-16 p-3 rounded-xl transition-colors ${
                      selectedDays.includes(dateStr)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold mt-1">
                      {date.getDate()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Meal Categories */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Which meal is this for?</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'].map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category.toLowerCase())}
                className={`p-4 rounded-xl text-center font-medium transition-colors ${
                  selectedCategories.includes(category.toLowerCase())
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={selectedDays.length === 0 || selectedCategories.length === 0}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold disabled:bg-gray-300 transition-colors mb-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AddToMealPlan; 
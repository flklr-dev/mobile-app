import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import api from '../config/axios';

const AddToMealPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;
  const preSelectedCategory = location.state?.preSelectedCategory;

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    preSelectedCategory ? [preSelectedCategory] : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

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
    const dateStr = date.toISOString().split('T')[0];
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
    if (isSubmitting) return;

    // Validate selections
    if (selectedDays.length === 0) {
      setStatusMessage('Please select at least one day');
      setStatusType('error');
      setShowStatusModal(true);
      return;
    }

    if (selectedCategories.length === 0) {
      setStatusMessage('Please select at least one meal category');
      setStatusType('error');
      setShowStatusModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create meal plan entries for each selected day and category combination
      const mealPlanEntries = selectedDays.flatMap(date => 
        selectedCategories.map(category => ({
          recipeId: recipe._id,
          date: date,
          category: category
        }))
      );

      await api.post('/auth/add-meal-plan', {
        mealPlans: mealPlanEntries
      });

      // Success modal
      setStatusMessage('Added to meal plan successfully!');
      setStatusType('success');
      setShowStatusModal(true);

      // Navigate back to meal plan after short delay
      setTimeout(() => {
        navigate('/meal-plan');
      }, 2000);

    } catch (error) {
      console.error('Error adding to meal plan:', error);
      
      // Error modal
      setStatusMessage(error.response?.data?.message || 'Failed to add to meal plan');
      setStatusType('error');
      setShowStatusModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusModal = () => {
    if (!showStatusModal) return null;

    const isSuccess = statusType === 'success';
    const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
    const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={`w-[90%] max-w-md p-6 rounded-xl shadow-xl bg-white`}>
          <div className="flex flex-col items-center space-y-4">
            {isSuccess ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-16 w-16 ${iconColor}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-16 w-16 ${iconColor}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
            
            <p className={`text-center text-lg font-semibold ${textColor}`}>
              {statusMessage}
            </p>
            
            <button 
              onClick={() => setShowStatusModal(false)} 
              className={`px-6 py-2 rounded-lg ${
                isSuccess 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Modal */}
      <StatusModal />

      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <FaChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="pt-24 px-4 pb-10">
        {/* Recipe Preview */}
        <div className="mb-6">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden">
            <img
              src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.image}`}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-xl font-bold text-white">{recipe.title}</h2>
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
                const isSelected = selectedDays.includes(dateStr);
                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleDay(date)}
                    className={`flex-shrink-0 w-16 p-3 rounded-xl transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-800 hover:bg-gray-50'
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
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'].map((category) => {
              const isSelected = selectedCategories.includes(category.toLowerCase());
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category.toLowerCase())}
                  className={`p-4 rounded-xl text-center font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={selectedDays.length === 0 || selectedCategories.length === 0 || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold transition-colors mb-4 ${
            selectedDays.length === 0 || selectedCategories.length === 0 || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default AddToMealPlan;
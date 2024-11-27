import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import BottomNavbar from './BottomNavbar';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MealPlanScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
    desserts: []
  });
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [recipeToAdd, setRecipeToAdd] = useState(null);

  useEffect(() => {
    fetchMealPlans();
  }, [selectedDay]);

  const fetchMealPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const dateStr = selectedDay.toISOString().split('T')[0];
      
      const response = await axios.get(
        `http://localhost:5000/auth/meal-plans/${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Organize meals by category
      const organizedMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        desserts: []
      };

      response.data.forEach(plan => {
        if (plan.recipeId && organizedMeals[plan.category.toLowerCase()]) {
          organizedMeals[plan.category.toLowerCase()].push({
            ...plan.recipeId,
            planId: plan._id
          });
        }
      });

      setMealPlan(organizedMeals);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast.error('Failed to load meal plans');
    }
  };

  const handleAddToMealPlan = (mealType) => {
    if (recipeToAdd) {
      setMealPlan(prev => ({
        ...prev,
        [mealType]: [...prev[mealType], recipeToAdd]
      }));
      setShowMealSelector(false);
      setRecipeToAdd(null);
    }
  };

  const handleDeleteMeal = async (mealType, index, planId) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this meal from your plan?');
    
    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const dateStr = selectedDay.toISOString().split('T')[0];

        // Delete from backend using planId instead of mealId
        await axios.delete(
          `http://localhost:5000/auth/meal-plans/${dateStr}/${planId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Update local state
        setMealPlan(prev => ({
          ...prev,
          [mealType]: prev[mealType].filter((_, i) => i !== index)
        }));
        
        toast.success('Meal removed from plan', {
          position: "top-center",
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error deleting meal:', error);
        toast.error('Failed to remove meal from plan', {
          position: "top-center",
          autoClose: 2000
        });
      }
    }
  };

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric' }).format(date);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDay.toDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <ToastContainer />
      <Header />

      {/* Week Selector */}
      <div className="pt-20 px-4">
        <h1 className="text-2xl font-extrabold text-orange-500 mb-6 mt-4">Meal Plan</h1>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 py-4">
            {getWeekDays().map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDay(date)}
                className={`flex flex-col items-center min-w-[4.5rem] p-3 rounded-xl transition-all ${
                  isSelected(date)
                    ? 'bg-orange-500 text-white'
                    : isToday(date)
                    ? 'bg-orange-100 text-orange-500'
                    : 'bg-white text-gray-600'
                } ${isSelected(date) ? 'shadow-md' : 'shadow-sm'}`}
              >
                <span className="text-xs font-medium">{formatDate(date).split(' ')[0]}</span>
                <span className="text-lg font-bold mt-1">{formatDate(date).split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Meal Categories */}
        <div className="space-y-4 mt-4">
          {Object.entries({
            breakfast: { title: 'Breakfast', time: '6:00 - 10:00 AM' },
            lunch: { title: 'Lunch', time: '12:00 - 2:00 PM' },
            dinner: { title: 'Dinner', time: '6:00 - 8:00 PM' },
            snacks: { title: 'Snacks', time: 'Anytime' },
            desserts: { title: 'Desserts', time: 'After Meals' }
          }).map(([key, { title, time }]) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                  <p className="text-sm text-gray-500">{time}</p>
                </div>
                <button 
                  className="bg-orange-50 p-2 rounded-full text-orange-500 hover:bg-orange-100 transition-colors"
                  onClick={() => navigate('/category-recipes', { state: { category: title } })}
                >
                  <FaPlus size={20} />
                </button>
              </div>

              {mealPlan[key.toLowerCase()].length > 0 ? (
                <div className="space-y-2">
                  {mealPlan[key.toLowerCase()].map((meal, index) => (
                    <div 
                      key={`${key}-${meal.planId}-${index}`} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/recipes/${meal._id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={`http://localhost:5000/${meal.image}`}
                          alt={meal.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{meal.title}</h4>
                          <p className="text-sm text-gray-500">{meal.calories} calories</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation when clicking delete
                          handleDeleteMeal(key.toLowerCase(), index, meal.planId);
                        }}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-400 text-sm">No meals planned</p>
                  <button 
                    className="mt-2 text-orange-500 text-sm font-medium"
                    onClick={() => navigate('/category-recipes', { state: { category: title } })}
                  >
                    Add {title.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meal Selector Modal */}
      {showMealSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add to Meal Plan</h3>
            <div className="space-y-3">
              {Object.entries({
                breakfast: 'Breakfast',
                lunch: 'Lunch',
                dinner: 'Dinner',
                snacks: 'Snacks',
                desserts: 'Desserts'
              }).map(([key, title]) => (
                <button
                  key={key}
                  onClick={() => handleAddToMealPlan(key)}
                  className="w-full p-4 text-left rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-orange-500 font-medium text-lg"
                >
                  {title}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowMealSelector(false);
                setRecipeToAdd(null);
              }}
              className="mt-4 w-full p-4 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors text-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <BottomNavbar />
    </div>
  );
};

export default MealPlanScreen; 
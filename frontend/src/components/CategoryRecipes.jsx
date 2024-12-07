import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaChevronLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import api from '../config/axios';
import 'react-toastify/dist/ReactToastify.css';

const CategoryRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/recipes");
        
        // Sort recipes: matching category first, then others
        const sortedRecipes = response.data.sort((a, b) => {
          const categoryA = a.category?.toLowerCase();
          const categoryB = b.category?.toLowerCase();
          const searchCategory = category?.toLowerCase();

          if (categoryA === searchCategory && categoryB !== searchCategory) return -1;
          if (categoryA !== searchCategory && categoryB === searchCategory) return 1;
          return 0;
        });

        setRecipes(sortedRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes", {
          position: "top-center",
          autoClose: 2000
        });
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRecipes();
    } else {
      navigate('/meal-plan');
    }
  }, [category, navigate]);

  const handleAddToMealPlan = (recipe) => {
    navigate('/add-to-meal-plan', { 
      state: { 
        recipe,
        preSelectedCategory: category.toLowerCase()
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const matchingRecipes = recipes.filter(recipe => 
    recipe.category?.toLowerCase() === category?.toLowerCase()
  );

  const otherRecipes = recipes.filter(recipe => 
    recipe.category?.toLowerCase() !== category?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <FaChevronLeft size={24} />
          </button>
        </div>
      </div>
      <ToastContainer />
      
      <div className="pt-20 px-4">
        <h1 className="text-2xl font-extrabold text-orange-500 mb-6">
          Add {category}
        </h1>

        {matchingRecipes.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              {category} Recipes
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {matchingRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe._id} 
                  recipe={recipe} 
                  handleAddToMealPlan={handleAddToMealPlan}
                />
              ))}
            </div>
          </>
        )}

        {otherRecipes.length > 0 && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              Other Recipes
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {otherRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe._id} 
                  recipe={recipe} 
                  handleAddToMealPlan={handleAddToMealPlan}
                />
              ))}
            </div>
          </>
        )}

        {recipes.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-8">
            No recipes found
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted RecipeCard component for better organization
const RecipeCard = ({ recipe, handleAddToMealPlan }) => (
  <div className="bg-[#463C33] rounded-lg shadow-md overflow-hidden h-[250px]">
    <div className="relative">
      <Link to={`/recipes/${recipe._id}`}>
        <img
          src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.image}`}
          alt={recipe.title}
          className="w-full h-28 object-cover"
        />
        <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
          {recipe.time}
        </span>
      </Link>
    </div>
    
    <Link to={`/recipes/${recipe._id}`}>
      <div className="p-2">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-1">
            <FaHeart size={12} className="text-white" />
            <span className="text-white text-xs">{recipe.likes?.length || 0}</span>
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
            <img
              src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.user?.profilePicture || 'uploads/default-profile.png'}`}
              alt={recipe.user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex flex-col justify-between h-[80px]">
          <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
            {recipe.title}
          </h3>
          
          <button 
            className="bg-white text-[#463C33] text-xs font-bold rounded-full py-2 px-4 w-full hover:bg-gray-100 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToMealPlan(recipe);
            }}
          >
            Add to Meal Plan
          </button>
        </div>
      </div>
    </Link>
  </div>
);

export default CategoryRecipes; 
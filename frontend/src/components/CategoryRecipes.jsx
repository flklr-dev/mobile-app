import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaChevronLeft } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const CategoryRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/recipes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes");
      }
    };

    fetchRecipes();
  }, []);

  const handleAddToMealPlan = (recipe) => {
    navigate('/add-to-meal-plan', { 
      state: { 
        recipe,
        preSelectedCategory: category.toLowerCase()
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Simple Header */}
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
        
        <div className="grid grid-cols-2 gap-3">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="bg-[#463C33] rounded-lg shadow-md overflow-hidden h-[250px]">
              <div className="relative">
                <Link to={`/recipes/${recipe._id}`}>
                  <img
                    src={`http://localhost:5000/${recipe.image}`}
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
                      <span className="text-white text-xs">{recipe.likes}</span>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white">
                      <img
                        src={`http://localhost:5000/${recipe.user?.profilePicture || 'uploads/default-profile.png'}`}
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
                      className="bg-white text-[#463C33] text-xs font-bold rounded-full py-2 px-4 w-full"
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRecipes; 
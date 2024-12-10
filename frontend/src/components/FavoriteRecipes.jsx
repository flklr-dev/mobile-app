import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../config/axios'; // Import the configured api instance
import Header from './Header';

const FavoriteRecipes = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [heartStates, setHeartStates] = useState({});

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get("/auth/liked-recipes");
        
        if (response.data) {
          setFavoriteRecipes(response.data);
          
          // Initialize heart states
          const initialHeartStates = {};
          response.data.forEach(recipe => {
            initialHeartStates[recipe._id] = true;
          });
          setHeartStates(initialHeartStates);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Failed to load favorite recipes", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    };

    fetchFavorites();
  }, []);

  const toggleHeart = async (recipeId) => {
    try {
      const response = await api.post(`/recipes/like/${recipeId}`);
      console.log('Like response:', response.data);

      setHeartStates(prev => ({
        ...prev,
        [recipeId]: !prev[recipeId]
      }));

      // Remove recipe from favorites list if unliked
      if (heartStates[recipeId]) {
        setFavoriteRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      }

      toast.success(
        heartStates[recipeId] ? "Recipe removed from favorites!" : "Recipe added to favorites!",
        { position: "top-center", autoClose: 2000 }
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      setHeartStates(prev => ({
        ...prev,
        [recipeId]: !prev[recipeId]
      }));
      
      toast.error("Failed to update favorite status", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      <ToastContainer />
      
      <div className="pt-20 px-4">
        <h1 className="text-2xl font-extrabold text-orange-500 mb-6">Favorite Recipes</h1>
        
        <div className="grid grid-cols-2 gap-3">
          {favoriteRecipes.map((recipe) => (
            <div key={recipe._id} className="bg-[#463C33] rounded-lg shadow-md overflow-hidden h-[250px]">
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
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleHeart(recipe._id);
                  }}
                >
                  {heartStates[recipe._id] ? (
                    <FaHeart size={16} className="text-white" />
                  ) : (
                    <FaRegHeart size={16} className="text-white" />
                  )}
                </button>
              </div>
              
              <Link to={`/recipes/${recipe._id}`}>
                <div className="p-2">
                  <div className="flex justify-between items-center my-2">
                    <div className="flex items-center space-x-1">
                      <FaHeart size={12} className="text-white" />
                      <span className="text-white text-xs">{recipe.likes}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between h-[80px]">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                      {recipe.title}
                    </h3>
                    
                    <button 
                      className="bg-white text-[#463C33] text-xs font-bold rounded-full py-1.5 px-3 w-full"
                      onClick={(e) => e.stopPropagation()}
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

export default FavoriteRecipes; 
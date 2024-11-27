import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronLeft, FaHeart, FaRegHeart, FaShare, FaClock, FaListUl, FaUtensils, FaStickyNote } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [moreRecipes, setMoreRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipeAndMore = async () => {
      try {
        const [recipeResponse, moreRecipesResponse, userResponse] = await Promise.all([
          axios.get(`http://localhost:5000/recipes/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
          axios.get('http://localhost:5000/recipes', {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
          axios.get('http://localhost:5000/auth/user', {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
        ]);

        setRecipe(recipeResponse.data);
        
        // Filter out current recipe and get random 10 recipes
        const filteredRecipes = moreRecipesResponse.data
          .filter(r => r._id !== id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);
        
        setMoreRecipes(filteredRecipes);

        // Set liked recipes
        const likedRecipeIds = new Set(userResponse.data.likedRecipes.map(r => r._id));
        setLikedRecipes(likedRecipeIds);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          navigate('/login');
        } else {
          setError(error.response?.data?.message || "Failed to load recipe");
        }
      }
    };

    fetchRecipeAndMore();
  }, [id, navigate]);

  const handleToggleLike = async (recipeId, e = null) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/recipes/like/${recipeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      setLikedRecipes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(recipeId)) {
          newSet.delete(recipeId);
        } else {
          newSet.add(recipeId);
        }
        return newSet;
      });

      // Update likes count in moreRecipes
      setMoreRecipes(prev => 
        prev.map(recipe => 
          recipe._id === recipeId 
            ? { ...recipe, likes: response.data.recipeLikes }
            : recipe
        )
      );

      // Also update main recipe likes if it's the same recipe
      if (recipe && recipe._id === recipeId) {
        setRecipe(prev => ({
          ...prev,
          likes: response.data.recipeLikes
        }));
      }

      toast.success(
        likedRecipes.has(recipeId)
          ? "Recipe removed from favorites!"
          : "Recipe added to favorites!",
        { position: "top-center", autoClose: 2000 }
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleAddToMealPlan = (recipe, e = null) => {
    if (e) {
      e.stopPropagation(); // Only stop propagation for card clicks
    }
    navigate('/add-to-meal-plan', { state: { recipe } });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-orange-500 text-white px-4 py-2 rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white">
      <ToastContainer />

      {/* Cover Image Section */}
      <div className="relative h-[40vh]">
        <img
          src={`http://localhost:5000/${recipe.image}`}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
          >
            <FaChevronLeft className="text-white" size={24} />
          </button>
          <div className="flex gap-4">
            <button className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg">
              <FaShare className="text-white" size={24} />
            </button>
            <button
              onClick={() => handleToggleLike(recipe._id)}
              className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
            >
              {likedRecipes.has(recipe._id) ? (
                <FaHeart className="text-white" size={24} />
              ) : (
                <FaRegHeart className="text-white" size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Main Info Card */}
        <div className="bg-white rounded-t-3xl shadow-lg p-6">
          {/* Stats Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full">
              <FaHeart className="text-orange-500" />
              <span className="font-semibold text-orange-500">{recipe.likes} likes</span>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full">
              <FaClock className="text-orange-500" />
              <span className="text-orange-500">{recipe.time}</span>
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-[#463C33] mb-3">{recipe.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-8">{recipe.description}</p>

          {/* Ingredients Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaListUl className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Ingredients</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl transition-all hover:bg-orange-50"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-gray-700">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaUtensils className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Cooking Instructions</h2>
            </div>
            <div className="space-y-6">
              {recipe.cookingInstructions.map((instruction, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaStickyNote className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Author Notes</h2>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl">
              <p className="text-gray-700 italic">
                {recipe.authorNotes || "No additional notes from the author."}
              </p>
            </div>
          </div>

          {/* Updated User Profile Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 mx-4">
            <div className="flex flex-col mb-4">
              <div className="flex items-center justify-between mb-3">
                <img
                  src={`http://localhost:5000/${recipe.user.profilePicture}`}
                  alt={recipe.user.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-orange-500"
                />
                <button className="text-orange-500 hover:text-orange-600 underline font-semibold transition-colors">
                  View Profile
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#463C33] break-words">{recipe.user.name}</h3>
                <span className="text-gray-500 text-sm">Recipe Creator</span>
              </div>
            </div>
            <p className="text-gray-600 break-words">
              {recipe.user.aboutMe || "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* More Recipes Section */}
      <div className="mb-20 px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#463C33]">More Recipes</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-orange-500 text-sm font-medium"
          >
            See All
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-4 pb-4">
            {moreRecipes.map((moreRecipe) => (
              <div
                key={moreRecipe._id}
                className="flex-shrink-0 w-64 bg-[#463C33] rounded-xl overflow-hidden cursor-pointer flex flex-col"
                onClick={() => navigate(`/recipes/${moreRecipe._id}`)}
              >
                <div className="relative h-40">
                  <img
                    src={`http://localhost:5000/${moreRecipe.image}`}
                    alt={moreRecipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                    <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                      {moreRecipe.time}
                    </span>
                    <button
                      onClick={(e) => handleToggleLike(moreRecipe._id, e)}
                      className="text-white bg-black/50 p-2 rounded-full"
                    >
                      {likedRecipes.has(moreRecipe._id) ? (
                        <FaHeart className="text-white" size={16} />
                      ) : (
                        <FaRegHeart size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-sm line-clamp-2 flex-1 mr-2">
                      {moreRecipe.title}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className="text-white text-xs">{moreRecipe.likes || 0}</span>
                      <FaHeart className="text-white text-xs" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className="block text-white/70 text-xs mb-2">
                      {moreRecipe.calories}
                    </span>
                    <button 
                      onClick={(e) => handleAddToMealPlan(moreRecipe, e)}
                      className="w-full text-sm bg-white text-[#463C33] py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Add to Meal Plan Button */}
      <div className="fixed bottom-4 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <button 
            onClick={() => handleAddToMealPlan(recipe)}
            className="w-full bg-orange-500 text-white font-bold rounded-full py-4 hover:bg-orange-600 transition-colors"
          >
            Add to Meal Plan
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default RecipePage; 
import { useState, useEffect } from "react";
import api from '../config/axios';
import BottomNavbar from "./BottomNavbar";
import Header from '../components/Header';
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import {FaHeart,  FaRegHeart } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { getImageUrl } from '../utils/imageUtils';

const HomeScreen = () => {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
    desserts: [],
    trendings: [],
  });

  const [trendingRecipes, setTrendingRecipes] = useState([]);  
  const [heartStates, setHeartStates] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [isLoading, setIsLoading] = useState({
    trending: true,
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true,
    desserts: true
  });

  // Fetch user's liked recipes
  const fetchUserLikedRecipes = async () => {
    try {
      console.log('Fetching user liked recipes...');
      const response = await api.get("/auth/user");
      if (response.data && response.data.likedRecipes) {
        const initialHeartStates = {};
        response.data.likedRecipes.forEach(recipe => {
          initialHeartStates[recipe._id] = true;
        });
        console.log('Initial heart states:', initialHeartStates);
        setHeartStates(initialHeartStates);
        return initialHeartStates; // Return the heart states
      }
    } catch (error) {
      console.error("Error fetching liked recipes:", error);
      return {};
    }
  };

  useEffect(() => {
    const initializeRecipes = async () => {
      try {
        // First fetch liked recipes and get the heart states
        const likedStates = await fetchUserLikedRecipes();
        console.log('Liked states fetched:', likedStates);

        // Fetch trending recipes with liked states
        const trendingResponse = await api.get("/recipes/trending");
        const trendingWithLikes = trendingResponse.data.map(recipe => ({
          ...recipe,
          isLiked: likedStates[recipe._id] || false
        }));
        console.log('Trending recipes with likes:', trendingWithLikes);
        setTrendingRecipes(trendingWithLikes);
        setIsLoading(prev => ({ ...prev, trending: false }));

        // Fetch other categories
        const categories = ["breakfast", "lunch", "dinner", "snacks", "desserts"];
        const results = await Promise.all(
          categories.map(async (category) => {
            const response = await api.get(`/recipes/category/${category}`);
            return response.data.map(recipe => ({
              ...recipe,
              isLiked: likedStates[recipe._id] || false
            }));
          })
        );

        setRecipes({
          breakfast: results[0],
          lunch: results[1],
          dinner: results[2],
          snacks: results[3],
          desserts: results[4],
        });

        setIsLoading({
          trending: false,
          breakfast: false,
          lunch: false,
          dinner: false,
          snacks: false,
          desserts: false
        });

      } catch (error) {
        console.error('Error initializing recipes:', error);
        setIsLoading({
          trending: false,
          breakfast: false,
          lunch: false,
          dinner: false,
          snacks: false,
          desserts: false
        });
      }
    };

    initializeRecipes();
  }, []);

  const toggleLike = async (recipeId) => {
    let newLikedState;
    
    try {
      console.log('Toggling heart for recipe:', recipeId);
      
      // Optimistically update UI
      newLikedState = !heartStates[recipeId];
      setHeartStates(prev => ({
        ...prev,
        [recipeId]: newLikedState
      }));

      // Additional error checking
      if (!recipeId) {
        throw new Error('Recipe ID is required');
      }

      const response = await api.post(`/recipes/like/${recipeId}`);
      console.log('Like response:', response.data);

      // Update regular recipes
      setRecipes(prevRecipes => {
        const updatedRecipes = { ...prevRecipes };
        Object.keys(updatedRecipes).forEach(category => {
          updatedRecipes[category] = updatedRecipes[category].map(recipe =>
            recipe._id === recipeId
              ? { ...recipe, likes: response.data.likes }
              : recipe
          );
        });
        return updatedRecipes;
      });

      // Update heart states with server response
      setHeartStates(prev => ({
        ...prev,
        [recipeId]: response.data.isLiked
      }));

      toast.success(
        response.data.isLiked
          ? "Recipe added to favorites!"
          : "Recipe removed from favorites!",
        { position: "top-center", autoClose: 1000 }
      );
    } catch (error) {
      console.error('Detailed error toggling like:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
        fullError: error
      });

      // Revert the optimistic update on error
      setHeartStates(prev => ({
        ...prev,
        [recipeId]: !newLikedState
      }));

      // More specific error handling
      const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           "Failed to update like status";
      
      toast.error(errorMessage, { 
        position: "top-center", 
        autoClose: 2000 
      });
    }
  };
  
  const categories = [
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

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await api.get('/auth/top-users');
        setTopUsers(response.data);
      } catch (error) {
        console.error('Error fetching top users:', error);
      }
    };

    fetchTopUsers();
  }, []);

  const sliderSettings = {
    centerMode: true,
    centerPadding: "5px", // Reduced padding to minimize gaps between cards
    slidesToShow: 3,
    infinite: true,
    arrows: false,
    speed: 500,
    swipeToSlide: true,
    touchThreshold: 8,
    focusOnSelect: true, 
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                centerPadding: "60px", // Small padding for mobile
            },
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 3,
                centerPadding: "10px",
            },
        },
    ],
};

  // Add this function to handle ingredient clicks
  const handleIngredientClick = (ingredientName) => {
    navigate('/search-results', { 
      state: { 
        query: ingredientName,
        type: 'ingredient'
      }
    });
  };

  return (
    <div className="flex flex-col bg-white w-full pb-24">
      <ToastContainer />
      <Header />

      <div className="mt-24">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6 text-center">Trending Recipes</h2>
        {isLoading.trending ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {trendingRecipes.map((recipe, index) => (
              <div
                key={recipe._id}
                className={`transition-transform duration-300 ease-in-out ${
                  index === Math.floor(trendingRecipes.length / 2)
                    ? "scale-90"
                    : "scale-90"
                }`}
              >
                <div className="bg-[#463C33] rounded-lg shadow-md overflow-hidden flex-shrink-0 w-60">
                  <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
                    />
                    <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                      {recipe.time}
                    </span>
                  </Link>
                    <button
                      className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                      onClick={() => toggleLike(recipe._id)}
                    >
                      {heartStates[recipe._id] ? (
                        <FaHeart size={20} className="text-white" />
                      ) : (
                        <FaRegHeart size={20} className="text-white" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <img
                      src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                      alt={recipe.user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/user/${recipe.user._id}`);
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between" style={{ minHeight: "130px" }}>
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">{recipe.title}</h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>

      {/* Categories Section */}
      <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Categories</h2>
        <div className="overflow-x-auto scroll-smooth no-scrollbar mt-4">
          <div className="flex" style={{ gap: "1rem", width: "100%" }}>
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ width: "calc(25% - 1rem)", height: "auto" }}
                onClick={() => handleIngredientClick(category.name)}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-16 h-16 md:w-20 md:h-20"
                />
                <span className="text-[#463C33] text-xs font-bold mt-2 text-center h-8 flex items-center">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Show All Ingredients Button */}
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => navigate('/all-ingredients')}
            className="text-orange-500 text-sm font-medium underline"
          >
            Show all ingredients
          </button>
        </div>
      </div>

      {/* Breakfast */}
      <div className="mt-10 pl-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Breakfast</h2>
        {isLoading.breakfast ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.breakfast?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
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
                      toggleLike(recipe._id);
                    }}
                  >
                    {heartStates[recipe._id] ? (
                      <FaHeart size={20} className="text-white" />
                    ) : (
                      <FaRegHeart size={20} className="text-white" />
                    )}
                  </button>
                </div>
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                        alt={recipe.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${recipe.user._id}`);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="p-4 flex flex-col justify-between"
                    style={{ minHeight: "130px" }}
                  >
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lunch */}
      <div className="mt-10 pl-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Lunch</h2>
        {isLoading.lunch ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.lunch?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
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
                      toggleLike(recipe._id);
                    }}
                  >
                    {heartStates[recipe._id] ? (
                      <FaHeart size={20} className="text-white" />
                    ) : (
                      <FaRegHeart size={20} className="text-white" />
                    )}
                  </button>
                </div>
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                        alt={recipe.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${recipe.user._id}`);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="p-4 flex flex-col justify-between"
                    style={{ minHeight: "130px" }}
                  >
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dinner */}
      <div className="mt-10 pl-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Dinner</h2>
        {isLoading.dinner ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.dinner?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
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
                      toggleLike(recipe._id);
                    }}
                  >
                    {heartStates[recipe._id] ? (
                      <FaHeart size={20} className="text-white" />
                    ) : (
                      <FaRegHeart size={20} className="text-white" />
                    )}
                  </button>
                </div>
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                        alt={recipe.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${recipe.user._id}`);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="p-4 flex flex-col justify-between"
                    style={{ minHeight: "130px" }}
                  >
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snacks */}
      <div className="mt-10 pl-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Snacks</h2>
        {isLoading.snacks ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.snacks?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
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
                      toggleLike(recipe._id);
                    }}
                  >
                    {heartStates[recipe._id] ? (
                      <FaHeart size={20} className="text-white" />
                    ) : (
                      <FaRegHeart size={20} className="text-white" />
                    )}
                  </button>
                </div>
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                        alt={recipe.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${recipe.user._id}`);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="p-4 flex flex-col justify-between"
                    style={{ minHeight: "130px" }}
                  >
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desserts */}
      <div className="mt-10 pl-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Desserts</h2>
        {isLoading.desserts ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.desserts?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-56 object-cover"
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
                      toggleLike(recipe._id);
                    }}
                  >
                    {heartStates[recipe._id] ? (
                      <FaHeart size={20} className="text-white" />
                    ) : (
                      <FaRegHeart size={20} className="text-white" />
                    )}
                  </button>
                </div>
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="flex justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <FaHeart size={16} className="text-white" />
                      <span className="text-white">{recipe.likes}</span>
                    </div>
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                        alt={recipe.user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${recipe.user._id}`);
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="p-4 flex flex-col justify-between"
                    style={{ minHeight: "130px" }}
                  >
                    <h3 className="text-white font-bold text-lg -mt-5 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <button 
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-3 w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate('/add-to-meal-plan', { state: { recipe } });
                      }}
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Best Recipes From */}
      <div className="mt-6 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-4">Best Recipes From</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth no-scrollbar">
          {topUsers.map((user) => (
            <div 
              key={user._id}
              className="flex-shrink-0 w-40 cursor-pointer"
              onClick={() => navigate(`/user/${user._id}`)}
            >
              <div className="relative w-40 h-48 rounded-lg overflow-hidden bg-[#463C33]">
                <img
                  src={getImageUrl(user.profilePicture || 'uploads/default-profile.png')}
                  alt={user.name}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                    {user.name}
                  </h3>
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{user.recipeCount} Recipes</span>
                    <div className="flex items-center space-x-1">
                      <FaHeart size={12} />
                      <span>{user.totalLikes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavbar /> 
    </div>
  );
};

export default HomeScreen;
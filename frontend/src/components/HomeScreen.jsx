import { useState, useEffect } from "react";
import axios from "axios";
import BottomNavbar from "./BottomNavbar";
import Header from '../components/Header';
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; 
import {FaHeart,  FaRegHeart } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link, useNavigate } from "react-router-dom";
import Slider from "react-slick";

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

  // Function to toggle like and update the UI
  const toggleHeart = async (recipeId, category) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/recipes/like/${recipeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
  
        // Toggle the heart state
        setHeartStates((prev) => ({
          ...prev,
          [recipeId]: !prev[recipeId],
        }));

        // Update the specific category's state
        if (category === "trending") {
          setTrendingRecipes((prevRecipes) =>
            prevRecipes.map((recipe) =>
              recipe._id === recipeId 
                ? { ...recipe, likes: response.data.recipeLikes } 
                : recipe
            )
          );
        } else {
          setRecipes((prev) => ({
            ...prev,
            [category]: prev[category].map((recipe) =>
              recipe._id === recipeId 
                ? { ...recipe, likes: response.data.recipeLikes } 
                : recipe
            ),
          }));
        }

        // Show success toast
        toast.success(
          heartStates[recipeId]
            ? "Recipe removed from favorites!"
            : "Recipe added to favorites!",
          { position: "top-center", autoClose: 1000 }
        );
        } catch (error) {
        console.error("Error toggling like state:", error.message);
        toast.error("Failed to update favorite status");
        }
  };

  
  const categories = [
    { id: 1, name: "Egg", image: "src/assets/images/egg.png" },
    { id: 2, name: "Chicken", image: "src/assets/images/chicken.png" },
    { id: 3, name: "Pasta", image: "src/assets/images/pasta.png" },
    { id: 4, name: "Rice", image: "src/assets/images/rice.png" },
    { id: 5, name: "Egg", image: "src/assets/images/egg.png" },
    { id: 6, name: "Chicken", image: "src/assets/images/chicken.png" },
    { id: 7, name: "Pasta", image: "src/assets/images/pasta.png" },
    { id: 8, name: "Rice", image: "src/assets/images/rice.png" },
    { id: 9, name: "Egg", image: "src/assets/images/egg.png" },
    { id: 10, name: "Chicken", image: "src/assets/images/chicken.png" },
    { id: 11, name: "Pasta", image: "src/assets/images/pasta.png" },
    { id: 12, name: "Rice", image: "src/assets/images/rice.png" },
    { id: 13, name: "Egg", image: "src/assets/images/egg.png" },
    { id: 14, name: "Chicken", image: "src/assets/images/chicken.png" },
    { id: 15, name: "Pasta", image: "src/assets/images/pasta.png" },
    { id: 16, name: "Rice", image: "src/assets/images/rice.png" },
  ];

  const users = [
    { id: 1, name: "John Doe", image: "src/assets/25.png" },
    { id: 2, name: "Jane Smith", image: "src/assets/26.png" },
    { id: 3, name: "Alice Reid", image: "src/assets/27.png" },
    { id: 4, name: "John Doe", image: "src/assets/25.png" },
    { id: 5, name: "Jane Smith", image: "src/assets/26.png" },
    { id: 6, name: "Alice Johnson", image: "src/assets/27.png" },
  ];

  useEffect(() => {
    const fetchRecipes = async (category) => {
      try {
          const response = await axios.get(
              `http://localhost:5000/recipes/category/${category}`,
              {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              }
          );
          return response.data; // Prioritized recipes with `isLiked` flag
      } catch (error) {
          console.error(`Error fetching ${category} recipes:`, error);
          return [];
      }
  };
  
    const fetchAllRecipes = async () => {
      const categories = ["breakfast", "lunch", "dinner", "snacks", "desserts"];
      const results = await Promise.all(categories.map(fetchRecipes));
      setRecipes({
        breakfast: results[0],
        lunch: results[1],
        dinner: results[2],
        snacks: results[3],
        desserts: results[4],
      });

      const userResponse = await axios.get("http://localhost:5000/auth/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const likedRecipes = userResponse.data.likedRecipes.reduce((state, id) => {
        state[id] = true;
        return state;
      }, {});
      setHeartStates(likedRecipes);
    };

    fetchAllRecipes();

    const initializeRecipes = async () => {
      const categories = ["breakfast", "lunch", "dinner", "snacks", "desserts"];
      const updatedRecipes = {};

      for (const category of categories) {
          const data = await fetchRecipes(category);
          updatedRecipes[category] = data;

          // Update heartStates for each recipe
          setHeartStates((prev) => ({
              ...prev,
              ...data.reduce((acc, recipe) => {
                  acc[recipe._id] = recipe.isLiked;
                  return acc;
              }, {}),
          }));
      }

      setRecipes(updatedRecipes);
  };

  initializeRecipes();

  const fetchTrendingRecipes = async () => {
      try {
          const response = await axios.get("http://localhost:5000/recipes/trending");
          setTrendingRecipes(response.data);
      } catch (error) {
          console.error("Error fetching trending recipes:", error);
      }
  };
  fetchRecipes();
  fetchTrendingRecipes();

  const initializeData = async () => {
      try {
          const response = await axios.get("http://localhost:5000/recipes/trending", {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setTrendingRecipes(response.data);
      } catch (error) {
          console.error("Error fetching trending recipes:", error);
      }
  };

  initializeData();
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

  return (
    <div className="flex flex-col bg-white w-full pb-24">
      <ToastContainer />
      <Header />

      <div className="mt-24">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6 text-center">Trending Recipes</h2>
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
                            src={`http://localhost:5000/${recipe.image}`}
                            alt={recipe.title}
                            className="w-full h-56 object-cover"
                          />
                          <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                            {recipe.time}
                          </span>
                        </Link>
                            <button
                              className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                              onClick={() => toggleHeart(recipe._id, "trending")}
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
                                src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
    </div>

        {/* Categories Section (Horizontally Swipable, 4 Items Per View) */}
        <div className="mt-10 px-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Categories</h2>
          <div className="overflow-x-auto scroll-smooth no-scrollbar mt-4">
            <div
              className="flex"
              style={{
                gap: "1rem", // Space between items
                width: "100%", // Ensures items fit within the container
              }}
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    width: "calc(25% - 1rem)", // Dynamic width for 4 items + spacing
                    height: "auto",
                  }}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-16 h-16 md:w-20 md:h-20"
                  />
                  <span className="text-[#463C33] text-sm font-bold mt-2 text-center">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakfast */}
        <div className="mt-10 pl-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Breakfast</h2>
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.breakfast?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={`http://localhost:5000/${recipe.image}`}
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
                      toggleHeart(recipe._id, "breakfast");
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
                        src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
        </div>

        {/* Lunch */}
        <div className="mt-10 pl-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Lunch</h2>
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.lunch?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={`http://localhost:5000/${recipe.image}`}
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
                      toggleHeart(recipe._id, "lunch");
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
                        src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
        </div>

        {/* Dinner */}
        <div className="mt-10 pl-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Dinner</h2>
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.dinner?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={`http://localhost:5000/${recipe.image}`}
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
                      toggleHeart(recipe._id, "dinner");
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
                        src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
        </div>

        {/* Snacks */}
        <div className="mt-10 pl-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Snacks</h2>
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.snacks?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={`http://localhost:5000/${recipe.image}`}
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
                      toggleHeart(recipe._id, "breakfast");
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
                        src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
        </div>

        {/* Desserts */}
        <div className="mt-10 pl-4">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Desserts</h2>
          <div className="flex gap-4 overflow-x-auto scroll-smooth mt-4 no-scrollbar">
            {recipes.desserts?.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0">
                <div className="relative">
                <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={`http://localhost:5000/${recipe.image}`}
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
                      toggleHeart(recipe._id, "breakfast");
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
                        src={`http://localhost:5000/${recipe.user.profilePicture}`}
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
        </div>

      {/* Quick Links For You */}
      <div className="mt-6 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-4">Quick Links For You</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth no-scrollbar">
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/baking.png"
              alt="Baking"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Baking</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/meal-prep.png"
              alt="Meal Prep"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Meal Prep</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/holiday-favorites.png"
              alt="Meal Prep"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Holiday Favorites</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/baking.png"
              alt="Baking"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Baking</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/meal-prep.png"
              alt="Meal Prep"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Meal Prep</span>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <img
              src="src/assets/holiday-favorites.png"
              alt="Meal Prep"
              className="w-40 h-60 object-cover rounded-md"
            />
            <span className="text-[#463C33] text-lg font-bold mt-2">Holiday Favorites</span>
          </div>
        </div>
      </div>

      <BottomNavbar /> 
    </div>
  );
};

export default HomeScreen;

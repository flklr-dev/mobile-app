import { useState } from "react";
import BottomNavbar from "./BottomNavbar";
import Header from '../components/Header';
import {FaHeart, FaUser } from "react-icons/fa";

const HomeScreen = () => {
  const [heartStates, setHeartStates] = useState({});

  const toggleHeart = (index) => {
    setHeartStates((prev) => ({ ...prev, [index]: !prev[index] }));
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

  const breakfast = [
    { id: 1, title: "Lasagna", image: "src/assets/lasagna.png", time: "45min", likes: "6.12k" },
    { id: 2, title: "Korean Spicy Noodles", image: "src/assets/spicy-noodles.png", time: "25min", likes: "5.34k" },
    { id: 3, title: "Pancakes", image: "src/assets/pancakes.png", time: "30min", likes: "2.99k" },
    { id: 4, title: "Lasagna", image: "src/assets/lasagna.png", time: "45min", likes: "6.12k" },
    { id: 5, title: "Korean Spicy Noodles", image: "src/assets/spicy-noodles.png", time: "25min", likes: "5.34k" },
    { id: 6, title: "Pancakes", image: "src/assets/pancakes.png", time: "30min", likes: "2.99k" },
  ];

  const lunch = [
    { id: 1, title: "Fish Tacos", image: "src/assets/fish-tacos.png", time: "45min", likes: "6.12k" },
    { id: 2, title: "Caesar Salad", image: "src/assets/caesar-salad.png", time: "25min", likes: "5.34k" },
    { id: 3, title: "Tapsilog", image: "src/assets/tapsilog.png", time: "30min", likes: "2.99k" },
    { id: 4, title: "Fish Tacos", image: "src/assets/fish-tacos.png", time: "45min", likes: "6.12k" },
    { id: 5, title: "Caesar Salad", image: "src/assets/caesar-salad.png", time: "25min", likes: "5.34k" },
    { id: 6, title: "Tapsilog", image: "src/assets/tapsilog.png", time: "30min", likes: "2.99k" },
  ];

  const dinner = [
    { id: 1, title: "Korean Fried Chicken", image: "src/assets/korean-fried-chicken.png", time: "45min", likes: "6.12k" },
    { id: 2, title: "Honey Grilled Chicken", image: "src/assets/honey-grill.png", time: "25min", likes: "5.34k" },
    { id: 3, title: "Balsamic Chicken Salad", image: "src/assets/balsamic.png", time: "30min", likes: "2.99k" },
    { id: 4, title: "Korean Fried Chicken", image: "src/assets/korean-fried-chicken.png", time: "45min", likes: "6.12k" },
    { id: 5, title: "Honey Grilled Chicken", image: "src/assets/honey-grill.png", time: "25min", likes: "5.34k" },
    { id: 6, title: "Balsamic Chicken Salad", image: "src/assets/balsamic.png", time: "30min", likes: "2.99k" },
  ];

  const snacks = [
    { id: 1, title: "Macaroons", image: "src/assets/macaroons.png", time: "45min", likes: "6.12k" },
    { id: 2, title: "Cookies", image: "src/assets/cookies.png", time: "25min", likes: "5.34k" },
    { id: 3, title: "Mini Waffles", image: "src/assets/mini-waffles.png", time: "30min", likes: "2.99k" },
    { id: 4, title: "Macaroons", image: "src/assets/macaroons.png", time: "45min", likes: "6.12k" },
    { id: 5, title: "Cookies", image: "src/assets/cookies.png", time: "25min", likes: "5.34k" },
    { id: 6, title: "Mini Waffles", image: "src/assets/mini-waffles.png", time: "30min", likes: "2.99k" },
  ];

  const desserts = [
    { id: 1, title: "Mango Float", image: "src/assets/mango-float.png", time: "45min", likes: "6.12k" },
    { id: 2, title: "Blueberry Cake", image: "src/assets/baking.png", time: "25min", likes: "5.34k" },
    { id: 3, title: "Macaroons", image: "src/assets/macaroons.png", time: "45min", likes: "6.12k" },
    { id: 4, title: "Mango Float", image: "src/assets/mango-float.png", time: "45min", likes: "6.12k" },
    { id: 5, title: "Blueberry Cake", image: "src/assets/baking.png", time: "25min", likes: "5.34k" },
    { id: 6, title: "Macaroons", image: "src/assets/macaroons.png", time: "45min", likes: "6.12k" },
  ];

  return (
    <div className="flex flex-col bg-white w-full pb-24">
      <Header />

      {/* Trending Recipes */}
      <div className="mt-24 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Trending Recipes</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4 w-full no-scrollbar">
          {lunch.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ 
                marginRight: index === lunch.length - 1 ? "0" : "0", 
              }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section (Horizontally Swipable, 4 Items Per View) */}
      <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Categories</h2>
        <div className="overflow-x-auto scroll-smooth mt-4">
          <div className="flex space-x-0"> {/* Reduced the gap to space-x-2 */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center justify-center w-20 h-24 p-1 rounded-md flex-shrink-0"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-16 h-16"
                />
                <span className="text-[#463C33] text-sm font-bold mt-2">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Breakfast */}
        <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Breakfast</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4">
          {breakfast.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ marginRight: index === breakfast.length - 1 ? "0" : "1rem" }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Lunch */}
        <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Lunch</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4">
          {dinner.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ marginRight: index === dinner.length - 1 ? "0" : "1rem" }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Dinner */}
        <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Dinner</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4">
          {lunch.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ marginRight: index === lunch.length - 1 ? "0" : "1rem" }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Users */}
      <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Best Recipes From</h2>
        <div className="overflow-x-auto scroll-smooth mt-4">
          <div className="flex space-x-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center justify-center w-24 h-32 p-1 rounded-md flex-shrink-0"
              >
                {/* User Image */}
                <img src={user.image} alt={user.name} className="w-18 h-18 rounded-full" />

                {/* User Name */}
                <span className="text-[#463C33] text-sm font-bold mt-2 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Snacks */}
        <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Snacks</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4">
          {snacks.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ marginRight: index === snacks.length - 1 ? "0" : "1rem" }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Desserts */}
        <div className="mt-10 px-4">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-6">Desserts</h2>
        <div className="flex space-x-4 overflow-x-auto scroll-smooth mt-4">
          {desserts.map((recipe, index) => (
            <div
              key={recipe.id}
              className="bg-[#463C33] rounded-lg w-60 shadow-md overflow-hidden flex-shrink-0"
              style={{ marginRight: index === desserts.length - 1 ? "0" : "1rem" }} // Removes white space on the last card
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-56 object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                  {recipe.time}
                </span>
                <button
                  className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full"
                  onClick={() => toggleHeart(index)}
                >
                  {heartStates[index] ? (
                    <FaHeart size={20} className="text-orange-500" />
                  ) : (
                    <FaHeart size={20} className="text-white" />
                  )}
                </button>
              </div>
              <div className="flex justify-between p-4">
                <div className="flex items-center space-x-2">
                  <FaHeart size={15} className="text-white" />
                  <span className="text-white">{recipe.likes}</span>
                </div>
                <div className="flex items-center">
                  <FaUser size={15} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-6 -mt-5">{recipe.title}</h3>
                <button className="bg-white text-[#463C33] font-bold rounded-full py-2 px-4 mt-4 w-full">
                  Add to Meal Plan
                </button>
              </div>
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

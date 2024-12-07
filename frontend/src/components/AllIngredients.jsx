import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

const AllIngredients = () => {
  const navigate = useNavigate();

  const ingredients = [
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

  const handleIngredientClick = (ingredient) => {
    navigate('/search-results', {
      state: {
        query: ingredient.name,
        type: 'ingredient'
      }
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold ml-4">All Ingredients</h1>
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="mt-20 px-4">
        <div className="grid grid-cols-4 gap-4">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img
                  src={ingredient.image}
                  alt={ingredient.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[#463C33] text-xs font-medium mt-2 text-center">
                {ingredient.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllIngredients; 
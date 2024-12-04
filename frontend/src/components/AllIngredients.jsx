import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';

const AllIngredients = () => {
  const navigate = useNavigate();

  const ingredients = [
    { id: 1, name: "Egg", image: "src/assets/images/egg.png" },
    { id: 2, name: "Chicken", image: "src/assets/images/chicken.png" },
    { id: 3, name: "Pasta", image: "src/assets/images/pasta.png" },
    { id: 4, name: "Rice", image: "src/assets/images/rice.png" },
    { id: 5, name: "Beef", image: "src/assets/images/beef.png" },
    { id: 6, name: "Pork", image: "src/assets/images/pork.png" },
    { id: 7, name: "Banana", image: "src/assets/images/banana.png" },
    { id: 8, name: "Milk", image: "src/assets/images/milk.png" },
    { id: 9, name: "Cheese", image: "src/assets/images/cheese.png" },
    { id: 10, name: "Chocolate", image: "src/assets/images/chocolate.png" },
    { id: 11, name: "Salmon", image: "src/assets/images/salmon.png" },
    { id: 12, name: "Shrimp", image: "src/assets/images/shrimp.png" },
    { id: 13, name: "Strawberries", image: "src/assets/images/strawberry.png" },
    { id: 14, name: "Grapes", image: "src/assets/images/grapes.png" },
    { id: 15, name: "Potato", image: "src/assets/images/potato.png" },
    { id: 16, name: "Tomato", image: "src/assets/images/tomato.png" },
    { id: 17, name: "Peanut Butter", image: "src/assets/images/peanut-butter.png" },
    { id: 18, name: "Bread", image: "src/assets/images/bread.png" },
    { id: 19, name: "Brocolli", image: "src/assets/images/brocolli.png" },
    { id: 20, name: "Carrot", image: "src/assets/images/carrot.png" },
    { id: 21, name: "Coconut Milk", image: "src/assets/images/coconut-milk.png" },
    { id: 22, name: "Green Beans", image: "src/assets/images/green-beans.png" },
    { id: 23, name: "Spinach", image: "src/assets/images/spinach.png" },
    { id: 24, name: "Lettuce", image: "src/assets/images/lettuce.png" },
    { id: 25, name: "Pineapple", image: "src/assets/images/pineapple.png" },
    { id: 26, name: "Cucumber", image: "src/assets/images/cucumber.png" },
    { id: 27, name: "Sweet Potato", image: "src/assets/images/sweet-potato.png" },
    { id: 28, name: "Corn", image: "src/assets/images/corn.png" },
    { id: 29, name: "Eggplant", image: "src/assets/images/eggplant.png" },
    { id: 30, name: "Squash", image: "src/assets/images/squash.png" },
    { id: 31, name: "Kangkong", image: "src/assets/images/kangkong.png" },
    { id: 32, name: "Tofu", image: "src/assets/images/tofu.png" },
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
              className="flex flex-col items-center justify-center cursor-pointer"
              onClick={() => handleIngredientClick(ingredient)}
            >
              <img
                src={ingredient.image}
                alt={ingredient.name}
                className="w-16 h-16 object-cover"
              />
              <span className="text-[#463C33] text-xs font-bold mt-2 text-center h-8 flex items-center">
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
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../config/axios';
import { FaChevronLeft, FaPencilAlt, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyRecipesScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", profilePicture: "" });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  useEffect(() => {
    const fetchUserAndRecipes = async () => {
      try {
        // Fetch user data using the api instance
        const userResponse = await api.get("/auth/user");
        if (!userResponse.data || !userResponse.data._id) {
          throw new Error("User data not found");
        }

        setUser(userResponse.data);

        // Fetch recipes using the user ID
        const recipesResponse = await api.get(`/recipes/user/${userResponse.data._id}`);
        setRecipes(recipesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error(err.response?.data?.message || "Failed to fetch data");
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserAndRecipes();
  }, [navigate]);

  const goBack = () => {
    navigate("/profile");
  };

  const handleEditClick = (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const loadingToast = toast.loading("Deleting recipe...");

      await api.delete(`/recipes/${recipeToDelete._id}`);

      toast.dismiss(loadingToast);
      toast.success("Recipe deleted successfully!");

      // Update the recipes list
      setRecipes(recipes.filter(recipe => recipe._id !== recipeToDelete._id));
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
      toast.error(error.response?.data?.message || "Failed to delete recipe");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={goBack} className="text-white">
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white ml-4 text-xl font-bold">My Recipes</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="pt-16 px-4">
        <div className="mt-4 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={`${import.meta.env.VITE_PROD_BASE_URL}/${user.profilePicture}`}
                alt="User Avatar"
                className="w-24 h-24 object-cover rounded-full ring-4 ring-orange-500/20"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.name || "Loading..."}</h2>
          </div>
        </div>

        {/* Recipes List */}
        <div className="mt-6 space-y-3 pb-20">
          {recipes.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No recipes found. Start creating your recipes!
            </div>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center flex-1">
                  <img
                    src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.image}`}
                    alt={recipe.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <h3 className="ml-4 font-semibold text-gray-800">{recipe.title}</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleEditClick(recipe._id)} 
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <FaPencilAlt size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(recipe)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Recipe
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipesScreen; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import api from '../config/axios';

const EditRecipeScreen = () => {
  const navigate = useNavigate();
  const { recipeId } = useParams();

  // States (same as AddRecipeScreen)
  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [authorNotes, setAuthorNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${recipeId}`);
        const recipe = response.data;
        
        // Populate all fields
        setRecipeTitle(recipe.title);
        setDescription(recipe.description);
        setCategory(recipe.category);
        setServingSize(recipe.servingSize);
        setIngredients(recipe.ingredients);
        setInstructions(recipe.cookingInstructions);
        setAuthorNotes(recipe.authorNotes || '');
        setIsPublic(recipe.isPublic);

        // Parse time string
        const timeStr = recipe.time;
        if (timeStr.includes('hr')) {
          const [hrPart, minPart] = timeStr.split('hr').map(part => parseInt(part));
          setHours(hrPart || "");
          setMinutes(minPart ? parseInt(minPart) : "");
        } else {
          const mins = parseInt(timeStr);
          setHours("");
          setMinutes(mins || "");
        }

        // Handle image
        if (recipe.image) {
          setImagePreview(`http://localhost:5000/${recipe.image}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setErrorMessage('Failed to fetch recipe details');
        setShowErrorModal(true);
        navigate('/my-recipes');
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId, navigate]);

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const updateIngredient = (text, index) =>
    setIngredients(ingredients.map((item, i) => (i === index ? text : item)));
  const deleteIngredient = (index) =>
    setIngredients(ingredients.filter((_, i) => i !== index));

  const addInstruction = () => setInstructions([...instructions, '']);
  const updateInstruction = (text, index) =>
    setInstructions(instructions.map((item, i) => (i === index ? text : item)));
  const deleteInstruction = (index) =>
    setInstructions(instructions.filter((_, i) => i !== index));

  const goBack = () => {
    navigate(-1);
  };

  const updateRecipe = async () => {
    // Validation
    if (!recipeTitle || !description || !category || !servingSize) {
      setErrorMessage("Please fill in all required fields!");
      setShowErrorModal(true);
      return;
    }

    const totalMinutes = parseInt(hours || 0) * 60 + parseInt(minutes || 0);
    if (totalMinutes === 0) {
      setErrorMessage("Please specify cooking time!");
      setShowErrorModal(true);
      return;
    }

    // Check if ingredients and instructions are not empty
    if (ingredients.length === 0 || ingredients.every(ing => ing.trim() === '')) {
      setErrorMessage("Please add at least one ingredient!");
      setShowErrorModal(true);
      return;
    }

    if (instructions.length === 0 || instructions.every(inst => inst.trim() === '')) {
      setErrorMessage("Please add at least one instruction!");
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      // Format time string
      let timeString = "";
      if (totalMinutes >= 60) {
        const formattedHours = Math.floor(totalMinutes / 60);
        const formattedMinutes = totalMinutes % 60;
        timeString = formattedMinutes > 0
          ? `${formattedHours} hr ${formattedMinutes} min`
          : `${formattedHours} hr`;
      } else {
        timeString = `${totalMinutes} min`;
      }

      // Filter out empty ingredients and instructions
      const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
      const filteredInstructions = instructions.filter(inst => inst.trim() !== '');

      const formData = new FormData();
      formData.append("title", recipeTitle.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("servingSize", servingSize);
      formData.append("ingredients", JSON.stringify(filteredIngredients));
      formData.append("cookingInstructions", JSON.stringify(filteredInstructions));
      formData.append("authorNotes", authorNotes.trim());
      formData.append("isPublic", isPublic);
      formData.append("time", timeString);
      if (coverImage) formData.append("image", coverImage);

      await api.put(`/recipes/${recipeId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccessModal(true);

      // Navigate after showing success message
      setTimeout(() => {
        navigate("/my-recipes");
      }, 2000);

    } catch (error) {
      console.error("Error updating recipe:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update recipe");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Return the same JSX as AddRecipeScreen but with updateRecipe instead of saveRecipe
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="fixed top-0 p-4 left-0 w-full z-10 flex items-center bg-orange-500 shadow-lg">
        <button onClick={goBack} className="text-white text-2xl">
          <FaChevronLeft />
        </button>
        <h1 className="text-white ml-4 text-xl font-bold">Edit Recipe</h1>
      </div>

      <div className="px-4 py-6 mt-16">
        {/* Recipe Title */}
        <label className="text-orange-500 font-bold mb-2">Recipe Title</label>
        <input
          type="text"
          placeholder="Enter a title for your recipe"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Description */}
        <label className="text-orange-500 font-bold mb-2">Description</label>
        <textarea
          placeholder="Tell us about your recipe"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows="3"
        />

        {/* Image Section */}
        <label className="text-orange-500 font-bold mb-2">Cover Image</label>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            onChange={handleImagePick}
            className="hidden"
          />
          <label
            htmlFor="imageUpload"
            className="block w-full text-center bg-orange-500 text-white py-3 rounded-md cursor-pointer"
          >
            {imagePreview ? 'Change Image' : 'Add Image'}
          </label>
          {imagePreview && (
            <div className="mt-4 relative">
              <img
                src={imagePreview}
                alt="Recipe Cover"
                className="w-full rounded-md"
                onError={(e) => {
                  e.target.src = `http://localhost:5000/uploads/default-recipe.png`;
                }}
              />
              <button
                onClick={() => {
                  setCoverImage(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Category and Serving Size */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="text-orange-500 font-bold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="desserts">Desserts</option>
              <option value="snacks">Snacks</option>
              <option value="beverages">Beverages</option>
            </select>
          </div>
          <div className="w-1/3">
            <label className="text-orange-500 font-bold mb-2">Serving Size</label>
            <select
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>

        {/* Time Input */}
        <label className="text-orange-500 font-bold mb-2">Cooking Time</label>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            placeholder="Hours"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-1/2 p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="number"
            placeholder="Minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-1/2 p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Ingredients */}
        <label className="text-orange-500 font-bold mb-2">Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter ingredient"
              value={ingredient}
              onChange={(e) => updateIngredient(e.target.value, index)}
              className="flex-1 min-w-0 p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => deleteIngredient(index)}
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
              aria-label="Delete ingredient"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addIngredient}
          className="w-full p-3 mb-4 bg-orange-500 text-white rounded-md"
        >
          + Add Ingredient
        </button>

        {/* Cooking Instructions */}
        <label className="text-orange-500 font-bold mb-2">Cooking Instructions</label>
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-center gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter instruction"
              value={instruction}
              onChange={(e) => updateInstruction(e.target.value, index)}
              className="flex-1 min-w-0 p-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={() => deleteInstruction(index)}
              className="shrink-0 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
              aria-label="Delete instruction"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={addInstruction}
          className="w-full p-3 mb-4 bg-orange-500 text-white rounded-md"
        >
          + Add Instruction
        </button>

        {/* Author's Notes */}
        <label className="text-orange-500 font-bold mb-2">Additional Notes (Optional)</label>
        <textarea
          placeholder="Add tips or notes for this recipe"
          value={authorNotes}
          onChange={(e) => setAuthorNotes(e.target.value)}
          className="w-full p-3 mb-4 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows="3"
        />

        {/* Sharing Options */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsPublic(true)}
            className={`w-full py-3 rounded-md ${
              isPublic ? 'bg-orange-500 text-white' : 'bg-orange-300 text-white'
            }`}
          >
            Public
          </button>
          <button
            onClick={() => setIsPublic(false)}
            className={`w-full py-3 rounded-md ${
              !isPublic ? 'bg-orange-500 text-white' : 'bg-orange-300 text-white'
            }`}
          >
            Private
          </button>
        </div>

        {/* Update Button */}
        <button
          onClick={updateRecipe}
          className="w-full py-3 bg-orange-500 text-white rounded-md"
        >
          Update Recipe
        </button>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-700">Updating recipe...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipe Updated Successfully!</h3>
              <p className="text-gray-600 mb-4">Your recipe has been updated and you will be redirected shortly.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRecipeScreen; 
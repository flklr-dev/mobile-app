import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import api from '../config/axios';

const AddRecipeScreen = () => {
  const navigate = useNavigate();

  const [recipeTitle, setRecipeTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [authorNotes, setAuthorNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [hours, setHours] = useState(""); // New state for hours
  const [minutes, setMinutes] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  const handleImagePick = (e) => {
    const file = e.target.files[0];  // Get the first selected file
    if (file) {
      setCoverImage(file);  // Store the file object in state
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
    navigate(-1); // Go back to the previous screen
  };

  const saveRecipe = async () => {
    // Validation
    if (!recipeTitle || !description || !category || !servingSize) {
      setStatusMessage("Please fill in all required fields!");
      setStatusType('error');
      setShowStatusModal(true);
      return;
    }

    const totalMinutes = parseInt(hours || 0) * 60 + parseInt(minutes || 0);
    if (totalMinutes === 0) {
      setStatusMessage("Please specify cooking time!");
      setStatusType('error');
      setShowStatusModal(true);
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

      const response = await api.post("/recipes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('Recipe saved response:', response.data);
      setStatusType('success');
      setStatusMessage("Recipe saved successfully!");
      setShowStatusModal(true);

      setTimeout(() => {
        navigate("/home");
      }, 2000);

    } catch (error) {
      console.error("Error saving recipe:", error);
      setStatusType('error');
      setStatusMessage(error.response?.data?.message || "Failed to save recipe");
      setShowStatusModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="fixed top-0 p-4 left-0 w-full z-10 flex items-center bg-orange-500 shadow-lg">
      <button onClick={goBack} className="text-white text-2xl">
          <FaChevronLeft />
        </button>
        <h1 className="text-white ml-4 text-xl font-bold">Create Recipe</h1>
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

        {/* Add Image Button */}
        <label className="text-orange-500 font-bold mb-2">Add Cover Image</label>
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
            Add Image
          </label>
          {coverImage && (
            <img
              src={URL.createObjectURL(coverImage)}  // Use createObjectURL to generate a preview URL
              alt="Cover Preview"
              className="w-full mt-4 rounded-md"
            />
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
        <label className="text-orange-500 font-bold mb-2">Additional Notes (Optional) </label>
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

        {/* Save Button */}
        <button
          onClick={saveRecipe}
          className="w-full py-3 bg-orange-500 text-white rounded-md"
        >
          Save Recipe
        </button>
      </div>

      {/* Status Message Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <div className="text-center">
              {statusType === 'success' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {statusType === 'success' ? 'Success!' : 'Error'}
              </h3>
              <p className="text-gray-600 mb-4">{statusMessage}</p>
              {statusType === 'error' && (
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-700">Saving recipe...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecipeScreen;

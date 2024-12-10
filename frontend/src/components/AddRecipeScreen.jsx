import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa';
import api from '../config/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      toast.error("Please fill in all required fields!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const totalMinutes = parseInt(hours || 0) * 60 + parseInt(minutes || 0);
    if (totalMinutes === 0) {
      toast.error("Please specify cooking time!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Validate image
    if (!coverImage) {
      toast.error("Please upload a recipe image!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

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

    try {
      const loadingToast = toast.loading("Saving recipe...", {
        position: "top-center",
      });

      const formData = new FormData();
      formData.append("title", recipeTitle);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("servingSize", servingSize);
      
      // Ensure ingredients and instructions are valid JSON arrays
      const cleanedIngredients = ingredients
        .filter(ing => ing && ing.trim())
        .map(ing => ing.trim());
      
      const cleanedInstructions = instructions
        .filter(inst => inst && inst.trim())
        .map(inst => inst.trim());
      
      // Append as JSON strings
      formData.append("ingredients", JSON.stringify(cleanedIngredients));
      formData.append("cookingInstructions", JSON.stringify(cleanedInstructions));
      
      formData.append("authorNotes", authorNotes || '');
      formData.append("isPublic", isPublic);
      formData.append("time", timeString);
      
      if (coverImage) {
        formData.append("image", coverImage);
      }

      // Log form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await api.post("/recipes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000 // 30 seconds
      });

      toast.dismiss(loadingToast);
      toast.success("Recipe saved successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/home");
      }, 2000);

    } catch (error) {
      console.error("FULL ERROR DETAILS:", {
        name: error.name,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : null,
        request: error.request ? 'Request exists' : null,
        config: error.config ? 'Config exists' : null
      });

      // Detailed error handling
      let errorMessage = "Failed to save recipe";
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }

        // Handle specific error scenarios
        if (error.response.data.missingFields) {
          const missingFields = Object.entries(error.response.data.missingFields)
            .filter(([_, isMissing]) => isMissing)
            .map(([field]) => field);
          
          errorMessage += `. Missing fields: ${missingFields.join(', ')}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <ToastContainer />
      
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
    </div>
  );
};

export default AddRecipeScreen;
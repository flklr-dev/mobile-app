import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import api from '../config/axios';
import { getImageUrl } from '../utils/imageUtils';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [searchType, setSearchType] = useState(location.state?.type || 'all');
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [userResponse, recipesResponse] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/recipes")
        ]);

        const likedIds = new Set(userResponse.data.likedRecipes.map(recipe => recipe._id));
        setLikedRecipes(likedIds);

        const recipesWithUserData = recipesResponse.data.map(recipe => ({
          ...recipe,
          user: {
            ...recipe.user,
            profilePicture: recipe.user?.profilePicture || 'uploads/default-profile.png'
          },
          // Ensure likes is a number and default to 0 if not present
          likes: recipe.likes || 0,
          // Add isLiked flag for consistent handling
          isLiked: likedIds.has(recipe._id)
        }));

        setRecipes(recipesWithUserData);
        filterRecipes(recipesWithUserData, searchQuery, searchType);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load recipes");
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchInitialData();
  }, []); // Only run on mount

  // Handle search filtering
  useEffect(() => {
    if (!initialLoad) {
      filterRecipes(recipes, searchQuery, searchType);
    }
  }, [searchQuery, searchType, initialLoad]);

  const filterRecipes = (recipeList, query, type) => {
    if (!query) {
      setFilteredRecipes(recipeList);
      return;
    }

    const searchTerms = query.toLowerCase().trim().split(' ');
    
    const filtered = recipeList.filter(recipe => {
      // Make sure title exists and convert to lowercase for comparison
      const recipeTitle = recipe.title?.toLowerCase() || '';
      const recipeCategory = recipe.category?.toLowerCase() || '';
      const recipeIngredients = recipe.ingredients?.map(ing => ing.toLowerCase()) || [];

      // Check for exact and partial matches in title
      const titleExactMatch = recipeTitle.includes(query.toLowerCase());
      const titlePartialMatch = searchTerms.some(term => recipeTitle.includes(term));

      // Check for category match
      const categoryMatch = recipeCategory === query.toLowerCase();

      // Check for ingredient matches
      const ingredientMatch = recipeIngredients.some(ingredient =>
        searchTerms.some(term => ingredient.includes(term))
      );

      // Debug logging
      console.log('Search Debug:', {
        query,
        type,
        recipeTitle,
        titleExactMatch,
        titlePartialMatch,
        categoryMatch,
        ingredientMatch
      });

      switch (type) {
        case 'category':
          return categoryMatch;
        case 'ingredient':
          return ingredientMatch;
        case 'title':
          return titleExactMatch || titlePartialMatch;
        default: // 'all'
          return titleExactMatch || titlePartialMatch || categoryMatch || ingredientMatch;
      }
    });

    setFilteredRecipes(filtered);
    
    // Debug logging
    console.log('Filtered Results:', {
      searchTerms,
      totalRecipes: recipeList.length,
      filteredCount: filtered.length,
      type,
      results: filtered.map(r => r.title)
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleHeart = async (recipeId) => {
    try {
      const response = await api.post(`/recipes/like/${recipeId}`);

      // Update both filteredRecipes and recipes states
      setFilteredRecipes(prev => 
        prev.map(recipe => 
          recipe._id === recipeId 
            ? { 
                ...recipe, 
                likes: response.data.likes 
              } 
            : recipe
        )
      );

      setRecipes(prev => 
        prev.map(recipe => 
          recipe._id === recipeId 
            ? { 
                ...recipe, 
                likes: response.data.likes 
              } 
            : recipe
        )
      );

      setLikedRecipes(prev => {
        const newLikedRecipes = new Set(prev);
        newLikedRecipes.has(recipeId) ? newLikedRecipes.delete(recipeId) : newLikedRecipes.add(recipeId);
        return newLikedRecipes;
      });

      toast.success(
        likedRecipes.has(recipeId) ? "Recipe removed from favorites!" : "Recipe added to favorites!",
        { position: "top-center", autoClose: 2000 }
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update favorite status");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={() => navigate(-1)} className="text-white">
            <FaChevronLeft size={24} />
          </button>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="mt-20 px-4 py-4">
        <div className="flex items-center p-2 rounded-full border-2 border-orange-500">
          <FaSearch size={20} className="text-orange-500 mr-3" />
          <input
            type="text"
            placeholder="Search Recipes"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-gray-700 focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4">
        {initialLoad ? (
          <div className="flex items-center justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredRecipes.map((recipe) => (
              <div key={recipe._id} className="bg-[#463C33] rounded-lg shadow-md overflow-hidden h-[250px]">
                <div className="relative">
                  <Link to={`/recipes/${recipe._id}`}>
                    <img
                      src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                      alt={recipe.title}
                      className="w-full h-28 object-cover"
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
                      toggleHeart(recipe._id);
                    }}
                  >
                    {likedRecipes.has(recipe._id) ? (
                      <FaHeart size={16} className="text-white" />
                    ) : (
                      <FaRegHeart size={16} className="text-white" />
                    )}
                  </button>
                </div>
                
                <Link to={`/recipes/${recipe._id}`}>
                  <div className="p-2 h-[122px] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1">
                          <FaHeart size={12} className="text-white" />
                          <span className="text-white text-xs">{recipe.likes || 0}</span>
                        </div>
                        <img
                          src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                          alt={recipe.user?.name || 'User'}
                          className="w-6 h-6 rounded-full object-cover border-2 border-white cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/user/${recipe.user._id}`);
                          }}
                        />
                      </div>
                      
                      <h3 className="text-white font-bold text-sm line-clamp-2 mb-3">
                        {recipe.title}
                      </h3>
                    </div>
                    
                    <button 
                      className="bg-white text-[#463C33] text-xs font-bold rounded-full py-2 px-4 w-full mt-auto hover:bg-gray-100 transition-colors"
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
        ) : (
          <div className="flex flex-col items-center justify-center mt-8">
            <p className="text-gray-500 text-center text-lg font-medium">
              No recipes found
            </p>
            <p className="text-gray-400 text-center text-sm mt-2">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default SearchResults;
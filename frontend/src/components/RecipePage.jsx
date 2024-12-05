import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../config/axios';
import { FaChevronLeft, FaShare, FaHeart, FaRegHeart, FaListUl, FaUtensils, FaStickyNote, FaClock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow, isWithinInterval, subMinutes } from 'date-fns';

const RecipePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);
  const [likedRecipes, setLikedRecipes] = useState(new Set());
  const [moreRecipes, setMoreRecipes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    console.log('Recipe owner ID:', recipe?.user?._id);
    console.log('Current user ID:', localStorage.getItem("userId"));
    console.log('Comments:', comments);
  }, [recipe, comments]);

  useEffect(() => {
    const fetchRecipeAndMore = async () => {
      try {
        const [recipeResponse, moreRecipesResponse, userResponse] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get('/recipes'),
          api.get('/auth/user')
        ]);

        setRecipe(recipeResponse.data);
        
        // Filter out current recipe and get random 10 recipes
        const filteredRecipes = moreRecipesResponse.data
          .filter(r => r._id !== id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);
        
        setMoreRecipes(filteredRecipes);

        // Set liked recipes
        const likedRecipeIds = new Set(userResponse.data.likedRecipes.map(r => r._id));
        setLikedRecipes(likedRecipeIds);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          // Handle unauthorized access
          navigate('/login');
        } else {
          setError(error.response?.data?.message || "Failed to load recipe");
        }
      }
    };

    fetchRecipeAndMore();
  }, [id, navigate]);

  useEffect(() => {
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await api.get(
        `/recipes/${id}/comments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleToggleLike = async (recipeId, e) => {
    e.stopPropagation();
    try {
      if (likedRecipes.has(recipeId)) {
        await api.post(`/recipes/${recipeId}/unlike`);
        setLikedRecipes(prev => {
          const updated = new Set(prev);
          updated.delete(recipeId);
          return updated;
        });
      } else {
        await api.post(`/recipes/${recipeId}/like`);
        setLikedRecipes(prev => new Set(prev).add(recipeId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAddToMealPlan = (recipe, e = null) => {
    if (e) {
      e.stopPropagation(); // Only stop propagation for card clicks
    }
    navigate('/add-to-meal-plan', { state: { recipe } });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/recipes/${id}/comments`, { text: newComment });
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleAddReply = async (commentId) => {
    try {
      console.log('Attempting to add reply to comment:', commentId);
      console.log('Reply text:', newReply);
      
      if (!newReply.trim()) {
        toast.error("Reply cannot be empty");
        return;
      }

      const response = await api.post(
        `/recipes/${id}/comments/${commentId}/reply`,
        { reply: newReply },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      console.log('Reply response:', response.data);

      // Update comments state with the new reply
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId ? response.data : comment
        )
      );
      
      setNewReply('');
      setActiveReplyId(null);
      toast.success("Reply added successfully!");
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error(error.response?.data?.message || "Failed to add reply");
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(
        `/recipes/${id}/comments/${commentToDelete}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setComments(comments.filter(comment => comment._id !== commentToDelete));
      setShowDeleteModal(false);
      setCommentToDelete(null);
      toast.success("Comment deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    
    // Check if less than a minute ago
    if (isWithinInterval(new Date(date), { 
      start: subMinutes(now, 1), 
      end: now 
    })) {
      return 'Just now';
    }
    
    // Otherwise use formatDistanceToNow with custom formatting
    return formatDistanceToNow(new Date(date), { addSuffix: true })
      .replace('about ', '')
      .replace('less than a minute ago', 'Just now')
      .replace(' minutes ago', 'm ago')
      .replace(' minute ago', 'm ago')
      .replace(' hours ago', 'h ago')
      .replace(' hour ago', 'h ago')
      .replace(' days ago', 'd ago')
      .replace(' day ago', 'd ago');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-orange-500 text-white px-4 py-2 rounded-full"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white pb-32">
      <ToastContainer />

      {/* Cover Image Section */}
      <div className="relative h-[40vh]">
        <img
          src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.image}`}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
          >
            <FaChevronLeft className="text-white" size={24} />
          </button>
          <div className="flex gap-4">
            <button className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg">
              <FaShare className="text-white" size={24} />
            </button>
            <button
              onClick={() => handleToggleLike(recipe._id)}
              className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
            >
              {likedRecipes.has(recipe._id) ? (
                <FaHeart className="text-white" size={24} />
              ) : (
                <FaRegHeart className="text-white" size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Main Info Card */}
        <div className="bg-white rounded-t-3xl shadow-lg p-6">
          {/* Stats Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full">
              <FaHeart className="text-orange-500" />
              <span className="font-semibold text-orange-500">{recipe.likes} likes</span>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-full">
              <FaClock className="text-orange-500" />
              <span className="text-orange-500">{recipe.time}</span>
            </div>
          </div>

          {/* Title and Description */}
          <h1 className="text-3xl font-bold text-[#463C33] mb-3">{recipe.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-8">{recipe.description}</p>

          {/* Ingredients Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaListUl className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Ingredients</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl transition-all hover:bg-orange-50"
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-gray-700">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaUtensils className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Cooking Instructions</h2>
            </div>
            <div className="space-y-6">
              {recipe.cookingInstructions.map((instruction, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-700 leading-relaxed">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Author Notes */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500 p-2 rounded-lg">
                <FaStickyNote className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-[#463C33]">Author Notes</h2>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl">
              <p className="text-gray-700 italic">
                {recipe.authorNotes || "No additional notes from the author."}
              </p>
            </div>
          </div>

          {/* Updated User Profile Section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 mx-4">
            <div className="flex flex-col mb-4">
              <div className="flex items-center justify-between mb-3">
                <img
                  src={`http://localhost:5000/${recipe.user.profilePicture}`}
                  alt={recipe.user.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-orange-500"
                />
                <button className="text-orange-500 hover:text-orange-600 underline font-semibold transition-colors">
                  View Profile
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#463C33] break-words">{recipe.user.name}</h3>
                <span className="text-gray-500 text-sm">Recipe Creator</span>
              </div>
            </div>
            <p className="text-gray-600 break-words">
              {recipe.user.aboutMe || "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* More Recipes Section */}
      <div className="mb-28 px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#463C33]">More Recipes</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-orange-500 text-sm font-medium"
          >
            See All
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-4 pb-4">
            {moreRecipes.map((moreRecipe) => (
              <div
                key={moreRecipe._id}
                className="flex-shrink-0 w-64 bg-[#463C33] rounded-xl overflow-hidden cursor-pointer flex flex-col"
                onClick={() => navigate(`/recipes/${moreRecipe._id}`)}
              >
                <div className="relative h-40">
                  <img
                    src={`${import.meta.env.VITE_PROD_BASE_URL}/${moreRecipe.image}`}
                    alt={moreRecipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                    <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-full">
                      {moreRecipe.time}
                    </span>
                    <button
                      onClick={(e) => handleToggleLike(moreRecipe._id, e)}
                      className="text-white bg-black/50 p-2 rounded-full"
                    >
                      {likedRecipes.has(moreRecipe._id) ? (
                        <FaHeart className="text-white" size={16} />
                      ) : (
                        <FaRegHeart size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-bold text-sm line-clamp-2 flex-1 mr-2">
                      {moreRecipe.title}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className="text-white text-xs">{moreRecipe.likes || 0}</span>
                      <FaHeart className="text-white text-xs" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className="block text-white/70 text-xs mb-2">
                      {moreRecipe.calories}
                    </span>
                    <button 
                      onClick={(e) => handleAddToMealPlan(moreRecipe, e)}
                      className="w-full text-sm bg-white text-[#463C33] py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Add to Meal Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mb-24 px-4">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-[#463C33]">Comments</h2>
        </div>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Post
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate(`/user/${comment.user._id}`)}
                >
                  <img
                    src={`${import.meta.env.VITE_PROD_BASE_URL}/${comment.user.profilePicture}`}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-semibold hover:text-orange-500 transition-colors">
                    {comment.user.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              
              <p className="text-gray-700 mb-2">{comment.text}</p>
              
              {/* Update this condition to properly check if current user is recipe owner */}
              {recipe && recipe.user && recipe.user._id === localStorage.getItem("userId") && !comment.reply && (
                <div className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply to this comment..."
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                      value={comment._id === activeReplyId ? newReply : ''}
                      onChange={(e) => {
                        setActiveReplyId(comment._id);
                        setNewReply(e.target.value);
                      }}
                    />
                    <button
                      onClick={() => handleAddReply(comment._id)}
                      className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-600"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
              
              {/* Display reply if it exists */}
              {comment.reply && (
                <div className="mt-2 ml-4 p-2 bg-white rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.user.profilePicture}`}
                        alt={recipe.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm font-semibold">{recipe.user.name}'s reply:</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.replyDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{comment.reply}</p>
                </div>
              )}
              
              {/* Delete button (only visible to recipe owner) */}
              {recipe && recipe.user && recipe.user._id === localStorage.getItem("userId") && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 text-sm mt-2 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Add to Meal Plan Button */}
      <div className="fixed bottom-4 left-0 right-0 bg-white shadow-lg z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <button 
            onClick={() => handleAddToMealPlan(recipe)}
            className="w-full bg-orange-500 text-white font-bold rounded-full py-4 hover:bg-orange-600 transition-colors"
          >
            Add to Meal Plan
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Comment
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                }}
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

      <ToastContainer />
    </div>
  );
};

export default RecipePage; 
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from '../config/axios';
import { 
  FaChevronLeft, 
  FaHeart, 
  FaRegHeart, 
  FaShareAlt, 
  FaFacebook, 
  FaTwitter, 
  FaWhatsapp, 
  FaLink, 
  FaEnvelope, 
  FaClock, 
  FaListUl, 
  FaUtensils, 
  FaStickyNote 
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDistanceToNow, isWithinInterval, subMinutes } from 'date-fns';
import { getImageUrl } from '../utils/imageUtils';

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
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchRecipeAndMore();
    fetchComments();
  }, [id]);

  const fetchRecipeAndMore = async () => {
    try {
      const [recipeResponse, moreRecipesResponse, userResponse] = await Promise.all([
        api.get(`/recipes/${id}`),
        api.get('/recipes'),
        api.get('/auth/user')
      ]);

      setRecipe(recipeResponse.data);
      
      const filteredRecipes = moreRecipesResponse.data
        .filter(r => r._id !== id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
      
      setMoreRecipes(filteredRecipes);
      const likedRecipeIds = new Set(userResponse.data.likedRecipes.map(r => r._id));
      setLikedRecipes(likedRecipeIds);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(error.response?.data?.message || "Failed to load recipe");
      }
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/recipes/${id}/comments`);
      console.log('Fetched comments:', response.data);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      if (!newComment.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      const response = await api.post(`/recipes/${id}/comments`, {
        text: newComment
      });

      setComments(prevComments => [response.data, ...prevComments]);
      setNewComment('');
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const handleAddReply = async (commentId) => {
    try {
      if (!newReply.trim()) {
        toast.error("Reply cannot be empty");
        return;
      }

      console.log('Sending reply request:', {
        commentId,
        reply: newReply,
        recipeId: id
      });

      const response = await api.post(
        `/recipes/${id}/comments/${commentId}/reply`,
        { reply: newReply }
      );

      console.log('Reply response:', response.data);

      if (response.data.comment) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? {
                  ...comment,
                  reply: response.data.comment.reply,
                  replyDate: response.data.comment.replyDate
                }
              : comment
          )
        );
        
        setNewReply('');
        setActiveReplyId(null);
        toast.success("Reply added successfully!");
      }
    } catch (error) {
      console.error("Error adding reply:", error.response?.data || error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to add reply"
      );
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/recipes/${id}/comments/${commentToDelete}`);
      setComments(prevComments => 
        prevComments.filter(comment => comment._id !== commentToDelete)
      );
      setShowDeleteModal(false);
      setCommentToDelete(null);
      toast.success("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleToggleLike = async (recipeId, e = null) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      const response = await api.post(`/recipes/like/${recipeId}`);

      // Update liked recipes set
      setLikedRecipes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(recipeId)) {
          newSet.delete(recipeId);
        } else {
          newSet.add(recipeId);
        }
        return newSet;
      });

      // Update likes count in the current recipe
      if (recipe && recipe._id === recipeId) {
        setRecipe(prev => ({
          ...prev,
          likes: response.data.likes  // Use the likes count from the server response
        }));
      }

      // Update likes count in more recipes list
      setMoreRecipes(prev => 
        prev.map(r => 
          r._id === recipeId 
            ? { 
                ...r, 
                likes: response.data.likes 
              } 
            : r
        )
      );

      toast.success(
        likedRecipes.has(recipeId)
          ? "Recipe removed from favorites!"
          : "Recipe added to favorites!",
        { position: "top-center", autoClose: 2000 }
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleAddToMealPlan = (recipe, e = null) => {
    if (e) {
      e.stopPropagation(); // Only stop propagation for card clicks
    }
    navigate('/add-to-meal-plan', { state: { recipe } });
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

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareOnPlatform = (platform) => {
    if (!recipe) return;

    const recipeUrl = `${window.location.origin}/recipes/${recipe._id}`;
    const shareText = `Check out this delicious recipe: ${recipe.title}`;

    const platforms = {
      facebook: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
        window.open(url, '_blank');
      },
      twitter: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(recipeUrl)}`;
        window.open(url, '_blank');
      },
      whatsapp: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} - ${recipeUrl}`)}`;
        window.open(url, '_blank');
      },
      email: () => {
        const subject = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
        const body = encodeURIComponent(`
I found an amazing recipe that you might love!

Recipe: ${recipe.title}
Description: ${recipe.description}

Check it out here: ${recipeUrl}

Enjoy cooking!
        `);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
      copy: () => {
        navigator.clipboard.writeText(recipeUrl).then(() => {
          toast.success('Recipe link copied to clipboard!', {
            position: "top-center",
            autoClose: 2000
          });
        }).catch(err => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy link', {
            position: "top-center",
            autoClose: 2000
          });
        });
      }
    };

    if (platforms[platform]) {
      platforms[platform]();
      setShowShareModal(false);
    }
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
          src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = getImageUrl('uploads/default-recipe.png');
          }}
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
          >
            <FaChevronLeft className="text-white" size={24} />
          </button>
          <div className="flex gap-4">
            <button 
              onClick={handleShare}
              className="bg-black bg-opacity-60 p-2 rounded-full shadow-lg"
            >
              <FaShareAlt className="text-white" size={24} />
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

          {/* User Profile Section - Centered view profile and fixed navigation */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6 mx-4">
            <div className="flex flex-col items-center mb-4">
              <div 
                className="cursor-pointer w-full flex flex-col items-center" 
                onClick={() => navigate(`/user/${recipe.user?._id}`)}
              >
                <img
                  src={getImageUrl(recipe.user?.profilePicture || 'uploads/default-profile.png')}
                  alt={recipe.user?.name || 'User'}
                  className="w-20 h-20 rounded-full object-cover border-4 border-orange-500"
                  onError={(e) => {
                    e.target.src = getImageUrl('uploads/default-profile.png');
                  }}
                />
                <div className="mt-3 text-center">
                  <h3 className="font-bold text-lg text-[#463C33] break-words">{recipe.user?.name}</h3>
                  <span className="text-gray-500 text-sm">Recipe Creator</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/user/${recipe.user?._id}`)}
                className="mt-4 text-orange-500 hover:text-orange-600 underline font-semibold transition-colors"
              >
                View Profile
              </button>
            </div>
            <p className="text-gray-600 break-words text-center">
              {recipe.user?.aboutMe || "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* More Recipes Section */}
      <div className="my-8 pl-4 sm:pl-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#463C33]">More Recipes</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-orange-500 text-sm font-medium mr-4"
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
                    src={getImageUrl(moreRecipe.image || 'uploads/default-recipe.png')}
                    alt={moreRecipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getImageUrl('uploads/default-recipe.png');
                    }}
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
                      className="bg-white text-[#463C33] font-bold rounded-full py-2 px-3 sm:px-4 mt-3 w-full text-sm sm:text-base"
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
          </div>
        </div>
      </div>

      {/* Comments Section - Added mx-auto and max-w-3xl for better margins */}
      <div className="mt-4 px-4 sm:px-6 mx-auto max-w-3xl">
        <h3 className="text-xl font-bold text-[#463C33] mb-4">Comments</h3>
        
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-2 max-w-full">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 min-w-0 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="whitespace-nowrap bg-orange-500 text-white px-3 py-2 rounded-lg text-sm sm:px-4 sm:text-base"
            >
              Post
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4 mb-20">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="flex items-center gap-2 cursor-pointer" 
                  onClick={() => navigate(`/user/${comment.user._id}`)}
                >
                  <img
                    src={getImageUrl(comment.user?.profilePicture || 'uploads/default-profile.png')}
                    alt={comment.user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = getImageUrl('uploads/default-profile.png');
                    }}
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

              {/* Reply Section */}
              {recipe?.user?._id === localStorage.getItem("userId") && !comment.reply && (
                <div>
                  {activeReplyId === comment._id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 p-2 border rounded-lg"
                      />
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                      >
                        Reply
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveReplyId(comment._id)}
                      className="text-orange-500 text-sm font-medium"
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}

              {/* Display Reply */}
              {comment.reply && (
                <div className="mt-2 ml-4 p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={getImageUrl(recipe.user.profilePicture || 'uploads/default-profile.png')}
                      alt={recipe.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = getImageUrl('uploads/default-profile.png');
                      }}
                    />
                    <span className="font-semibold text-sm">{recipe.user.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.replyDate)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.reply}</p>
                </div>
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

      {/* Delete Comment Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Delete Comment</h3>
            <p className="mb-6">Are you sure you want to delete this comment?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#463C33]">Share Recipe</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <SharePlatformButton 
                icon={<FaFacebook className="text-3xl text-blue-600" />}
                label="Facebook"
                onClick={() => shareOnPlatform('facebook')}
              />
              <SharePlatformButton 
                icon={<FaTwitter className="text-3xl text-blue-400" />}
                label="Twitter"
                onClick={() => shareOnPlatform('twitter')}
              />
              <SharePlatformButton 
                icon={<FaWhatsapp className="text-3xl text-green-500" />}
                label="WhatsApp"
                onClick={() => shareOnPlatform('whatsapp')}
              />
              <SharePlatformButton 
                icon={<FaEnvelope className="text-3xl text-red-500" />}
                label="Email"
                onClick={() => shareOnPlatform('email')}
              />
              <SharePlatformButton 
                icon={<FaLink className="text-3xl text-gray-700" />}
                label="Copy Link"
                onClick={() => shareOnPlatform('copy')}
              />
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

// Helper component for share platform buttons
const SharePlatformButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-2 p-3 hover:bg-gray-100 rounded-lg transition-colors"
  >
    {icon}
    <span className="text-xs text-gray-700">{label}</span>
  </button>
);

export default RecipePage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaHeart } from 'react-icons/fa';
import api from '../config/axios';
import { getImageUrl } from '../utils/imageUtils';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, recipesResponse] = await Promise.all([
          api.get(`/auth/profile/${userId}`),
          api.get(`/recipes/user/${userId}`)
        ]);

        setUser(userResponse.data);
        const sortedRecipes = recipesResponse.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUserRecipes(sortedRecipes);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [userId]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-orange-500 z-50">
        <div className="flex items-center px-4 h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-orange-600 transition-colors"
          >
            <FaChevronLeft size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* User Info Section */}
      <div className="pt-24 px-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500">
            <img
              src={getImageUrl(user.profilePicture || 'uploads/default-profile.png')}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getImageUrl('uploads/default-profile.png');
              }}
            />
          </div>
          
          <h1 className="mt-4 text-xl font-bold text-[#463C33]">{user.name}</h1>
          
          <p className="mt-2 text-gray-600 text-center max-w-md px-4">
            {user.aboutMe || "No description available"}
          </p>

          <div className="mt-6 flex space-x-12">
            <div className="text-center">
              <span className="block text-2xl font-bold text-orange-500">{userRecipes.length}</span>
              <span className="text-sm text-gray-600">Recipes</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-orange-500">
                {userRecipes.reduce((total, recipe) => total + (recipe.likes || 0), 0)}
              </span>
              <span className="text-sm text-gray-600">Total Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div className="mt-8 pl-4 pb-20">
        <h2 className="text-xl font-bold text-[#463C33] mb-4">
          Recipes by {user.name}
        </h2>
        
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex space-x-3 pb-4">
            {userRecipes.map((recipe) => (
              <div
                key={recipe._id}
                className="flex-shrink-0 w-52 bg-[#463C33] rounded-lg shadow-md overflow-hidden cursor-pointer"
                onClick={() => navigate(`/recipes/${recipe._id}`)}
              >
                <div className="relative">
                  <img
                    src={getImageUrl(recipe.image || 'uploads/default-recipe.png')}
                    alt={recipe.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = getImageUrl('uploads/default-recipe.png');
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                    {recipe.time}
                  </span>
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between mb-2 min-h-[40px]">
                    <h3 className="text-white font-bold text-sm line-clamp-2 flex-1 mr-2">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className="text-white text-xs">{recipe.likes || 0}</span>
                      <FaHeart className="text-white text-xs" />
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-white text-[#463C33] text-xs font-bold rounded-full py-1.5 px-3 hover:bg-gray-100 transition-colors mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/add-to-meal-plan', { state: { recipe } });
                    }}
                  >
                    Add to Meal Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
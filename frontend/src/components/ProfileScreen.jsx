import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Header from './Header';
import BottomNavbar from './BottomNavbar';
import api from '../config/axios';
import { toast } from 'react-toastify';

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
        setRecipes(response.data.recipes || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load profile data');
      }
    };

    fetchUserData();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />
      
      {/* Profile Section */}
      <div className="mt-20 px-4">
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-orange-500">
            <img
              src={`${import.meta.env.VITE_PROD_BASE_URL}/${user.profilePicture || 'uploads/default-profile.png'}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-[#463C33]">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate('/edit-profile')}
          className="w-full mt-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      {/* My Recipes Section */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#463C33]">My Recipes</h3>
          <button
            onClick={() => navigate('/add-recipe')}
            className="text-orange-500 font-medium"
          >
            Add New
          </button>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                onClick={() => navigate(`/recipes/${recipe._id}`)}
                className="bg-[#463C33] rounded-lg overflow-hidden cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_PROD_BASE_URL}/${recipe.image}`}
                    alt={recipe.title}
                    className="w-full h-28 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs py-1 px-2 rounded">
                    {recipe.time}
                  </span>
                </div>
                <div className="p-2">
                  <div className="flex items-center space-x-1 mb-1">
                    <FaHeart size={12} className="text-white" />
                    <span className="text-white text-xs">{recipe.likes?.length || 0}</span>
                  </div>
                  <h3 className="text-white font-bold text-sm line-clamp-2">
                    {recipe.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No recipes yet</p>
            <button
              onClick={() => navigate('/add-recipe')}
              className="mt-2 text-orange-500 font-medium"
            >
              Create your first recipe
            </button>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
};

export default ProfileScreen;

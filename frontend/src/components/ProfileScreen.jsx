import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../config/axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { 
  FaChevronLeft, 
  FaRegHeart, 
  FaClipboardList, 
  FaStore, 
  FaCog, 
  FaPhone, 
  FaRegCommentDots, 
  FaInfoCircle, 
  FaSignOutAlt,
  FaUtensils,
  FaHeart,
  FaUsers
} from "react-icons/fa";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", profilePicture: "" });
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data);
      } catch (err) {
        setError("Failed to fetch user profile. Please log in again.");
        console.error(err);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      }
    };
  
    fetchUserProfile();
  }, [navigate]);

  const goBack = () => {
    navigate("/home");
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!", {
      position: "top-center",
      autoClose: 1000,
    });
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  const handleAboutClick = () => {
    setShowAboutModal(true);
  };

  const AboutPantryPalsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">About PantryPals</h2>
          <button 
            onClick={() => setShowAboutModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-700">
          <div className="flex items-center space-x-4 bg-orange-50 p-4 rounded-xl">
            <FaUtensils className="text-orange-500 text-3xl" />
            <div>
              <h3 className="font-bold text-lg">Smart Recipe Management</h3>
              <p className="text-sm">Discover, save, and organize your favorite recipes effortlessly.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-orange-50 p-4 rounded-xl">
            <FaHeart className="text-orange-500 text-3xl" />
            <div>
              <h3 className="font-bold text-lg">Personalized Recommendations</h3>
              <p className="text-sm">Get recipe suggestions tailored to your taste and dietary preferences.</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-orange-50 p-4 rounded-xl">
            <FaUsers className="text-orange-500 text-3xl" />
            <div>
              <h3 className="font-bold text-lg">Community Driven</h3>
              <p className="text-sm">Share, collaborate, and explore recipes from a vibrant community.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="italic text-sm text-gray-600">
              Version 1.0.0 • Made with ❤️ by the PantryPals Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ToastContainer />
      
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 bg-orange-500 shadow-md">
        <div className="flex items-center p-4">
          <button onClick={goBack} className="text-white">
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white ml-4 text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="pt-16 px-4">
        {/* User Profile Card */}
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
            <button
              onClick={handleEditProfile}
              className="mt-2 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate('/favorites')}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center">
              <div className="bg-orange-50 p-2.5 rounded-full group-hover:bg-orange-100 transition-colors">
                <FaRegHeart className="text-orange-500 text-xl" />
              </div>
              <h3 className="mt-4 text-gray-800 font-semibold text-sm sm:text-base whitespace-nowrap">Saved Recipes</h3>
            </div>
          </div>

          <div
            onClick={() => navigate('/my-recipes')}
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex flex-col items-center">
              <div className="bg-orange-50 p-2.5 rounded-full group-hover:bg-orange-100 transition-colors">
                <FaClipboardList className="text-orange-500 text-xl" />
              </div>
              <h3 className="mt-3 text-gray-800 font-semibold text-sm sm:text-base whitespace-nowrap">My Recipes</h3>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          {[/* eslint-disable react/jsx-key */
            { icon: FaCog, text: "Settings" },
            { icon: FaPhone, text: "Contact Support" },
            { icon: FaRegCommentDots, text: "Submit Feedback" },
            { icon: FaInfoCircle, text: "About PantryPals" },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.text === "Submit Feedback") {
                  navigate('/feedback');
                } else if (item.text === "About PantryPals") {
                  handleAboutClick();
                } else {
                  alert(`${item.text} clicked`);
                }
              }}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100"
            >
              <div className="bg-orange-50 p-2 rounded-full">
                <item.icon className="text-orange-500 text-lg" />
              </div>
              <span className="ml-4 text-gray-700 font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <div
          onClick={handleLogoutClick}
          className="mt-6 bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="bg-red-50 p-3 rounded-full group-hover:bg-red-100 transition-colors">
              <FaSignOutAlt className="text-red-500 text-xl" />
            </div>
            <span className="ml-4 text-red-500 font-medium">Logout</span>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Logout
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About PantryPals Modal */}
        {showAboutModal && <AboutPantryPalsModal />}

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default ProfileScreen;
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
  const [showContactSupportModal, setShowContactSupportModal] = useState(false);

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

  const handleContactSupportClick = () => {
    setShowContactSupportModal(true);
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

  const ContactSupportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contact Support</h2>
          <button 
            onClick={() => setShowContactSupportModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-700">
          <div className="bg-orange-50 p-4 rounded-xl">
            <h3 className="font-bold text-lg mb-2">Need Help?</h3>
            <p className="text-sm mb-4">We're here to assist you. Feel free to reach out through any of the following channels:</p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: kitadriand@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Facebook: Kit Adrian Diocares</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>LinkedIn: Kit Adrian Diocares</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="italic text-sm text-gray-600">
              We typically respond within 24-48 hours.
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
      
      {/* Modals */}
      {showAboutModal && <AboutPantryPalsModal />}
      {showContactSupportModal && <ContactSupportModal />}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Logout</h2>
            <p className="text-gray-600 text-center mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-between space-x-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogoutConfirm}
                className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
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
            { icon: FaPhone, text: "Contact Support", onClick: handleContactSupportClick },
            { icon: FaRegCommentDots, text: "Submit Feedback" },
            { icon: FaInfoCircle, text: "About PantryPals" },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.text === "Submit Feedback") {
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

        {/* Bottom Spacing */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default ProfileScreen;
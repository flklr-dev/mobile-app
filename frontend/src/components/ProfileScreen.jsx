import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronLeft, FaRegHeart, FaClipboardList, FaStore, FaCog, FaPhone, FaRegCommentDots, FaInfoCircle, FaSignOutAlt } from "react-icons/fa";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", profilePicture: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://192.168.1.118:5000/auth/profile", {
          headers: { Authorization: token },
        });
        setUser(data);
      } catch (err) {
        setError("Failed to fetch user profile. Please log in again.");
        console.error(err);
      }
    };

    fetchUserProfile();
  }, []);

  const goBack = () => {
    navigate(-1);
  };

  // Handle "Edit Profile" button click
  const handleEditProfile = () => {
    navigate("/edit-profile"); // This will navigate to the EditProfileScreen
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 flex items-center p-4 bg-orange-500 shadow-lg">
        <button onClick={goBack} className="text-white text-2xl">
          <FaChevronLeft />
        </button>
        <h1 className="text-white ml-4 flex justify-center items-center text-xl font-bold">Profile</h1>
      </div>

      {/* User Profile Section */}
      <div className="mt-20 px-6 text-center">
        <div className="flex justify-center mb-4">
          <img
            src={`http://192.168.1.118:5000/${user.profilePicture}`}  // Assuming the image path is served from the backend
            alt="User Avatar"
            className="w-32 h-32 object-cover rounded-full border-4 border-orange-500"
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">{user.name || "Loading..."}</h2>
        <button
          onClick={handleEditProfile}
          className="text-orange-500 text-sm underline"
        >
          Edit Profile
        </button>
      </div>

      {/* Profile Sections */}
      <div className="mt-8 px-6 space-y-4 pb-10">
        {/* Saved Recipes & My Recipes - 2 Columns */}
        <div className="grid grid-cols-2 gap-4">
          {/* Saved Recipes */}
          <div
            onClick={() => alert("Saved Recipes clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-xl"
          >
            <FaRegHeart className="text-white text-3xl mb-2" />
            <h3 className="text-lg font-semibold text-white">Saved Recipes</h3>
          </div>

          {/* My Recipes */}
          <div
            onClick={() => alert("My Recipes clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-xl"
          >
            <FaClipboardList className="text-white text-3xl mb-2" />
            <h3 className="text-lg font-semibold text-white">My Recipes</h3>
          </div>
        </div>

        {/* My Food Preferences - Full Width */}
        <div
          onClick={() => alert("Food Preferences clicked")}
          className="bg-orange-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-xl"
        >
          <FaStore className="text-orange-600 text-3xl mb-2" />
          <h3 className="text-lg font-semibold text-orange-600">My Food Preferences</h3>
          <p className="text-gray-500">Customize your food preferences.</p>
        </div>

        {/* Settings Section */}
        <div className="space-y-4 mt-6">
          {/* Pantry */}
          <div
            onClick={() => alert("Pantry clicked")}
            className="bg-orange-100 p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer hover:shadow-xl"
          >
            <FaStore className="text-orange-600 text-3xl mb-2" />
            <h3 className="text-lg font-semibold text-orange-600">Pantry</h3>
            <p className="text-gray-500">22 products</p>
          </div>

          {/* Settings */}
          <div
            onClick={() => alert("Settings clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex items-center cursor-pointer"
          >
            <FaCog className="text-white text-3xl mr-4" />
            <h3 className="text-lg font-semibold text-white">Settings</h3>
          </div>

          {/* Contact Support */}
          <div
            onClick={() => alert("Contact Support clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex items-center cursor-pointer"
          >
            <FaPhone className="text-white text-3xl mr-4" />
            <h3 className="text-lg font-semibold text-white">Contact Support</h3>
          </div>

          {/* Submit Feedback */}
          <div
            onClick={() => alert("Submit Feedback clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex items-center cursor-pointer hover:shadow-xl"
          >
            <FaRegCommentDots className="text-white text-3xl mr-4" />
            <h3 className="text-lg font-semibold text-white">Submit Feedback</h3>
          </div>

          {/* About PantryPals */}
          <div
            onClick={() => alert("About PantryPals clicked")}
            className="bg-orange-500 p-4 rounded-lg shadow-md flex items-center cursor-pointer hover:shadow-xl"
          >
            <FaInfoCircle className="text-white text-3xl mr-4" />
            <h3 className="text-lg font-semibold text-white">About PantryPals</h3>
          </div>

          {/* Logout */}
          <div
            onClick={() => alert("Logout clicked")}
            className="bg-red-500 p-4 rounded-lg shadow-md flex items-center cursor-pointer hover:shadow-xl"
          >
            <FaSignOutAlt className="text-white text-3xl mr-4" />
            <h3 className="text-lg font-semibold text-white">Logout</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

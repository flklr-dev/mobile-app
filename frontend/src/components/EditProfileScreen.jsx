import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPen } from "react-icons/fa"; // Pencil icon for editing the profile picture

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    aboutMe: "",
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  // Fetch user data from the backend on load
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const { data } = await axios.get("http://192.168.1.118:5000/auth/profile", {
          headers: { Authorization: token },
        });

        // Populate all fields from the fetched data
        setUserData({
          name: data.name,
          aboutMe: data.aboutMe || "", // Use an empty string if aboutMe is missing
          profilePicture: null, // Initialize as null for editing
        });
        setImagePreview(`http://192.168.1.118:5000/${data.profilePicture}`);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to fetch profile details. Please try again.");
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prevData) => ({
        ...prevData,
        profilePicture: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("aboutMe", userData.aboutMe);

    // Only append the profilePicture if it's not null or undefined
    if (userData.profilePicture instanceof File) {
      formData.append("profilePicture", userData.profilePicture);
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put("http://192.168.1.118:5000/auth/update", formData, {
        headers: { Authorization: token },
      });
      setSuccessMessage("Profile updated successfully!"); // Set success message
      setErrorMessage(""); // Clear any previous error
      setTimeout(() => {
        setSuccessMessage(""); // Clear the message after 3 seconds
        navigate("/profile"); // Navigate back to the profile screen after saving
      }, 1000);
    } catch (error) {
      console.error("Error saving profile", error);
      setErrorMessage("Failed to update profile. Please try again.");
      setSuccessMessage(""); // Clear success message in case of an error
    }
  };

  const goBack = () => {
    navigate(-1); // Go back to the previous screen
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10 flex items-center p-4 bg-orange-500 shadow-lg">
        <button onClick={goBack} className="text-white text-2xl">
          &lt;
        </button>
        <h1 className="text-white ml-4 flex justify-center items-center text-xl font-bold">Edit Profile</h1>
        <button onClick={handleSave} className="text-white ml-auto text-lg font-semibold">
          Save
        </button>
      </div>

      {/* Profile Edit Form */}
      <div className="mt-20 px-6 space-y-6 pb-10">
        {/* Success or Error Message */}
        {successMessage && (
          <div className="bg-green-500 text-white text-center p-4 rounded-lg mb-4">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-500 text-white text-center p-4 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={imagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-orange-500"
            />
            {/* Pencil icon for editing the profile picture */}
            <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer">
              <FaPen className="text-white" />
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="absolute bottom-0 right-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-lg font-medium text-orange-500">Name</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Enter your name"
          />
        </div>

        {/* About Me Input */}
        <div>
          <label className="block text-lg font-medium text-orange-500">About Me</label>
          <textarea
            name="aboutMe"
            value={userData.aboutMe}
            onChange={handleChange}
            className="mt-2 block w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="4"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default EditProfileScreen;

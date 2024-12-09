import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../config/axios';
import { FaPen, FaChevronLeft } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    aboutMe: "",
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        
        setUserData({
          name: data.name,
          aboutMe: data.aboutMe || "",
          profilePicture: null,
        });

        const imageUrl = data.profilePicture?.startsWith('http') 
          ? data.profilePicture 
          : `${import.meta.env.VITE_PROD_BASE_URL}/${data.profilePicture}`;
        
        setImagePreview(imageUrl);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch profile details");
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData.name.trim()) {
      toast.error("Name is required!");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name", userData.name.trim());
      formData.append("aboutMe", userData.aboutMe.trim());
      if (userData.profilePicture) {
        formData.append("profilePicture", userData.profilePicture);
      }

      const response = await api.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('Profile update response:', response.data);

      toast.success("Profile updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/profile");
      }, 2000);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-orange-500 z-50">
        <div className="flex justify-between items-center px-4 h-16">
          <button
            onClick={() => navigate(-1)}
            className="text-white"
            disabled={isSubmitting}
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={handleSubmit}
            className="text-white font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="pt-20 px-4 space-y-6">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={imagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-orange-500"
            />
            <label className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full cursor-pointer">
              <FaPen className="text-white" />
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          ></textarea>
        </div>
      </div>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3"></div>
            <p className="text-gray-700">Updating profile...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileScreen;

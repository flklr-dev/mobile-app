import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../config/axios';
import { FaPen, FaChevronLeft } from "react-icons/fa";

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    aboutMe: "",
    profilePicture: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");

        setUserData({
          name: data.name,
          aboutMe: data.aboutMe || "",
          profilePicture: null,
        });
        setImagePreview(`${import.meta.env.VITE_PROD_BASE_URL}/${data.profilePicture}`);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to fetch profile details");
        setShowErrorModal(true);
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
    
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("aboutMe", userData.aboutMe);
      if (userData.profilePicture) {
        formData.append("profilePicture", userData.profilePicture);
      }

      await api.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
      setShowErrorModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-4 hover:text-gray-800"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </button>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-green-600 mb-2">Success</h3>
                <p className="text-gray-600">Profile updated successfully!</p>
              </div>
            </div>
          </div>
        )}

        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
                <p className="text-gray-600 mb-4">{errorMessage}</p>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
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

        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-orange-500 z-50">
          <div className="flex justify-between items-center px-4 h-16">
            <button
              onClick={() => navigate(-1)}
              className="text-white"
            >
              <FaChevronLeft size={24} />
            </button>
            <button
              onClick={handleSubmit}
              className="text-white font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes progress {
    from { width: 0%; }
    to { width: 100%; }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }

  .animate-progress {
    animation: progress 2s linear;
    width: 100%;
  }
`;

if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}

export default EditProfileScreen;
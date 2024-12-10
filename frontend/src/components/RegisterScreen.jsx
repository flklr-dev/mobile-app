import { useState } from "react";
import api from '../config/axios'; // Use the configured axios instance
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { Navigate, useNavigate } from "react-router-dom";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Handle social login attempts
  const handleSocialLogin = () => {
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 2000); // Modal will disappear after 2 seconds
  };

  // Close error modal
  const closeErrorModal = () => {
    setErrorMessage("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    if (!isChecked) {
      setErrorMessage("Please agree to the terms and conditions.");
      return;
    }

    try {
      // Set submitting state
      setIsSubmitting(true);

      const response = await api.post("/auth/register", {
        name,
        email,
        password
      });

      // Clear submitting state
      setIsSubmitting(false);

      // Show success message
      setSuccessMessage("Registration successful! Redirecting to login...");

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      // Clear submitting state
      setIsSubmitting(false);

      // Set error message
      const errorMsg = error.response?.data?.message || "Registration failed";
      setErrorMessage(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mx-4 bg-white px-4 py-8 md:py-16">
      
      {/* Coming Soon Modal */}
      {showModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-black/80 text-white px-6 py-4 rounded-lg z-50 text-center">
          This feature will be available soon!
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={closeErrorModal}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-green-600 mb-2">Success</h3>
              <p className="text-gray-600">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-3">
          Create an Account
        </h1>
        <p className="text-gray-600">
          Get started with PantryPals – your cooking community.
        </p>
      </div>
      <form onSubmit={handleRegister} className="w-full max-w-md space-y-6">
        <input
          type="text"
          value={name}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          value={confirmPassword}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            className="w-5 h-5 mr-3"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span className="text-gray-700">Agree to Terms & Conditions</span>
        </div>

        <button
          type="submit"
          className={`w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition ${!isChecked || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isChecked || isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="my-4 flex items-center justify-center w-full max-w-md">
        <span className="h-px bg-gray-300 flex-1"></span>
        <span className="px-4 text-gray-500 text-sm">or</span>
        <span className="h-px bg-gray-300 flex-1"></span>
      </div>

      <div className="w-full max-w-md flex justify-center gap-6">
        <button 
          onClick={handleSocialLogin}
          className="flex items-center justify-center p-4 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <FaGoogle className="text-red-500" size={24} />
        </button>
        <button 
          onClick={handleSocialLogin}
          className="flex items-center justify-center p-4 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <FaFacebook className="text-blue-500" size={24} />
        </button>
      </div>

      <p className="mt-6 text-gray-700">
        Already have an account?{" "}

        <button
          className="text-orange-500 font-bold underline"
          onClick={() => navigate("/login")}
        >
          Log In
        </button>
      </p>
    </div>
  );
};

export default RegisterScreen;

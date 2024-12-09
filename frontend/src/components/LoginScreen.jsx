import { useState, useEffect } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import api from '../config/axios';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [lastCodeSentTime, setLastCodeSentTime] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCodeSentModal, setShowCodeSentModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check localStorage for existing cooldown
    const storedEmail = localStorage.getItem('resetEmailCooldown');
    const storedTime = localStorage.getItem('resetTimeCooldown');
    
    if (storedEmail && storedTime) {
      const timeLeft = 900000 - (Date.now() - parseInt(storedTime));
      if (timeLeft > 0) {
        setLastCodeSentTime(parseInt(storedTime));
        setTimeRemaining(Math.floor(timeLeft / 1000));
      } else {
        // Clear expired cooldown
        localStorage.removeItem('resetEmailCooldown');
        localStorage.removeItem('resetTimeCooldown');
      }
    }
  }, []);

  const handleSocialLogin = () => {
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, userId, name, email: userEmail, expiresIn } = response.data;
        
        // Store token and user info
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", userEmail);
        
        // Set token expiration
        const expirationTime = new Date().getTime() + expiresIn;
        localStorage.setItem("tokenExpiration", expirationTime);

        // Update axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setSuccessMessage("Login successful!");

        // Use navigate instead of window.location
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    const storedEmail = localStorage.getItem('resetEmailCooldown');
    
    if (lastCodeSentTime && Date.now() - lastCodeSentTime < 900000) {
      const remainingTime = Math.ceil((900000 - (Date.now() - lastCodeSentTime)) / 1000 / 60);
      
      if (storedEmail === resetEmail) {
        setErrorMessage(`Please wait ${remainingTime} minutes before requesting another code`);
        return;
      } else if (storedEmail) {
        setErrorMessage(`Another email is in cooldown. Please wait ${remainingTime} minutes`);
        return;
      }
    }

    try {
      setIsCodeSending(true);
      const response = await api.post("/auth/forgot-password", { email: resetEmail });
      
      // Store cooldown info
      localStorage.setItem('resetEmailCooldown', resetEmail);
      localStorage.setItem('resetTimeCooldown', Date.now().toString());
      
      setLastCodeSentTime(Date.now());
      setTimeRemaining(900); // 15 minutes in seconds
      setShowCodeSentModal(true);
      setTimeout(() => {
        setShowCodeSentModal(false);
        setResetStep(2);
      }, 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setIsCodeSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.post("/auth/reset-password", {
        email: resetEmail,
        resetCode,
        newPassword
      });
      setShowSuccessModal(true);
      setSuccessMessage("Password reset successful!");
      
      // Clear cooldown after successful reset
      localStorage.removeItem('resetEmailCooldown');
      localStorage.removeItem('resetTimeCooldown');
      setTimeRemaining(0);
      setLastCodeSentTime(null);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowForgotPassword(false);
        setResetStep(1);
      }, 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to reset password");
    }
  };

  const closeErrorModal = () => {
    setErrorMessage("");
  };

  const closeSuccessModal = () => {
    setSuccessMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white py-8 md:py-16">
      <div className="w-full max-w-md px-8">
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
        
        {showModal && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-black/80 text-white px-6 py-4 rounded-lg z-50 text-center">
            This feature will be available soon!
          </div>
        )}

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold text-orange-500 mb-4">Reset Password</h2>
              
              {resetStep === 1 && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-orange-500 rounded-lg"
                    required
                  />
                  {timeRemaining > 0 && (
                    <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
                      Please wait {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} before requesting another code
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={timeRemaining > 0}
                    className={`w-full py-2 ${
                      timeRemaining > 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600'
                    } text-white rounded-lg font-bold transition`}
                  >
                    Send Reset Code
                  </button>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter reset code"
                    className="w-full px-4 py-2 border border-orange-500 rounded-lg"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 border border-orange-500 rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition"
                  >
                    Reset Password
                  </button>
                </form>
              )}

              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep(1);
                }}
                className="mt-4 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Code Sent Success Modal */}
        {showCodeSentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Reset Code Sent!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  A reset code has been sent to your email address. Please check your inbox and enter the code below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Password Reset Successful!</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your password has been successfully reset. You can now log in with your new password.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isCodeSending && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-3"></div>
              <p className="text-gray-700">Sending reset code...</p>
            </div>
          </div>
        )}

        <div className="w-full mb-8">
          <h1 className="text-3xl font-bold text-orange-500 mb-3">
            Welcome Back
          </h1>
          <p className="text-gray-600 mb-6">
            Log in to unlock a world of shared recipes and pantry creativity!
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-orange-500 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-orange-500 text-sm underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Log In
          </button>
        </form>

        <div className="my-6 flex items-center justify-center w-full">
          <span className="h-px bg-gray-300 flex-1"></span>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <span className="h-px bg-gray-300 flex-1"></span>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button 
            type="button"
            onClick={handleSocialLogin}
            className="flex items-center justify-center py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <FaGoogle className="mr-2 text-red-500" size={20} />
            Continue with Google
          </button>
          <button 
            type="button"
            onClick={handleSocialLogin}
            className="flex items-center justify-center py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <FaFacebook className="mr-2 text-blue-500" size={20} />
            Continue with Facebook
          </button>
        </div>

        <p className="mt-6 text-gray-700 text-center">
          Don't have an account?{" "}

          <button
            type="button"
            className="text-orange-500 font-bold underline"
            onClick={() => (window.location.href = "/register")}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;

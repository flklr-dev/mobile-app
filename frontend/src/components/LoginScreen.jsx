import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
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

  const handleSocialLogin = () => {
    setShowModal(true);
    setTimeout(() => setShowModal(false), 2000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

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

        toast.success("Login successful!", {
          position: "top-center",
          autoClose: 1000,
        });

        // Use navigate instead of window.location
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending reset request to:', `${api.defaults.baseURL}/auth/forgot-password`);
      const response = await api.post("/auth/forgot-password", { email: resetEmail });
      toast.success("Reset code sent to your email!");
      setResetStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || "Failed to send reset code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/reset-password", {
        email: resetEmail,
        resetCode,
        newPassword
      });
      toast.success("Password updated successfully!");
      setShowForgotPassword(false);
      setResetStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mx-4 min-h-screen bg-white px-4">
      <ToastContainer />
      
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
                <button
                  type="submit"
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold"
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
                  className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold"
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

      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-3">
          Welcome Back
        </h1>
        <p className="text-gray-600 mb-6">
          Log in to unlock a world of shared recipes and pantry creativity!
        </p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
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

      <div className="my-6 flex items-center justify-center w-full max-w-md">
        <span className="h-px bg-gray-300 flex-1"></span>
        <span className="px-4 text-gray-500 text-sm">or</span>
        <span className="h-px bg-gray-300 flex-1"></span>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
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

      <p className="mt-6 text-gray-700">
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
  );
};

export default LoginScreen;

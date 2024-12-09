import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import { FaGoogle, FaFacebook } from "react-icons/fa";
import api from '../config/axios';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);

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
        const { token, userId, name, email, expiresIn } = response.data;
        
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("tokenExpiration", new Date().getTime() + expiresIn);

        toast.success("Login successful!", {
          position: "top-center",
          autoClose: 1000,
        });

        setTimeout(() => (window.location.href = "/home"), 1000);
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

  return (
    <div className="flex flex-col items-center justify-center mx-4 min-h-screen bg-white px-4">
      <ToastContainer />
      
      {showModal && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-black/80 text-white px-6 py-4 rounded-lg z-50 text-center">
          This feature will be available soon!
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
            onClick={() => alert("Forgot Password functionality coming soon!")}
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

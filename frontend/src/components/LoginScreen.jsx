import { useState } from "react";
import api from '../config/axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data && response.data.token) {
        // Save token and userId
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.userId);

        // Show success message
        toast.success("Login successful!", {
          position: "top-center",
          autoClose: 1000,
        });

        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/home";
        }, 1000);
      }
    } catch (error) {
      // Show error message
      toast.error(
        error.response?.data?.message || "Login failed. Please check your credentials.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <ToastContainer />
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-3">Welcome Back</h1>
        <p className="text-gray-600 mb-6">
          Log in to unlock a world of shared recipes and pantry creativity!
        </p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
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

        <div className="text-right">
          <button
            type="button"
            className="text-orange-500 text-sm underline"
            onClick={() => alert("Forgot Password functionality coming soon!")}
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

      <div className="w-full max-w-md flex justify-center gap-6">
        <button className="flex items-center justify-center p-4 border rounded-lg text-gray-700 hover:bg-gray-100 transition">
          <FaGoogle className="text-red-500" size={24} />
        </button>
        <button className="flex items-center justify-center p-4 border rounded-lg text-gray-700 hover:bg-gray-100 transition">
          <FaFacebook className="text-blue-500" size={24} />
        </button>
      </div>

      <p className="mt-6 text-gray-700">
        Don't have an account?{" "}
        <button
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

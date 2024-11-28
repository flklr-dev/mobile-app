import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // Import toast components
import "react-toastify/dist/ReactToastify.css"
import { FaGoogle, FaFacebook, FaInstagram } from "react-icons/fa";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://172.10.59.220:5000/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        // Save token to localStorage
        localStorage.setItem("token", token);

        // Show success toast
        toast.success("Login successful!", {
          position: "top-center",
          autoClose: 1000,
        });

        // Redirect to Home after a short delay
        setTimeout(() => (window.location.href = "/home"), 1000);

        }
    } catch (err) {
      // Show error toast
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-4">
          Log in to unlock a world of shared recipes and pantry creativity!
        </p>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <label className="block text-orange-500 font-bold mb-2">Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border border-orange-500 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block text-orange-500 font-bold mb-2">Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 mb-4 border border-orange-500 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <div className="text-right mb-4">
          <button
            type="button"
            onClick={() => alert("Forgot Password functionality coming soon!")}
            className="text-orange-500 text-sm underline"
          >
            Forgot Password?
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
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
        <button className="flex items-center justify-center py-2 border rounded-full text-gray-700 hover:bg-gray-100 transition">
          <FaGoogle className="mr-2 text-red-500" size={20} />
          Continue with Google
        </button>
        <button className="flex items-center justify-center py-2 border rounded-full text-gray-700 hover:bg-gray-100 transition">
          <FaFacebook className="mr-2 text-blue-500" size={20} />
          Continue with Facebook
        </button>
        <button className="flex items-center justify-center py-2 border rounded-full text-gray-700 hover:bg-gray-100 transition">
          <FaInstagram className="mr-2 text-pink-500" size={20} />
          Continue with Instagram
        </button>
      </div>

      <p className="mt-6 text-gray-700">
        Don’t have an account?{" "}
        <button
          className="text-orange-500 font-bold underline"
          onClick={() => (window.location.href = "/")}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;

import { useState } from "react";
import api from '../config/axios'; // Use the configured axios instance
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaFacebook, FaGoogle } from "react-icons/fa";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isChecked) {
      toast.error("Please agree to the terms and conditions.", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      // Show success toast and redirect
      toast.success("Registration successful! Redirecting to login...", {
        position: "top-center",
        autoClose: 2000,
      });
      setTimeout(() => (window.location.href = "/login"), 1000);
    } catch (err) {
      // Show error toast
      toast.error(err.response?.data?.message || "Registration failed.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen mx-4 bg-white px-4 py-8 md:py-16">
      <ToastContainer />
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-orange-500 mb-3">
          Create an Account
        </h1>
        <p className="text-gray-600 mb-6">
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
          className={`w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isChecked}
        >
          Register
        </button>
      </form>

      <div className="my-4 flex items-center justify-center w-full max-w-md">
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
        Already have an account?{" "}
        <button
          className="text-orange-500 font-bold underline"
          onClick={() => (window.location.href = "/login")}
        >
          Log In
        </button>
      </p>
    </div>
  );
};

export default RegisterScreen;

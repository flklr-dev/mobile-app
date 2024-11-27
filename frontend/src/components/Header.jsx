// src/components/Header.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaBell, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [likedCount, setLikedCount] = useState(0);

  // Fetch the user's liked recipes count
  const fetchLikedCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }
    
        const response = await axios.get("http://localhost:5000/auth/profile", {
          headers: { Authorization: `Bearer ${token}` }, // Use Bearer token format
        });
    
        setLikedCount(response.data.likedRecipes.length); // Get the length of liked recipes array
      } catch (error) {
        console.error("Error fetching liked count:", error.response?.data?.message || error.message);
      }
    };
    
  useEffect(() => {
    // Fetch initially
    fetchLikedCount();
    // Setup polling for updates
    const interval = setInterval(fetchLikedCount, 1000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const isOnFavorites = location.pathname === '/favorites';

  return (
    <div className="fixed top-0 left-0 w-full z-10 flex justify-between items-center p-3 bg-orange-500 shadow-lg">
      {isOnFavorites ? (
        <button 
          className="bg-none text-white p-2"
          onClick={() => navigate(-1)}
        >
          <FaChevronLeft size={22} />
        </button>
      ) : (
        <button className="bg-none text-white p-2">
          <div>Logo</div>
        </button>
      )}
      
      <div className="flex items-center space-x-5">
        <div 
          className="flex items-center bg-white rounded-full p-1 cursor-pointer"
          onClick={() => !isOnFavorites && navigate('/favorites')}
        >
          <FaHeart size={16} className="text-orange-500 ml-1" />
          <span className="text-orange-500 ml-2 mb-1 mr-1">{likedCount}</span>
        </div>
        <button className="bg-none text-white p-2">
          <FaBell size={22} />
        </button>
      </div>
    </div>
  );
};

export default Header;

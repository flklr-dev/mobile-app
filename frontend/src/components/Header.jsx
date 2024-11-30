// src/components/Header.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaBell, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';
import logo from '../assets/pantrypals.png'; // Import the logo
import { API_BASE_URL } from '../config';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [likedCount, setLikedCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch the user's liked recipes count
  const fetchLikedCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
    
        setLikedCount(response.data.likedRecipes.length); // Get the length of liked recipes array
      } catch (error) {
        console.error("Error fetching liked count:", error);
      }
    };
    
  const fetchUnreadNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUnreadNotifications(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Fetch initially
    fetchLikedCount();
    fetchUnreadNotifications();
    
    // Setup polling for updates
    const interval = setInterval(() => {
      fetchLikedCount();
      fetchUnreadNotifications();
    }, 2000);
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
        <img 
          src={logo} 
          alt="PantryPals Logo" 
          className="h-10 object-contain"
          onClick={() => navigate('/home')}
        />
      )}
      
      <div className="flex items-center space-x-5">
        <div 
          className="flex items-center bg-white rounded-full p-1 cursor-pointer"
          onClick={() => !isOnFavorites && navigate('/favorites')}
        >
          <FaHeart size={16} className="text-orange-500 ml-1" />
          <span className="text-orange-500 ml-2 mb-1 mr-1">{likedCount}</span>
        </div>
        <div className="relative">
          <button 
            className="bg-none text-white p-2"
            onClick={() => navigate('/notifications')}
          >
            <FaBell size={22} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

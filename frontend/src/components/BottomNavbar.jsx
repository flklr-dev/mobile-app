import { useState, useEffect } from 'react';
import { FaHome, FaSearch, FaUserAlt, FaHamburger, FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
  // Set 'home' as the default active icon
  const [activeIcon, setActiveIcon] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();  // Get the current route

  // Update active icon when location changes
  useEffect(() => {
    switch (location.pathname) {
      case '/search':
        setActiveIcon('search');
        break;
      case '/add-recipe':
        setActiveIcon('plus');
        break;
      case '/profile':
        setActiveIcon('profile');
        break;
      case '/hamburger':
        setActiveIcon('hamburger');
        break;
      default:
        setActiveIcon('home');
    }
  }, [location]); // Re-run when location changes

  const handleIconClick = (icon) => {
    setActiveIcon(icon);
    // Navigate based on the clicked icon
    switch (icon) {
      case 'home':
        navigate('/home'); // Navigate to the home page (or change the path as necessary)
        break;
      case 'search':
        navigate('/search'); // Navigate to the SearchScreen
        break;
      case 'plus':
        navigate('/add-recipe'); // Navigate to the AddRecipeScreen
        break;
      case 'profile':
        navigate('/profile'); // Navigate to the ProfileScreen
        break;
      case 'hamburger':
        navigate('/hamburger'); // Navigate to the HamburgerScreen
        break;
      default:
        break;
    }
  };

  const handleAddClick = () => {
    setActiveIcon('plus'); // Set the active icon state
    navigate('/add-recipe'); // Navigate to the AddRecipeScreen
  };

  const handleSearchClick = () => {
    setActiveIcon('search'); // Set the active icon state
    navigate('/search'); // Navigate to the SearchScreen
  };

  const handleProfileClick = () => {
    setActiveIcon('profile'); // Set the active icon state
    navigate('/profile'); // Navigate to the SearchScreen
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 w-[93%] mx-auto bg-orange-500 p-3 flex justify-center items-center rounded-3xl">
      {/* Group all 5 icons */}
      <div className="flex space-x-6 w-full justify-center items-center">
        {/* Home */}
        <button 
          className={`flex flex-col items-center ${activeIcon === 'home' ? 'bg-white text-orange-500 border-2 border-orange-500 p-2 rounded-full' : 'text-white p-2'}`}
          onClick={() => handleIconClick('home')}
        >
          <FaHome size={24} />
        </button>

        {/* Search */}
        <button 
          className={`flex flex-col items-center ${activeIcon === 'search' ? 'bg-white text-orange-500 border-2 border-orange-500 p-2 rounded-full' : 'text-white p-2'}`}
          onClick={handleSearchClick}
        >
          <FaSearch size={24} />
        </button>

        {/* Add Button */}
        <button 
          className={`flex flex-col items-center ${activeIcon === 'plus' ? 'bg-white text-orange-500 border-2 border-orange-500 p-2 rounded-full' : 'text-white p-2'}`}
          onClick={handleAddClick}
        >
          <FaPlus size={24} />
        </button>

        {/* Hamburger */}
        <button 
          className={`flex flex-col items-center ${activeIcon === 'hamburger' ? 'bg-white text-orange-500 border-2 border-orange-500 p-2 rounded-full' : 'text-white p-2'}`}
          onClick={() => handleIconClick('hamburger')}
        >
          <FaHamburger size={24} />
        </button>

        {/* Profile */}
        <button 
          className={`flex flex-col items-center ${activeIcon === '[profile]' ? 'bg-white text-orange-500 border-2 border-orange-500 p-2 rounded-full' : 'text-white p-2'}`}
          onClick={handleProfileClick}
        >
          <FaUserAlt size={24} />
        </button>
      </div>
    </div>
  );
};

export default BottomNavbar;

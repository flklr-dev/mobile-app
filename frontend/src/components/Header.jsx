// src/components/Header.js
import React from 'react';
import { FaUserCircle, FaHeart, FaBell } from 'react-icons/fa';

const Header = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-10 flex justify-between items-center p-3 bg-orange-500 shadow-lg">
      <button className="bg-none text-white p-2">
        <FaUserCircle size={24} />
      </button>
      <div className="flex items-center space-x-5">
        <div className="flex items-center bg-white rounded-full p-1">
          <FaHeart size={16} className="text-orange-500 ml-1" />
          <span className="text-orange-500 ml-2 mb-1 mr-1">12</span>
        </div>
        <button className="bg-none text-white p-2">
          <FaBell size={22} />
        </button>
      </div>
    </div>
  );
};

export default Header;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaBell, FaLock, FaGlobe, FaMoon, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../config/axios';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = ['English', 'Spanish', 'French', 'German', 'Italian'];

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/delete-account');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const LanguageModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80">
        <h3 className="text-xl font-bold mb-4">Select Language</h3>
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setShowLanguageModal(false);
                toast.success(`Language changed to ${lang}`);
              }}
              className={`w-full p-3 text-left rounded-lg ${
                language === lang ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowLanguageModal(false)}
          className="mt-4 w-full p-3 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const DeleteAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80">
        <h3 className="text-xl font-bold mb-2">Delete Account</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleDeleteAccount}
            className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Yes, Delete My Account
          </button>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-orange-500 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white"
          >
            <FaChevronLeft size={24} />
          </button>
          <h1 className="text-white ml-4 text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="pt-16 px-4 pb-20">
        {/* Notifications */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
              <div className="bg-orange-50 p-2 rounded-full">
                <FaBell className="text-orange-500 text-lg" />
              </div>
              <span className="ml-3 text-gray-700">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => {
                  setNotifications(!notifications);
                  toast.success(`Notifications ${!notifications ? 'enabled' : 'disabled'}`);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Language */}
          <div
            onClick={() => setShowLanguageModal(true)}
            className="p-4 flex items-center justify-between border-b cursor-pointer"
          >
            <div className="flex items-center">
              <div className="bg-orange-50 p-2 rounded-full">
                <FaGlobe className="text-orange-500 text-lg" />
              </div>
              <span className="ml-3 text-gray-700">Language</span>
            </div>
            <span className="text-gray-500">{language}</span>
          </div>

          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
              <div className="bg-orange-50 p-2 rounded-full">
                <FaMoon className="text-orange-500 text-lg" />
              </div>
              <span className="ml-3 text-gray-700">Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => {
                  setDarkMode(!darkMode);
                  toast.success(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* Change Password */}
          <div
            onClick={() => navigate('/change-password')}
            className="p-4 flex items-center justify-between border-b cursor-pointer"
          >
            <div className="flex items-center">
              <div className="bg-orange-50 p-2 rounded-full">
                <FaLock className="text-orange-500 text-lg" />
              </div>
              <span className="ml-3 text-gray-700">Change Password</span>
            </div>
          </div>

          {/* Delete Account */}
          <div
            onClick={() => setShowDeleteModal(true)}
            className="p-4 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center">
              <div className="bg-red-50 p-2 rounded-full">
                <FaTrash className="text-red-500 text-lg" />
              </div>
              <span className="ml-3 text-red-500">Delete Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLanguageModal && <LanguageModal />}
      {showDeleteModal && <DeleteAccountModal />}
    </div>
  );
};

export default SettingsScreen; 
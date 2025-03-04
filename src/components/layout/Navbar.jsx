import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { FaHome, FaCar, FaCog, FaBars, FaMoon, FaSun, FaSearch } from 'react-icons/fa';
import NotificationBell from '@/components/notifications/NotificationBell';
import SavedListingsButton from '@/components/listings/SavedListingsButton';
import AdvancedSearchModal from '@/components/search/AdvancedSearchModal';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Open Advanced Search Modal
  const openSearchModal = (category) => {
    setSelectedCategory(category);
    setShowSearchModal(true);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Marketplace
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('home')}</Link>
            <Link to="/listings" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('browse')}</Link>

            {/* Advanced Search Buttons */}
            <button
              onClick={() => openSearchModal('vehicles')}
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaCar className="mr-2" /> {t('vehicles')}
            </button>
            <button
              onClick={() => openSearchModal('real-estate')}
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FaHome className="mr-2" /> {t('real_estate')}
            </button>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <SavedListingsButton />
              <NotificationBell />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-500" />}
              </button>

              {/* Profile Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full" />
                    <span className="text-gray-700 dark:text-gray-300">{user.username}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t('profile')}</Link>
                      <Link to="/messages" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t('messages')}</Link>
                      <Link to="/create-listing" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">{t('create_listing')}</Link>
                      <Link to="/settings" className="block px-4 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FaCog className="mr-2" /> {t('settings')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('login')}</Link>
                  <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{t('register')}</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-700 dark:text-gray-300">
            <FaBars className="text-xl" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t py-2 absolute top-16 left-0 right-0 shadow-lg">
            <div className="flex flex-col items-center space-y-3">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('home')}</Link>
              <Link to="/listings" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('browse')}</Link>
              
              {/* Categories */}
              <button onClick={() => openSearchModal('vehicles')} className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('vehicles')}</button>
              <button onClick={() => openSearchModal('real-estate')} className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('real_estate')}</button>

              {/* Mobile Actions */}
              <div className="flex space-x-4">
                <SavedListingsButton />
                <NotificationBell />
                <button onClick={toggleDarkMode}>{darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-500" />}</button>
              </div>

              {/* Mobile Profile Menu */}
              {user ? (
                <>
                  <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('profile')}</Link>
                  <Link to="/messages" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('messages')}</Link>
                  <Link to="/create-listing" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('create_listing')}</Link>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700">{t('logout')}</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">{t('login')}</Link>
                  <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{t('register')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Advanced Search Modal */}
      {showSearchModal && (
        <AdvancedSearchModal 
          category={selectedCategory} 
          onClose={() => setShowSearchModal(false)} 
        />
      )}
    </>
  );
};

export default Navbar;

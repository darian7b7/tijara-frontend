import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { SearchBar, Tooltip } from "@/components/ui";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ListingCategory } from "@/types";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaList,
  FaFileAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showListingsMenu, setShowListingsMenu] = useState(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (showListingsMenu) setShowListingsMenu(false);
  };

  const toggleListingsMenu = () => {
    setShowListingsMenu(!showListingsMenu);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const dropdownClasses =
    "absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50";
  const activeDropdownClasses = "block";
  const inactiveDropdownClasses = "hidden";

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-gray-800 dark:text-white"
            >
              {t("navigation.home")}
            </Link>
            <div className="hidden md:flex md:ml-6 space-x-4">
              <Link
                to="/vehicles"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2"
              >
                {t("navigation.vehicles")}
              </Link>
              <Link
                to="/real-estate"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2"
              >
                {t("navigation.real_estate")}
              </Link>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center">
            <div className="w-full">
              <SearchBar
                onSearch={handleSearch}
                placeholder={t("search.placeholder")}
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Listings Menu */}
                <div className="relative">
                  <Tooltip content={t("navigation.listings")} position="bottom">
                    <button
                      onClick={toggleListingsMenu}
                      className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <FaList className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  <div
                    className={`${dropdownClasses} w-48 ${showListingsMenu ? activeDropdownClasses : inactiveDropdownClasses}`}
                  >
                    <Link
                      to="/create-listing"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowListingsMenu(false)}
                    >
                      <FaPlus className="mr-2" />
                      {t("navigation.create_listing")}
                    </Link>
                    <Link
                      to="/profile?tab=listings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowListingsMenu(false)}
                    >
                      <FaFileAlt className="mr-2" />
                      {t("profile.my_listings")}
                    </Link>
                  </div>
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Theme Switcher */}
                <Tooltip
                  content={
                    theme === "dark" ? t("theme.light") : t("theme.dark")
                  }
                  position="bottom"
                >
                  <button
                    onClick={toggleTheme}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    {theme === "dark" ? (
                      <FaSun className="h-5 w-5" />
                    ) : (
                      <FaMoon className="h-5 w-5" />
                    )}
                  </button>
                </Tooltip>

                {/* Profile Menu */}
                <div className="relative">
                  <Tooltip content={t("profile.title")} position="bottom">
                    <button
                      onClick={toggleProfileMenu}
                      className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      <FaUser className="h-5 w-5" />
                    </button>
                  </Tooltip>
                  <div
                    className={`${dropdownClasses} w-48 ${showProfileMenu ? activeDropdownClasses : inactiveDropdownClasses}`}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaUser className="mr-2" />
                      {t("profile.title")}
                    </Link>
                    <Link
                      to="/profile/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaCog className="mr-2" />
                      {t("settings.title")}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaSignOutAlt className="mr-2" />
                      {t("auth.logout")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  {t("Login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  {t("Register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

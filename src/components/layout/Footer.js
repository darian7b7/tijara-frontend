import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              About Marketplace
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your trusted platform for buying and selling second-hand items.
              Connect with local sellers and find great deals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/listings"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/create-listing"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Create Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/category/electronics"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  to="/category/furniture"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  to="/category/clothing"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  Clothing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400">
                Email: support@marketplace.com
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Phone: (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
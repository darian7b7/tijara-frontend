import React from 'react';
import { FaUserShield, FaUserSlash } from 'react-icons/fa';

const PrivacySettings = ({ settings, onChange }) => {
  const { profileVisibility, blockedUsers, onlineStatus, contactPermission } = settings;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaUserShield className="mr-2" />
        Privacy Settings
      </h2>

      {/* Profile Visibility */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
        <select
          value={profileVisibility}
          onChange={(e) => onChange('profileVisibility', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="contacts">Contacts Only</option>
        </select>
      </div>

      {/* Contact Permissions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Who Can Contact Me</h3>
        <select
          value={contactPermission}
          onChange={(e) => onChange('contactPermission', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="everyone">Everyone</option>
          <option value="verified">Verified Users Only</option>
          <option value="none">No One</option>
        </select>
      </div>

      {/* Online Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span>Show Online Status</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={onlineStatus}
              onChange={(e) => onChange('onlineStatus', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Blocked Users */}
      <div>
        <h3 className="text-lg font-medium mb-4">Blocked Users</h3>
        <div className="space-y-2">
          {blockedUsers.length === 0 ? (
            <p className="text-gray-500">No blocked users</p>
          ) : (
            blockedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center">
                  <FaUserSlash className="mr-2" />
                  <span>{user.username}</span>
                </div>
                <button
                  onClick={() => onChange('blockedUsers', blockedUsers.filter(u => u.id !== user.id))}
                  className="text-red-500 hover:text-red-600"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings; 

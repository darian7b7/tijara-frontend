import React from 'react';
import { FaShieldAlt, FaGoogle, FaFacebook, FaApple, FaClock } from 'react-icons/fa';

const SecuritySettings = ({ settings = {}, onChange }) => {
  const {
    twoFactorEnabled = false,
    twoFactorMethod = "email",
    loginActivity = [],
    connectedAccounts = [],
    autoLogoutTime = 0
  } = settings;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <FaShieldAlt className="mr-2" />
        Security Settings
      </h2>

      {/* Auto-Logout Timer */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FaClock className="mr-2" />
          Auto-Logout Timer
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select how long to wait before automatically logging you out when inactive
          </p>
          <select
            value={autoLogoutTime}
            onChange={(e) => onChange('autoLogoutTime', parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="0">Never</option>
            <option value="1">1 Hour</option>
            <option value="12">12 Hours</option>
            <option value="24">24 Hours</option>
          </select>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Enable 2FA</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => onChange('twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {twoFactorEnabled && (
            <select
              value={twoFactorMethod}
              onChange={(e) => onChange('twoFactorMethod', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="authenticator">Authenticator App</option>
            </select>
          )}
        </div>
      </div>

      {/* Login Activity */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Recent Login Activity</h3>
        <div className="space-y-2">
          {loginActivity.length > 0 ? (
            loginActivity.map((login, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">{login.device || "Unknown Device"}</p>
                  <p className="text-sm text-gray-500">{login.location || "Unknown Location"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{login.time || "Unknown Time"}</p>
                  <p className="text-xs text-gray-400">{login.ip || "Unknown IP"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No login activity available.</p>
          )}
        </div>
      </div>

      {/* Connected Accounts */}
      <div>
        <h3 className="text-lg font-medium mb-4">Connected Accounts</h3>
        <div className="space-y-3">
          {[
            { id: 'google', icon: <FaGoogle />, name: 'Google' },
            { id: 'facebook', icon: <FaFacebook />, name: 'Facebook' },
            { id: 'apple', icon: <FaApple />, name: 'Apple' }
          ].map(provider => (
            <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex items-center">
                <span className="text-xl mr-3">{provider.icon}</span>
                <span>{provider.name}</span>
              </div>
              <button
                onClick={() => {
                  const isConnected = connectedAccounts.includes(provider.id);
                  onChange('connectedAccounts', 
                    isConnected 
                      ? connectedAccounts.filter(id => id !== provider.id)
                      : [...connectedAccounts, provider.id]
                  );
                }}
                className={`px-4 py-2 rounded ${
                  connectedAccounts.includes(provider.id)
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {connectedAccounts.includes(provider.id) ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

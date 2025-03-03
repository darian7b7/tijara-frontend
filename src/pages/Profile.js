import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ListingGrid from '../components/listings/common/ListingGrid';
import api from "../config/axios.config";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userListings, setUserListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePicture);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        if (!user || !user._id) return;
    
        const token = localStorage.getItem("token");
        const response = await api.get("/api/listings/user", {  
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setUserListings(response.data.listings);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError(t("error_loading_listings"));
      } finally {
        setListingsLoading(false);
      }
    };
    
    fetchUserListings();
  }, [user, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      
      if (avatar) {
        formDataToSend.append('profilePicture', avatar);
      }

      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error(t('password_mismatch'));
        }
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      const response = await api.put('/api/user/profile', formDataToSend, {   
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data);
      setSuccess(t('settings_saved'));
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {t('profile')}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : 'space-x-6'}`}>
            <div className="relative">
              <img
                src={avatarPreview}
                alt={formData.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">{t('upload_photo')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('click_to_update_profile_picture')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">
              {t('bio')}
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">{t('change_password')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {t('current_password')}
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {t('new_password')}
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  {t('confirm_password')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? t('saving_changes') : t('save')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          {t('my_listings')}
        </h2>
        {listingsLoading ? (
          <div className="text-center py-4">{t('loading')}</div>
        ) : (
          <ListingGrid listings={userListings} />
        )}
      </div>
    </div>
  );
};

export default Profile;
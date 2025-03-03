import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios.config';
import ImageManager from './images/ImageManager';
import AdvancedDetails from './details/AdvancedDetails';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: '',
    images: [],
    category: '',
    subcategory: '',
    location: '',
    details: {},
    transactionType: '',
  });

  const [editPermissions, setEditPermissions] = useState({
    canEditMakeModel: false,
    canEditYearMileage: false,
    canEditLocation: false,
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/${id}`);
        const listing = response.data;

        if (listing.seller._id !== user._id) {
          navigate('/profile');
          return;
        }

        const createdAt = new Date(listing.createdAt);
        const now = new Date();
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        setFormData({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          condition: listing.condition,
          images: listing.images,
          category: listing.category,
          subcategory: listing.subcategory,
          location: listing.location,
          details: listing.details || {},
          transactionType: listing.transactionType || '',
        });

        setEditPermissions({
          canEditMakeModel: hoursSinceCreation <= 1, // Can edit for 1 hour
          canEditYearMileage: hoursSinceCreation <= 24, // Can edit for 24 hours
          canEditLocation: hoursSinceCreation <= 24, // Can edit for 24 hours
        });

        setLoading(false);
      } catch (error) {
        setError('Failed to fetch listing');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user._id, navigate]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setError('');
      setSuccess('');
      await api.put(`/${id}`, formData);
      setSuccess('Listing updated successfully!');
    } catch (error) {
      setError('Failed to update listing. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Listing</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
            rows="4"
          ></textarea>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => updateFormData('price', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        {/* Category - LOCKED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category <span className="text-red-500 text-xs">(Cannot be changed)</span>
          </label>
          <input
            type="text"
            value={`${formData.category} > ${formData.subcategory}`}
            disabled
            className="w-full px-4 py-2 rounded-lg border bg-gray-200 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Transaction Type - LOCKED */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transaction Type <span className="text-red-500 text-xs">(Cannot be changed)</span>
          </label>
          <input
            type="text"
            value={formData.transactionType}
            disabled
            className="w-full px-4 py-2 rounded-lg border bg-gray-200 text-gray-700 cursor-not-allowed"
          />
        </div>

        {/* Advanced Details */}
        <AdvancedDetails
          category={formData.category}
          details={formData.details}
          updateFormData={updateFormData}
          disableMakeModel={!editPermissions.canEditMakeModel}
          disableYearMileage={!editPermissions.canEditYearMileage}
        />

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location {editPermissions.canEditLocation ? '' : <span className="text-red-500 text-xs">(Locked after 24 hours)</span>}
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            disabled={!editPermissions.canEditLocation}
            className={`w-full px-4 py-2 rounded-lg border ${!editPermissions.canEditLocation ? 'bg-gray-200 text-gray-700 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Image Upload */}
        <ImageManager images={formData.images} onImagesChange={(newImages) => updateFormData('images', newImages)} maxImages={5} />

        {/* Save Changes Button */}
        <button
          onClick={handleSaveChanges}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditListing;

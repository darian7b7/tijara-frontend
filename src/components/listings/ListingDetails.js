import React, { useState, useEffect, useCallback } from 'react';
import { formatDistance } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios.config';
import ImageManager from './images/ImageManager';  

const ListingDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchListing = useCallback(async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError(t('error_loading_listing'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const isRTL = i18n.language === 'ar';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl text-red-600">{error}</h3>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <ImageManager images={listing.images} isRTL={isRTL} />
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{listing.title}</h1>
          <span className="text-2xl font-bold text-blue-500">
            {isRTL ? 
              `${listing.price.toLocaleString()} $` : 
              `$${listing.price.toLocaleString()}`
            }
          </span>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{t('location')}:</span> {listing.location}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{t('category')}:</span> {t(listing.mainCategory)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{t('subcategory')}:</span> {t(listing.subcategory)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{t('transaction_type')}:</span> {t(listing.transactionType)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{t('condition')}:</span> {t(listing.condition)}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('description')}</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{listing.description}</p>
          </div>

          <div className={`flex items-center mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <img
              src={listing.seller.profilePicture}
              alt={listing.seller.username}
              className={`w-12 h-12 rounded-full ${isRTL ? 'ml-4' : 'mr-4'}`}
            />
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {listing.seller.username}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('listed_time', {
                  time: formatDistance(new Date(listing.createdAt), new Date(), { addSuffix: true })
                })}
              </p>
            </div>
          </div>

          <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} justify-between items-center`}>
            {user && user._id === listing.seller._id ? (
              <div className={`space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
                <button
                  onClick={() => navigate(`/edit-listing/${listing._id}`)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm(t('confirm_delete_listing'))) {
                      try {
                        await api.delete(`/${id}`);
                        navigate('/my-listings');
                      } catch {
                        setError(t('error_deleting_listing'));
                      }
                    }
                  }}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                >
                  {t('delete')}
                </button>
              </div>
            ) : (
              user && (
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {t('contact_seller')}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {t('message_seller')}
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                setSending(true);
                await api.post('/messages', {
                  receiverId: listing.seller._id,
                  content: message,
                  listingId: listing._id,
                });
                setShowMessageModal(false);
                setMessage('');
                navigate('/messages');
              } catch {
                setError(t('error_sending_message'));
              } finally {
                setSending(false);
              }
            }}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                placeholder={t('write_message_placeholder')}
                required
              />
              <div className={`flex justify-end space-x-4 ${isRTL ? 'space-x-reverse' : ''} mt-4`}>
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {sending ? t('sending') : t('send')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetails;

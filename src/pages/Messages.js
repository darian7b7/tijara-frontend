import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/chat/ChatBox';
import api from '../config/axios.config';
import io from 'socket.io-client';

const Messages = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Join conversation room when selected
  useEffect(() => {
    if (socket && currentConversation) {
      socket.emit('join_room', currentConversation._id);
    }
  }, [socket, currentConversation]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }
  }, [socket]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError(t('error_loading_conversations'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, t]);

  // Fetch messages for current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;

      try {
        const response = await api.get(`/messages/conversations/${currentConversation._id}`);
        setMessages(response.data);
      } catch (error) {
        setError(t('error_loading_messages'));
      }
    };

    fetchMessages();
  }, [currentConversation, t]);

  const handleSendMessage = async (content) => {
    try {
      const response = await api.post('/messages', {
        conversationId: currentConversation._id,
        content,
      });

      socket.emit('send_message', {
        ...response.data,
        conversationId: currentConversation._id,
      });

      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      setError(t('error_sending_message'));
    }
  };

  const isRTL = i18n.language === 'ar';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex">
        <div className={`w-1/3 border-${isRTL ? 'l' : 'r'} dark:border-gray-700`}>
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t('messages')}</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                onClick={() => setCurrentConversation(conversation)}
                className={`w-full p-4 text-${isRTL ? 'right' : 'left'} hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  currentConversation?._id === conversation._id
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''
                }`}
              >
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <img
                    src={conversation.listing.images[0]}
                    alt={conversation.listing.title}
                    className={`w-12 h-12 rounded-lg object-cover ${isRTL ? 'ml-4' : 'mr-4'}`}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {conversation.listing.title}
                    </h3>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {currentConversation ? (
            <ChatBox
              conversation={currentConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              isRTL={isRTL}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('select_conversation')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
import React, { useState, useRef, useEffect } from 'react';
import { formatDistance } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const ChatBox = ({ conversation, onSendMessage, messages }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700">
        <div className="flex items-center">
          <img
            src={conversation.listing.images[0]}
            alt={conversation.listing.title}
            className="w-12 h-12 rounded-lg object-cover mr-4"
          />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {conversation.listing.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${conversation.listing.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.sender._id === user._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.sender._id === user._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              } rounded-lg px-4 py-2`}
            >
              <p className="break-words">{message.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {formatDistance(new Date(message.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox; 
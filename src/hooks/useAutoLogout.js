import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const useAutoLogout = (autoLogoutTime) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const resetTimer = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // If auto-logout is disabled (0), don't set new timers
    if (!autoLogoutTime) return;

    const timeoutMs = autoLogoutTime * 60 * 60 * 1000; // Convert hours to milliseconds
    const warningMs = timeoutMs - (5 * 60 * 1000); // Show warning 5 minutes before logout

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      // You can implement a warning notification here
      console.warn('Session will expire in 5 minutes');
    }, warningMs);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      // Perform logout
      localStorage.removeItem('token');
      navigate('/login');
    }, timeoutMs);

    // Update last active timestamp on server
    try {
      await api.post('/user/activity');
    } catch (error) {
      console.error('Failed to update activity timestamp:', error);
    }
  };

  useEffect(() => {
    // Reset timer on mount and when autoLogoutTime changes
    resetTimer();

    // Add event listeners for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [autoLogoutTime]);

  return resetTimer;
};

export default useAutoLogout;

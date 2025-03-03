import React from 'react';
import './config/i18n';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './assets/css/index.css';

// Initialize any third-party services or configurations
import './config/axios.config';

// Enable strict mode for better development experience
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
); 
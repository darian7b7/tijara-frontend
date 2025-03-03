import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SavedListingsProvider } from './context/SavedListingsContext';
import { LanguageProvider } from './context/LanguageContext';
import Routes from './Routes';
import './assets/css/index.css';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <NotificationProvider>
                <SavedListingsProvider>
                  <Routes />
                </SavedListingsProvider>
              </NotificationProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
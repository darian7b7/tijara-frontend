import React, { createContext, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../config/axios.config";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await api.get("/api/users/settings");
        const userLanguage = response.data?.preferences?.language || "en";
        setLanguage(userLanguage);
        await i18n.changeLanguage(userLanguage);
      } catch (error) {
        console.error("Failed to load language settings:", error);
        setLanguage("en");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguage();
  }, [i18n]);

  const changeLanguage = async (newLang) => {
    try {
      await i18n.changeLanguage(newLang);
      setLanguage(newLang);
      
      const token = localStorage.getItem("token");
      if (!token) return;
      
      await api.post("/api/users/settings", {
        preferences: { language: newLang }
      });
    } catch (error) {
      console.error("Error updating language preference:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {loading ? <p>Loading language...</p> : children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
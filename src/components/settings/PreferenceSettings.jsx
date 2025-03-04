import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/config/axios.config";
import { useTranslation } from 'react-i18next';

const PreferenceSettings = ({ settings }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation(); // Add this line
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleLanguageChange = async (newLang) => {
    setLoading(true);
    try {
      await api.post("/api/users/settings", {
        preferences: { language: newLang }
      });

      setLanguage(newLang); // Update global context
      setSuccess(t("Language updated successfully!")); // Use translation
    } catch (err) {
      console.error("Error updating language:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">{t("preferences")}</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{t("language")}</h3>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          {/* Add other languages */}
        </select>
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </div>

      {loading && <p className="text-blue-500">{t("Saving changes...")}</p>}
    </div>
  );
};

export default PreferenceSettings;

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SecuritySettings from "../components/settings/SecuritySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import PreferenceSettings from "../components/settings/PreferenceSettings";
import DeleteAccount from "../components/settings/DeleteAccount";
import api from "../config/axios.config";

const ProfileSettings = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError(t("error_not_authenticated"));
          setLoading(false);
          return;
        }

        const response = await api.get("/api/users/settings");
        setSettings(response.data || {});
      } catch (err) {
        console.error("Failed to load settings", err);
        setError(t("error_loading_settings"));
        setSettings({});
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [t]);

  const isRTL = i18n.language === "ar";

  if (loading) {
    return <div className="text-center py-4">{t("loading")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={isRTL ? "rtl" : "ltr"}>
      <h1 className={`text-3xl font-bold mb-8 ${isRTL ? "text-right" : "text-left"}`}>
        {t("profile_settings")}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <SecuritySettings settings={settings.security || {}} isRTL={isRTL} />
        <NotificationSettings settings={settings.notifications || { email: {}, push: false }} isRTL={isRTL} />
        <PrivacySettings settings={settings.privacy || { blockedUsers: [] }} isRTL={isRTL} />
        <PreferenceSettings settings={settings.preferences || {}} isRTL={isRTL} />
        <DeleteAccount isRTL={isRTL} />
      </div>
    </div>
  );
};

export default ProfileSettings;
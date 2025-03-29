import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { UserAPI } from "@/api/user.api";
import type { UserProfile, UserSettings, UserPreferences } from "@/types/user";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";

interface FormData {
  username: string;
  email: string;
  bio?: string;
  settings: UserSettings | null;
}

export const ProfileInfo = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    username: user?.username || "",
    email: user?.email || "",
    bio: (user as UserProfile)?.bio || "",
    settings: null,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    user?.profilePicture,
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await UserAPI.getSettings();
        if (response.success && response.data) {
          setFormData((prev) => ({
            ...prev,
            settings: response.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const newValue = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;

    setFormData((prev) => {
      if (!prev.settings) return prev;

      const [category, setting] = name.split(".");
      return {
        ...prev,
        settings: {
          ...prev.settings,
          preferences: {
            ...prev.settings.preferences,
            [category]: {
              ...(prev.settings.preferences[
                category as keyof UserPreferences
              ] as any),
              [setting]: newValue,
            },
          },
        },
      };
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      if (formData.bio) formDataToSend.append("bio", formData.bio);
      if (avatar) formDataToSend.append("profilePicture", avatar);

      const profileResponse = await UserAPI.updateProfile(formDataToSend);
      if (!profileResponse.success) {
        throw new Error(
          typeof profileResponse.error === "string"
            ? profileResponse.error
            : "Failed to update profile",
        );
      }

      if (formData.settings) {
        const settingsResponse = await UserAPI.updateSettings(
          formData.settings,
        );
        if (!settingsResponse.success) {
          throw new Error(
            typeof settingsResponse.error === "string"
              ? settingsResponse.error
              : "Failed to update settings",
          );
        }
      }

      toast.success(t("profile.updated"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("profile.update_error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || t("profile.load_error")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={avatarPreview || "/default-avatar.png"}
            alt={formData.username}
            className="w-24 h-24 rounded-full object-cover"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600"
          >
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <span className="text-sm">{t("profile.change_avatar")}</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("profile.username")}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("profile.email")}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("profile.bio")}
          </label>
          <textarea
            name="bio"
            value={formData.bio || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {formData.settings && (
          <div className="col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t("profile.settings")}
            </h3>

            <div className="flex items-center space-x-4">
              <input
                id="emailNotifications"
                type="checkbox"
                name="notifications.emailNotifications"
                checked={
                  formData.settings.preferences.notifications.emailNotifications
                }
                onChange={handleSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="emailNotifications"
                className="text-sm text-gray-700"
              >
                {t("profile.email_notifications")}
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <input
                id="newMessages"
                type="checkbox"
                name="emailPreferences.newMessages"
                checked={
                  formData.settings.preferences.emailPreferences.newMessages
                }
                onChange={handleSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="newMessages" className="text-sm text-gray-700">
                {t("profile.new_messages")}
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <input
                id="listingUpdates"
                type="checkbox"
                name="emailPreferences.listingUpdates"
                checked={
                  formData.settings.preferences.emailPreferences.listingUpdates
                }
                onChange={handleSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="listingUpdates" className="text-sm text-gray-700">
                {t("profile.listing_updates")}
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <input
                id="promotions"
                type="checkbox"
                name="emailPreferences.promotions"
                checked={
                  formData.settings.preferences.emailPreferences.promotions
                }
                onChange={handleSettingsChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="promotions" className="text-sm text-gray-700">
                {t("profile.promotions")}
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? t("common.saving") : t("common.save_changes")}
        </button>
      </div>
    </form>
  );
};

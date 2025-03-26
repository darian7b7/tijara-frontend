import { useTranslation } from "react-i18next";
import { LanguageCode, ThemeType } from "@/types/settings";
import type {
  NotificationPreferences,
  PreferenceSettings as PreferenceSettingsType,
} from "@/types/settings";

const SUPPORTED_LANGUAGES = [
  { code: LanguageCode.EN, label: "English" },
  { code: LanguageCode.ES, label: "Español" },
  { code: LanguageCode.FR, label: "Français" },
  { code: LanguageCode.DE, label: "Deutsch" },
  { code: LanguageCode.AR, label: "العربية" },
];

const SUPPORTED_THEMES = [
  { value: ThemeType.LIGHT, label: "Light" },
  { value: ThemeType.DARK, label: "Dark" },
  { value: ThemeType.SYSTEM, label: "System" },
];

interface Props {
  settings: PreferenceSettingsType;
  onUpdate: (settings: PreferenceSettingsType) => void;
  isRTL: boolean;
}

function PreferenceSettings({ settings, onUpdate, isRTL }: Props) {
  const { t } = useTranslation();

  const handleChange = (key: keyof PreferenceSettingsType, value: any) => {
    onUpdate({
      ...settings,
      [key]: value,
    });
  };

  const handleNotificationChange = (key: keyof NotificationPreferences) => {
    const notifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key],
    };
    handleChange("notifications", notifications);
  };

  const timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}>
      <div>
        <h3 className="text-lg font-medium">{t("language")}</h3>
        <select
          value={settings.language}
          onChange={(e) =>
            handleChange("language", e.target.value as LanguageCode)
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("theme")}</h3>
        <select
          value={settings.theme}
          onChange={(e) => handleChange("theme", e.target.value as ThemeType)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {SUPPORTED_THEMES.map((theme) => (
            <option key={theme.value} value={theme.value}>
              {theme.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("timezone")}</h3>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {timezones.map((timezone) => (
            <option key={timezone} value={timezone}>
              {timezone}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">{t("notifications")}</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="email"
                type="checkbox"
                checked={settings.notifications.email}
                onChange={() => handleNotificationChange("email")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="email" className="font-medium text-gray-700">
                {t("emailNotifications")}
              </label>
              <p className="text-gray-500">{t("receiveUpdatesViaEmail")}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="push"
                type="checkbox"
                checked={settings.notifications.push}
                onChange={() => handleNotificationChange("push")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="push" className="font-medium text-gray-700">
                {t("pushNotifications")}
              </label>
              <p className="text-gray-500">{t("receivePushNotifications")}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="messages"
                type="checkbox"
                checked={settings.notifications.messages}
                onChange={() => handleNotificationChange("messages")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="messages" className="font-medium text-gray-700">
                {t("messageNotifications")}
              </label>
              <p className="text-gray-500">
                {t("getNotifiedAboutNewMessages")}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="marketing"
                type="checkbox"
                checked={settings.notifications.marketing}
                onChange={() => handleNotificationChange("marketing")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="marketing" className="font-medium text-gray-700">
                {t("marketingNotifications")}
              </label>
              <p className="text-gray-500">{t("receiveMarketingUpdates")}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="newListings"
                type="checkbox"
                checked={settings.notifications.newListings}
                onChange={() => handleNotificationChange("newListings")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label
                htmlFor="newListings"
                className="font-medium text-gray-700"
              >
                {t("newListings")}
              </label>
              <p className="text-gray-500">
                {t("getNotifiedAboutNewListings")}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="priceDrops"
                type="checkbox"
                checked={settings.notifications.priceDrops}
                onChange={() => handleNotificationChange("priceDrops")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="priceDrops" className="font-medium text-gray-700">
                {t("priceDrops")}
              </label>
              <p className="text-gray-500">{t("getNotifiedAboutPriceDrops")}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="favorites"
                type="checkbox"
                checked={settings.notifications.favorites}
                onChange={() => handleNotificationChange("favorites")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className={`${isRTL ? "mr-3" : "ml-3"} text-sm`}>
              <label htmlFor="favorites" className="font-medium text-gray-700">
                {t("favorites")}
              </label>
              <p className="text-gray-500">
                {t("getNotifiedAboutChangesToFavorites")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferenceSettings;

import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/context/SettingsContext";
import PreferenceSettings from "@/components/settings/PreferenceSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import type {
  PreferenceSettings as PreferenceSettingsType,
  SecuritySettings as SecuritySettingsType,
} from "@/types/settings";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled,
}) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
);

interface SettingsState {
  notifications: {
    enabledTypes: string[];
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private";
    showOnlineStatus: boolean;
    showEmail: boolean;
    allowMessaging: boolean;
  };
}

function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const isRTL = i18n.language === "ar";

  const handlePreferenceUpdate = (preferences: PreferenceSettingsType) => {
    updateSettings({ preferences });
  };

  const handleSecurityUpdate = (security: SecuritySettingsType) => {
    updateSettings({ security });
  };

  const handleNotificationToggle = (type: string, checked: boolean) => {
    const updatedTypes = new Set(settings.notifications.enabledTypes);
    if (checked) {
      updatedTypes.add(type);
    } else {
      updatedTypes.delete(type);
    }
    updateSettings({
      notifications: {
        ...settings.notifications,
        enabledTypes: Array.from(updatedTypes),
      },
    });
  };

  const handlePrivacyUpdate = (updates: Partial<SettingsState["privacy"]>) => {
    updateSettings({ privacy: { ...settings.privacy, ...updates } });
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
          <p className="mt-2 text-gray-600">
            {t("settings.settingsDescription")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.preferences")}
            </h2>
            <PreferenceSettings
              settings={settings.preferences}
              onUpdate={handlePreferenceUpdate}
              isRTL={isRTL}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.language")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("settings.selectLanguage")}</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.notifications")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("settings.messageNotifications")}</span>
                <Toggle
                  checked={settings.notifications.enabledTypes.includes(
                    "message",
                  )}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("message", checked)
                  }
                  label={t("settings.messageNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.listingNotifications")}</span>
                <Toggle
                  checked={settings.notifications.enabledTypes.includes(
                    "listing",
                  )}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("listing", checked)
                  }
                  label={t("settings.listingNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.systemNotifications")}</span>
                <Toggle
                  checked={settings.notifications.enabledTypes.includes(
                    "system",
                  )}
                  onChange={(checked: boolean) =>
                    handleNotificationToggle("system", checked)
                  }
                  label={t("settings.systemNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.emailNotifications")}</span>
                <Toggle
                  checked={settings.notifications.emailNotifications}
                  onChange={(checked: boolean) =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        emailNotifications: checked,
                      },
                    })
                  }
                  label={t("settings.emailNotifications")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.pushNotifications")}</span>
                <Toggle
                  checked={settings.notifications.pushNotifications}
                  onChange={(checked: boolean) =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        pushNotifications: checked,
                      },
                    })
                  }
                  label={t("settings.pushNotifications")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.security")}
            </h2>
            <SecuritySettings
              settings={settings.security}
              onUpdate={handleSecurityUpdate}
              isRTL={isRTL}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.privacy")}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("settings.profileVisibility")}</span>
                <select
                  value={settings.privacy.profileVisibility}
                  onChange={(e) =>
                    handlePrivacyUpdate({
                      profileVisibility: e.target.value as "public" | "private",
                    })
                  }
                  className="form-select"
                >
                  <option value="public">{t("settings.public")}</option>
                  <option value="private">{t("settings.private")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.showOnlineStatus")}</span>
                <Toggle
                  checked={settings.privacy.showOnlineStatus}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showOnlineStatus: checked })
                  }
                  label={t("settings.showOnlineStatus")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.showEmail")}</span>
                <Toggle
                  checked={settings.privacy.showEmail}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ showEmail: checked })
                  }
                  label={t("settings.showEmail")}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>{t("settings.allowMessaging")}</span>
                <Toggle
                  checked={settings.privacy.allowMessaging}
                  onChange={(checked: boolean) =>
                    handlePrivacyUpdate({ allowMessaging: checked })
                  }
                  label={t("settings.allowMessaging")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              {t("settings.delete_account")}
            </h2>
            {/* <DeleteAccount /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

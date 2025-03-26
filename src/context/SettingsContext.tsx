import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import type { Settings } from "@/types";
import { SettingsAPI } from "@/api/settings.api";
import { ThemeType, LanguageCode } from "@/types";

const defaultSettings: Settings = {
  theme: ThemeType.SYSTEM,
  language: LanguageCode.EN,
  notifications: {
    email: true,
    push: true,
    messages: true,
    marketing: false,
    newListings: true,
    priceDrops: true,
    favorites: true,
  },
  emailNotifications: true,
  pushNotifications: true,
  timezone: "UTC",
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h" as const,
  security: {
    twoFactorEnabled: false,
    twoFactorMethod: "email",
    loginNotifications: false,
    autoLogoutTime: 24,
    loginActivity: [],
    connectedAccounts: [],
    allowedDevices: [],
  },
  privacy: {
    blockedUsers: [],
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessaging: true,
    blockList: [],
  },
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      const response = await SettingsAPI.updateSettings(updates);
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }, []);

  const resetSettings = useCallback(async () => {
    try {
      const response = await SettingsAPI.resetSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

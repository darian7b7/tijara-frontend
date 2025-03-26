import type { ThemeMode } from "./common";
import type { NotificationType } from "./notifications";

export enum ThemeType {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export enum LanguageCode {
  EN = "en",
  ES = "es",
  FR = "fr",
  DE = "de",
  AR = "ar",
}

export interface Theme {
  mode: ThemeMode;
  primary: string;
  secondary: string;
}

export interface NotificationPreferences {
  enabledTypes: NotificationType[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  messages: boolean;
  marketing: boolean;
  newListings: boolean;
  priceDrops: boolean;
  favorites: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: "email" | "authenticator";
  loginNotifications: boolean;
  autoLogoutTime: number;
  loginActivity: Array<{
    date: string;
    device: string;
    location: string;
  }>;
  connectedAccounts: string[];
  allowedDevices: string[];
}

export interface PrivacySettings {
  blockedUsers: string[];
  showOnlineStatus: boolean;
  profileVisibility: "public" | "private" | "friends";
  showEmail: boolean;
  showPhone: boolean;
  allowMessaging: boolean;
  allowMessagesFrom: "everyone" | "friends" | "none";
  blockList: string[];
}

export interface PreferenceSettings {
  language: LanguageCode;
  theme: ThemeType;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface Settings {
  theme: ThemeType;
  language: LanguageCode;
  notifications: NotificationPreferences;
  emailNotifications: boolean;
  pushNotifications: boolean;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  security: SecuritySettings;
  privacy: PrivacySettings;
  preferences: PreferenceSettings;
}

export interface LoginActivity {
  device?: string;
  location?: string;
  time?: string;
  ip?: string;
}

export type TwoFactorMethod = "email" | "sms" | "authenticator";

export interface NotificationEmailSettings {
  enabled: boolean;
  types: NotificationType[];
  frequency: "daily" | "weekly" | "never";
}

export interface NotificationPushSettings {
  enabled: boolean;
  types: NotificationType[];
}

export type NotificationType =
  | "message"
  | "listing"
  | "system"
  | "email"
  | "push";

export interface NotificationSettings {
  enabledTypes: NotificationType[];
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Privacy Settings
export interface PrivacySettings {
  profileVisibility: "public" | "private";
  showOnlineStatus: boolean;
  showEmail: boolean;
  allowMessaging: boolean;
}

// Security Settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
}

// Preference Settings
export interface PreferenceSettings {
  language: string;
  theme: "light" | "dark" | "system";
  timezone: string;
  currency: string;
}

// Combined Settings Type
export interface Settings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  preferences: PreferenceSettings;
}

export interface LocationSettings {
  defaultLocation?: {
    city: string;
    state?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  searchRadius: number;
  useCurrentLocation: boolean;
}

export interface UserSettings {
  privacy: {
    profileVisibility: "public" | "private";
    showOnlineStatus: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessaging: boolean;
    blockedUsers: string[];
  };
  notifications: {
    enabledTypes: NotificationType[];
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  theme: ThemeType;
  language: LanguageCode;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}

export interface AppSettings {
  security: SecuritySettings;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  preferences: PreferenceSettings;
}

export type { APIResponse } from "./api";

export interface SettingsUpdateInput {
  notifications?: Partial<NotificationPreferences>;
  privacy?: Partial<PrivacySettings>;
}

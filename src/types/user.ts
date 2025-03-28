interface Listing {
  id: string;
  title: string;
  // Add other essential listing properties
}

export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
  listings?: string[];
  followers?: string[];
  following?: string[];
  preferences: UserPreferences;
}

export interface UserSettings {
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: string;
  theme: "light" | "dark";
  notifications: {
    enabledTypes: string[];
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  emailPreferences: {
    newMessages: boolean;
    listingUpdates: boolean;
    promotions: boolean;
  };
  autoLocalization: boolean;
  country?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  bio?: string;
  profilePicture?: File;
  currentPassword?: string;
  newPassword?: string;
}

export interface APIError {
  success: false;
  error: string;
  status: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  status: number;
}

export type UserAPIResponse = APIResponse<User>;
export type UserProfileResponse = APIResponse<UserProfile>;
export type UserUpdateResponse = APIResponse<User>;
export type UserListingsResponse = APIResponse<PaginatedData<Listing>>;

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 📁 /types/index.ts

// 🌟 Base Types - Explicit Exports
export type {
  APIResponse,
  ErrorResponse,
  ValidationError,
  PaginatedData,
} from "./api";

export type {
  ComponentData,
  SelectOption,
  ListingStatus,
  ThemeMode,
} from "./common";

// 🌟 Authentication & User Types
export type {
  AuthResponse,
  AuthError,
  AuthTokens,
  LoginRequest,
  SignupRequest,
  TokenPayload,
  AuthState,
  AuthContextType,
  UserActivity,
} from "./auth";

export type {
  User,
  UserProfile,
  UserAPIResponse,
  UserProfileResponse,
  UserUpdateResponse,
  UserListingsResponse,
} from "./user";

// 🌟 Core Feature Types - Explicit Exports
export type {
  Listing,
  ListingCreateInput,
  ListingUpdateInput,
  ListingResponse,
  ListingsResponse,
  PriceRange,
  FilterParams,
  Category,
  FilterResponse,
  ListingParams,
  Favorite,
  ListingFilters,
} from "@/components/listings/types/listings.ts";

// Export ListingCategory enum
export { ListingCategory } from "@/components/listings/types/listings.ts";

export type {
  Message,
  Conversation,
  MessageInput,
  MessageEvent,
  ErrorEvent,
  MessageResponse,
  MessagesResponse,
  ConversationResponse,
  ConversationsResponse,
  MessageItemProps,
  MessageListProps,
  ConversationItemProps,
  ConversationListProps,
  MessageInputProps,
  MessageComposerProps,
  MessagesContainerProps,
  SocketMessage,
  ConversationCreateInput,
} from "./messaging";

// 🌟 Notifications - Primary Source
export * from "./notifications";

// 🌟 Reports and Search
export type {
  Report,
  ReportType,
  ReportStatus,
  ReportReason,
  ReportCreateInput,
  ReportUpdateInput,
  ReportResponse,
  ReportsResponse,
} from "./reports";

export type {
  SearchQuery,
  SearchResult,
  SearchResponse,
  SearchSuggestionsProps,
  AdvancedSearchModalProps,
} from "./search";

// 🌟 Settings Types
export { ThemeType, LanguageCode } from "./settings";

export type {
  Settings,
  Theme as SettingsTheme,
  NotificationPreferences,
  SecuritySettings,
  PrivacySettings,
  PreferenceSettings,
  LoginActivity,
  TwoFactorMethod,
  NotificationEmailSettings,
  NotificationPushSettings,
  NotificationSettings,
  LocationSettings,
  UserSettings,
  AppSettings,
} from "./settings";

// 🌟 UI Types
export type {
  BaseProps,
  ButtonProps,
  FormFieldProps,
  ListingComponentProps,
  CategorySelectorProps,
  SearchBarProps,
  NavLinkProps,
  ModalProps,
  ProfileCardProps,
  LoadingSpinnerProps,
  UIComponents,
  Theme as UITheme,
  ToastPosition,
  UIPreferences,
  UIState,
  UIContextType,
  CategoryToggleProps,
  ErrorInfo,
} from "./ui";

// 🌟 Socket Types
export * from "./socket";

// 🌟 Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

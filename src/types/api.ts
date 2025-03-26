// API Response Types
export interface APIResponse<T> {
  success: boolean;
  error: string | null;
  data: T;
  status?: number;
}

export interface APIListResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  error?: string;
  status?: number;
}

export interface APIError {
  success: false;
  error: string;
  data: null;
  status?: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  data: null;
}

// Listing Types
export enum ListingCategory {
  VEHICLES = "vehicles",
  REAL_ESTATE = "real-estate",
}

export interface PriceRange {
  min: number;
  max: number;
}

// Filter Types
export interface FilterParams {
  search?: string;
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError extends Error {
  status?: number;
  response?: {
    data?: ErrorResponse;
    status: number;
  };
}

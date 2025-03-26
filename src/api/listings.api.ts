import { apiClient } from "@/api/apiClient";
import type { 
  ListingWithRelations,
  APIResponse,
  PaginatedData,
  PaginatedResponse,
  ListingFilters,
  ListingUpdateInput,
  FormState,
  Listing,
  ListingCategory,
  ListingParams
} from "@/types/shared";

// Define missing types
interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  condition?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ListingUpdateInput {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  condition?: string;
  images?: (File | string)[];
  attributes?: any[];
  features?: any[];
}

interface FormState {
  title: string;
  description: string;
  price: string | number;
  category: string;
  location: string;
  condition?: string;
  images: (File | string)[];
  attributes?: any[];
  features?: any[];
}

type Listing = ListingWithRelations;

export const listingsAPI = {
  // Get all listings with optional parameters
  getAll: async (params?: ListingParams): Promise<APIResponse<PaginatedData<Listing>>> => {
    try {
      const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>('/listings', { 
        params 
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          hasMore: false
        },
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  search: async (
    query: string,
    filters?: Partial<ListingFilters>
  ): Promise<APIResponse<PaginatedData<Listing>>> => {
    try {
      const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>('/listings/search', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          hasMore: false
        },
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  getListingsByCategory: async (
    category: string,
    filters?: Omit<ListingFilters, 'category'>
  ): Promise<APIResponse<PaginatedData<Listing>>> => {
    try {
      const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>(
        `/listings/category/${category}`,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          hasMore: false
        },
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  createListing: async (data: FormState): Promise<APIResponse<ListingWithRelations>> => {
    try {
      const formData = new FormData();
      
      // Handle basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      // Handle images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            formData.append('imageUrls[]', image);
          }
        });
      }

      const response = await apiClient.post<APIResponse<ListingWithRelations>>('/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to create listing'
      };
    }
  },

  updateListing: async (id: string, data: ListingUpdateInput): Promise<APIResponse<Listing>> => {
    try {
      const formData = new FormData();
      
      // Append basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'images' && value !== undefined) {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });

      // Handle images
      if (data.images?.length) {
        data.images.forEach((image: File | string) => {
          if (image instanceof File) {
            formData.append(`images`, image);
          } else if (typeof image === 'string') {
            formData.append('imageUrls[]', image);
          }
        });
      }

      const response = await apiClient.put<APIResponse<Listing>>(`/listings/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to update listing'
      };
    }
  },

  deleteListing: async (id: string): Promise<APIResponse<void>> => {
    try {
      const response = await apiClient.delete<APIResponse<void>>(`/listings/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to delete listing'
      };
    }
  },

  getListing: async (id: string): Promise<APIResponse<Listing>> => {
    try {
      const response = await apiClient.get<APIResponse<Listing>>(`/listings/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch listing'
      };
    }
  },
  
  getSavedListings: async (): Promise<APIResponse<PaginatedData<Listing>>> => {
    try {
      const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>('/listings/saved');
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to fetch saved listings'
      };
    }
  },
  
  toggleSave: async (id: string): Promise<APIResponse<Listing>> => {
    try {
      const response = await apiClient.post<APIResponse<Listing>>(`/listings/${id}/save`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        status: 500,
        error: error instanceof Error ? error.message : 'Failed to toggle save status'
      };
    }
  }
}; 
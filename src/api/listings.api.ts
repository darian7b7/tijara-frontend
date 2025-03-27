import apiClient from "@/api/apiClient";
import type { 
  APIResponse,
  PaginatedData,
  ListingFilters,
  ListingUpdateInput,
  Listing,
  ListingParams
} from "@/types";

export const listingsAPI = {
  async getAll(params?: ListingParams): Promise<PaginatedData<Listing>> {
    const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>("/listings", { params });
    return response.data.data;
  },

  async getUserListings(userId: string): Promise<PaginatedData<Listing>> {
    const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>(`/listings/user/${userId}`);
    return response.data.data;
  },

  async search(query: string, filters?: Partial<ListingFilters>): Promise<PaginatedData<Listing>> {
    const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>("/listings/search", {
      params: { query, ...filters },
    });
    return response.data.data;
  },

  async getListingsByCategory(category: string, filters?: Omit<ListingFilters, "category">): Promise<PaginatedData<Listing>> {
    const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>(`/listings/category/${category}`, {
      params: filters,
    });
    return response.data.data;
  },

  async getListingsByIds(ids: string[]): Promise<Listing[]> {
    const response = await apiClient.post<APIResponse<Listing[]>>("/listings/byIds", { ids });
    return response.data.data;
  },

  async createListing(data: FormData): Promise<Listing> {
    const response = await apiClient.post<APIResponse<Listing>>("/listings", data);
    return response.data.data;
  },

  async updateListing(id: string, data: ListingUpdateInput): Promise<Listing> {
    const response = await apiClient.put<APIResponse<Listing>>(`/listings/${id}`, data);
    return response.data.data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete<APIResponse<void>>(`/listings/${id}`);
  },

  async getListing(id: string): Promise<Listing> {
    const response = await apiClient.get<APIResponse<Listing>>(`/listings/${id}`);
    return response.data.data;
  },

  async saveListing(id: string): Promise<void> {
    await apiClient.post<APIResponse<void>>(`/listings/${id}/save`);
  },

  async unsaveListing(id: string): Promise<void> {
    await apiClient.delete<APIResponse<void>>(`/listings/${id}/save`);
  },

  async getSavedListings(): Promise<PaginatedData<Listing>> {
    const response = await apiClient.get<APIResponse<PaginatedData<Listing>>>("/listings/saved");
    return response.data.data;
  },

  async toggleSave(id: string): Promise<void> {
    await apiClient.post<APIResponse<void>>(`/listings/${id}/toggle-save`);
  },
};
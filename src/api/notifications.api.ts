import apiClient from "./apiClient";
import type {
  APIResponse,
  Notification,
  NotificationCreateInput,
  NotificationUpdateInput,
  PaginatedData,
} from "@/types";

const BASE_URL = "/notifications";

function handleApiError(error: any, defaultMessage: string): APIResponse<any> {
  return {
    success: false,
    error: error.response?.data?.error || defaultMessage,
    data: null,
    status: error.response?.status || 500,
  };
}

export const NotificationsAPI = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: Notification["type"];
  }): Promise<APIResponse<PaginatedData<Notification>>> {
    try {
      const response = await apiClient.get<
        APIResponse<PaginatedData<Notification>>
      >(BASE_URL, {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          type: params?.type,
        },
      });

      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to fetch notifications");
    }
  },

  async getNotification(id: string): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.get<APIResponse<Notification>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to fetch notification");
    }
  },

  async createNotification(
    input: NotificationCreateInput,
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.post<APIResponse<Notification>>(
        BASE_URL,
        input,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to create notification");
    }
  },

  async updateNotification(
    id: string,
    input: NotificationUpdateInput,
  ): Promise<APIResponse<Notification>> {
    try {
      const response = await apiClient.patch<APIResponse<Notification>>(
        `${BASE_URL}/${id}`,
        input,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to update notification");
    }
  },

  async markAsRead(id: string): Promise<APIResponse<Notification>> {
    return this.updateNotification(id, { read: true });
  },

  async markAllAsRead(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.post<APIResponse<void>>(
        `${BASE_URL}/mark-all-read`,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to mark all notifications as read");
    }
  },

  async deleteNotification(id: string): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(
        `${BASE_URL}/${id}`,
      );
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to delete notification");
    }
  },

  async clearAll(): Promise<APIResponse<void>> {
    try {
      const response = await apiClient.delete<APIResponse<void>>(BASE_URL);
      return response.data;
    } catch (error: any) {
      return handleApiError(error, "Failed to clear all notifications");
    }
  },
};

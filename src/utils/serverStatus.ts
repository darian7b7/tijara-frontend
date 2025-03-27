import { API_BASE_URL } from "@/config";

class ServerStatusManager {
  private static instance: ServerStatusManager;
  private isServerOnline: boolean = true;
  private checkInProgress: boolean = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  private constructor() {}

  static getInstance(): ServerStatusManager {
    if (!ServerStatusManager.instance) {
      ServerStatusManager.instance = new ServerStatusManager();
    }
    return ServerStatusManager.instance;
  }

  async checkServerStatus(): Promise<boolean> {
    if (this.checkInProgress) return this.isServerOnline;

    this.checkInProgress = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5001);

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const newStatus = response.ok;
      if (newStatus !== this.isServerOnline) {
        this.isServerOnline = newStatus;
        this.notifyListeners();
      }
      return this.isServerOnline;
    } catch (error) {
      if (this.isServerOnline) {
        this.isServerOnline = false;
        this.notifyListeners();
      }
      return false;
    } finally {
      this.checkInProgress = false;
    }
  }

  subscribe(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.isServerOnline));
  }

  getStatus(): boolean {
    return this.isServerOnline;
  }
}

export const serverStatus = ServerStatusManager.getInstance();

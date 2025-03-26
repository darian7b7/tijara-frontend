import { useContext } from "react";
import type { NotificationsContextType } from "@/context/NotificationsContext";
import { NotificationsContext } from "@/context/NotificationsContext";

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
};

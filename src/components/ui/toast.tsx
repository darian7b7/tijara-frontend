import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastOptions) => {
  switch (variant) {
    case "destructive":
      sonnerToast.error(description, { duration });
      break;
    case "success":
      sonnerToast.success(description, { duration });
      break;
    default:
      sonnerToast.message(title || "", {
        description,
        duration,
      });
  }
};

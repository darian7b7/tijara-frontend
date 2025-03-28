interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const toast = (props: ToastProps) => {
    // For now, just log to console. You can implement a proper toast system later
    console.log(
      `Toast: ${props.title} - ${props.description} (${props.variant})`,
    );
  };

  return { toast };
}

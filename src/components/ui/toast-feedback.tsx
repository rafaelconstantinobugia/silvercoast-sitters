import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ToastProps {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showToast = ({ title, description, type = 'info', action }: ToastProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };
  
  const Icon = icons[type];
  
  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  toast(
    <div className="flex items-start gap-3">
      <Icon className={`w-5 h-5 mt-0.5 ${colors[type]}`} />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground mt-1">{description}</div>
        )}
        {action && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

// Convenience methods
export const showSuccessToast = (title: string, description?: string) => 
  showToast({ title, description, type: 'success' });

export const showErrorToast = (title: string, description?: string) => 
  showToast({ title, description, type: 'error' });

export const showWarningToast = (title: string, description?: string) => 
  showToast({ title, description, type: 'warning' });

export const showInfoToast = (title: string, description?: string) => 
  showToast({ title, description, type: 'info' });
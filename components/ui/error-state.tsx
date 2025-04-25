import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  description?: string;
  error?: Error | string;
  showError?: boolean;
  actionLabel?: string;
  actionType?: 'retry' | 'back' | 'home' | 'custom';
  onAction?: () => void;
  className?: string;
  fullPage?: boolean;
}

/**
 * ErrorState component for consistent error states across the Avolve platform
 *
 * @param title - Main error title
 * @param description - Optional description text
 * @param error - Optional error object or message
 * @param showError - Whether to show the technical error details
 * @param actionLabel - Optional action button label
 * @param actionType - Predefined action type
 * @param onAction - Action handler for the button
 * @param className - Additional classes to apply
 * @param fullPage - Whether to display as a full page error
 */
export function ErrorState({
  title,
  description,
  error,
  showError = false,
  actionLabel = 'Try Again',
  actionType = 'retry',
  onAction,
  className,
  fullPage = false,
}: ErrorStateProps) {
  // Format error message
  const errorMessage = error instanceof Error ? error.message : error;

  // Action icon selection
  const ActionIcon = () => {
    switch (actionType) {
      case 'back':
        return <ArrowLeft className="mr-2 h-4 w-4" />;
      case 'home':
        return <Home className="mr-2 h-4 w-4" />;
      case 'retry':
      default:
        return <RefreshCw className="mr-2 h-4 w-4" />;
    }
  };

  // Default actions based on type
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      switch (actionType) {
        case 'back':
          window.history.back();
          break;
        case 'home':
          window.location.href = '/';
          break;
        case 'retry':
          window.location.reload();
          break;
      }
    }
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-background z-50 p-4'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>

      {description && (
        <p className="text-muted-foreground text-center max-w-md mb-4">{description}</p>
      )}

      {showError && errorMessage && (
        <div className="bg-muted p-3 rounded-md text-sm font-mono text-muted-foreground mb-6 max-w-md overflow-auto">
          {errorMessage}
        </div>
      )}

      <Button onClick={handleAction} variant="default" className="mt-2">
        <ActionIcon />
        {actionLabel}
      </Button>
    </div>
  );
}

export default ErrorState;

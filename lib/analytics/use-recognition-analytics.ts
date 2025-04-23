import { useAnalytics } from './analytics-provider';

/**
 * Custom hook to track recognition analytics events
 */
export function useRecognitionAnalytics() {
  const { trackEvent } = useAnalytics();

  /**
   * Track when a recognition is sent
   */
  const trackRecognitionSent = (senderId: string, recipientId: string, message: string) => {
    trackEvent('recognition_sent', {
      sender_id: senderId,
      recipient_id: recipientId,
      message_length: message.length,
      has_message: !!message.trim(),
    });
  };

  /**
   * Track when a recognition is received
   */
  const trackRecognitionReceived = (recipientId: string, senderId: string) => {
    trackEvent('recognition_received', {
      recipient_id: recipientId,
      sender_id: senderId,
    });
  };

  return {
    trackRecognitionSent,
    trackRecognitionReceived,
  };
}

export type ActivityType = 'page_view' | 'button_click' | 'form_submit' | 'feature_usage' | 'enter_invite_code' | 'select_journey' | 'accept_prime_law';

export interface ActivityLogData {
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

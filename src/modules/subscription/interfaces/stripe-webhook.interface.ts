export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      metadata?: {
        userId?: string;
      };
      [key: string]: unknown;
    };
  };
}

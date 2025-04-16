// TokenRepository Types
// Centralizes types used by the TokenRepository and related hooks/services

export type TokenResult<T> = {
  data: T | null;
  error: TokenError | null;
};

export class TokenError extends Error {
  public details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'TokenError';
    this.details = details;
  }
}

export type TokenTransferResult = {
  success: boolean;
  message: string;
  transaction_id?: string;
};

// Add other TokenRepository-specific types as needed

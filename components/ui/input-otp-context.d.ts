// TypeScript type for OTPInputContext fallback
export interface OTPInputSlot {
  char: string | null;
  hasFakeCaret: boolean;
  isActive: boolean;
}

export interface OTPInputContextType {
  slots: OTPInputSlot[];
  // Add other properties if needed
}

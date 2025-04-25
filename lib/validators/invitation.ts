import { z } from 'zod';

// Schema for validating invitation codes
export const invitationCodeSchema = z.object({
  code: z.string().min(8).max(30),
});

export type InvitationCodeRequest = z.infer<typeof invitationCodeSchema>;

// Schema for creating a new invitation
export const createInvitationSchema = z.object({
  email: z.string().email().optional(),
  expires_in_days: z.number().int().min(1).max(30).default(14),
});

export type CreateInvitationRequest = z.infer<typeof createInvitationSchema>;

// Schema for accepting an invitation
export const acceptInvitationSchema = z.object({
  code: z.string().min(8).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  display_name: z.string().min(2).max(50),
});

export type AcceptInvitationRequest = z.infer<typeof acceptInvitationSchema>;

// Schema for vouching for a user
export const vouchUserSchema = z.object({
  user_id: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export type VouchUserRequest = z.infer<typeof vouchUserSchema>;

import { z } from 'zod';
import { formatValidationErrors } from './error-handling';

/**
 * Common validation schemas for reuse across forms
 */
export const validationSchemas = {
  // User information
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio must be less than 160 characters').optional(),
  
  // Content
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  
  // Other
  url: z.string().url('Please enter a valid URL'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date'),
  invitationCode: z.string().min(6, 'Invitation code must be at least 6 characters'),
};

/**
 * Type for validation result
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

/**
 * Validate form data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateForm<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return {
      success: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = formatValidationErrors(error.format());
      return {
        success: false,
        errors,
      };
    }
    
    return {
      success: false,
      errors: {
        _form: 'An unexpected error occurred during validation',
      },
    };
  }
}

/**
 * Create a form schema with common fields
 * @param fields - Additional fields to include in the schema
 * @returns Zod schema
 */
export function createUserFormSchema(fields: Record<string, z.ZodType<any>> = {}) {
  return z.object({
    email: validationSchemas.email,
    name: validationSchemas.name,
    ...fields,
  });
}

/**
 * Create a profile form schema
 * @returns Zod schema for profile form
 */
export function createProfileFormSchema() {
  return z.object({
    name: validationSchemas.name,
    username: validationSchemas.username,
    bio: validationSchemas.bio.optional(),
    website: validationSchemas.url.optional().or(z.literal('')),
  });
}

/**
 * Create a sign-up form schema
 * @returns Zod schema for sign-up form
 */
export function createSignUpFormSchema() {
  return z.object({
    email: validationSchemas.email,
    password: validationSchemas.password,
    name: validationSchemas.name,
    invitationCode: validationSchemas.invitationCode,
  });
}

/**
 * Create a sign-in form schema
 * @returns Zod schema for sign-in form
 */
export function createSignInFormSchema() {
  return z.object({
    email: validationSchemas.email,
    password: z.string().min(1, 'Password is required'),
  });
}

/**
 * Create a post form schema
 * @returns Zod schema for post form
 */
export function createPostFormSchema() {
  return z.object({
    title: validationSchemas.title,
    content: validationSchemas.content,
  });
}

/**
 * Create a comment form schema
 * @returns Zod schema for comment form
 */
export function createCommentFormSchema() {
  return z.object({
    content: validationSchemas.comment,
    postId: z.string().uuid('Invalid post ID'),
  });
}

/**
 * Create an invitation code form schema
 * @returns Zod schema for invitation code form
 */
export function createInvitationCodeFormSchema() {
  return z.object({
    maxUses: z.number().int().min(1, 'Maximum uses must be at least 1'),
    expiresAt: validationSchemas.date.optional(),
    note: z.string().max(200, 'Note must be less than 200 characters').optional(),
  });
}

/**
 * Create a feature flag form schema
 * @returns Zod schema for feature flag form
 */
export function createFeatureFlagFormSchema() {
  return z.object({
    featureKey: z.string().min(3, 'Feature key must be at least 3 characters'),
    enabled: z.boolean(),
    description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  });
}

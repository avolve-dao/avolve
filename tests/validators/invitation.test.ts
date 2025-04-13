import { 
  invitationCodeSchema, 
  createInvitationSchema, 
  acceptInvitationSchema, 
  vouchUserSchema 
} from '@/lib/validators/invitation'
import { describe, it, expect } from 'vitest'

describe('Invitation Validators', () => {
  describe('invitationCodeSchema', () => {
    it('should validate a valid invitation code', () => {
      const validData = { code: 'INV-ABCD-1234' }
      const result = invitationCodeSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject an empty invitation code', () => {
      const invalidData = { code: '' }
      const result = invitationCodeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject a code that is too short', () => {
      const invalidData = { code: 'ABC' }
      const result = invitationCodeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing code property', () => {
      const invalidData = {}
      const result = invitationCodeSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createInvitationSchema', () => {
    it('should validate valid invitation creation data', () => {
      const validData = {
        email: 'test@example.com',
        expires_in_days: 14
      }
      const result = createInvitationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept data without optional fields', () => {
      const validData = {
        email: 'test@example.com'
      }
      const result = createInvitationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email'
      }
      const result = createInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative expiration days', () => {
      const invalidData = {
        email: 'test@example.com',
        expires_in_days: -1
      }
      const result = createInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('acceptInvitationSchema', () => {
    it('should validate valid accept invitation data', () => {
      const validData = {
        code: 'INV-ABCD-1234',
        email: 'test@example.com',
        password: 'password123',
        display_name: 'Test User'
      }
      const result = acceptInvitationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        code: 'INV-ABCD-1234'
      }
      const result = acceptInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('vouchUserSchema', () => {
    it('should validate valid vouch data', () => {
      const validData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        message: 'I know this person and can vouch for their character.'
      }
      const result = vouchUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const invalidData = {
        user_id: 'not-a-uuid',
        message: 'Valid reason'
      }
      const result = vouchUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty message', () => {
      const validData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000'
      }
      const result = vouchUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

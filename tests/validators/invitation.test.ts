import { 
  invitationCodeSchema, 
  createInvitationSchema, 
  acceptInvitationSchema, 
  vouchForUserSchema 
} from '@/lib/validators/invitation'

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
        invitationType: 'standard',
        expiresInDays: 14
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

    it('should reject invalid invitation type', () => {
      const invalidData = {
        email: 'test@example.com',
        invitationType: 'invalid-type'
      }
      const result = createInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative expiration days', () => {
      const invalidData = {
        email: 'test@example.com',
        expiresInDays: -1
      }
      const result = createInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('acceptInvitationSchema', () => {
    it('should validate valid accept invitation data', () => {
      const validData = {
        code: 'INV-ABCD-1234',
        agreeToTerms: true
      }
      const result = acceptInvitationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject when terms not agreed to', () => {
      const invalidData = {
        code: 'INV-ABCD-1234',
        agreeToTerms: false
      }
      const result = acceptInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        code: 'INV-ABCD-1234'
      }
      const result = acceptInvitationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('vouchForUserSchema', () => {
    it('should validate valid vouch data', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'I know this person and can vouch for their character.'
      }
      const result = vouchForUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid UUID', () => {
      const invalidData = {
        userId: 'not-a-uuid',
        reason: 'Valid reason'
      }
      const result = vouchForUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty reason', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        reason: ''
      }
      const result = vouchForUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject reason that is too short', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Short'
      }
      const result = vouchForUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

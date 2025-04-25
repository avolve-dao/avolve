import {
  validateEmail,
  validatePassword,
  formatTokenBalance,
  calculateProgressPercentage,
  isFeatureUnlockable,
  formatRelativeTime,
  sanitizeUserInput,
  generateShareableLink,
} from './utils';

describe('Shared Business Logic', () => {
  describe('Input Validation', () => {
    describe('validateEmail', () => {
      it('should validate correct email formats', () => {
        expect(validateEmail('user@example.com')).toBe(true);
        expect(validateEmail('user.name@example.co.uk')).toBe(true);
        expect(validateEmail('user+tag@example.com')).toBe(true);
      });

      it('should reject incorrect email formats', () => {
        expect(validateEmail('user@')).toBe(false);
        expect(validateEmail('user@example')).toBe(false);
        expect(validateEmail('user@.com')).toBe(false);
        expect(validateEmail('user@exam ple.com')).toBe(false);
      });
    });

    describe('validatePassword', () => {
      it('should validate strong passwords', () => {
        expect(validatePassword('StrongP@ss123')).toBe(true);
        expect(validatePassword('AnotherGood1!')).toBe(true);
      });

      it('should reject weak passwords', () => {
        expect(validatePassword('password')).toBe(false); // No uppercase, numbers or special chars
        expect(validatePassword('Password')).toBe(false); // No numbers or special chars
        expect(validatePassword('password123')).toBe(false); // No uppercase or special chars
        expect(validatePassword('Pass1!')).toBe(false); // Too short
      });
    });

    describe('sanitizeUserInput', () => {
      it('should sanitize HTML in user input', () => {
        expect(sanitizeUserInput('<script>alert("XSS")</script>Hello')).toBe('Hello');
        expect(sanitizeUserInput('<b>Bold text</b>')).toBe('Bold text');
      });

      it('should preserve allowed formatting', () => {
        expect(sanitizeUserInput('**Bold markdown**')).toBe('**Bold markdown**');
        expect(sanitizeUserInput('_Italic markdown_')).toBe('_Italic markdown_');
      });
    });
  });

  describe('Formatting and Display', () => {
    describe('formatTokenBalance', () => {
      it('should format token balances correctly', () => {
        expect(formatTokenBalance(1000)).toBe('1,000');
        expect(formatTokenBalance(1000.5)).toBe('1,000.5');
        expect(formatTokenBalance(0)).toBe('0');
      });

      it('should handle different locales if specified', () => {
        expect(formatTokenBalance(1000, 'de-DE')).toBe('1.000');
        expect(formatTokenBalance(1000.5, 'de-DE')).toBe('1.000,5');
      });
    });

    describe('formatRelativeTime', () => {
      it('should format recent times as relative', () => {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
        expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
        expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
      });

      it('should format older times with date format', () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // These tests are a bit tricky as the exact format depends on the locale
        // Just check that it's not in the relative format
        expect(formatRelativeTime(oneWeekAgo)).not.toContain('ago');
        expect(formatRelativeTime(oneMonthAgo)).not.toContain('ago');
      });
    });

    describe('generateShareableLink', () => {
      it('should generate valid shareable links', () => {
        expect(generateShareableLink('post', '123')).toBe('https://avolve.io/share/post/123');
        expect(generateShareableLink('profile', 'user123')).toBe(
          'https://avolve.io/share/profile/user123'
        );
      });

      it('should handle custom parameters', () => {
        expect(generateShareableLink('post', '123', { utm_source: 'twitter' })).toBe(
          'https://avolve.io/share/post/123?utm_source=twitter'
        );

        expect(
          generateShareableLink('profile', 'user123', {
            utm_source: 'email',
            utm_medium: 'referral',
          })
        ).toBe('https://avolve.io/share/profile/user123?utm_source=email&utm_medium=referral');
      });
    });
  });

  describe('Feature and Progress Logic', () => {
    describe('calculateProgressPercentage', () => {
      it('should calculate percentage correctly', () => {
        expect(calculateProgressPercentage(25, 100)).toBe(25);
        expect(calculateProgressPercentage(0, 100)).toBe(0);
        expect(calculateProgressPercentage(100, 100)).toBe(100);
      });

      it('should handle edge cases', () => {
        expect(calculateProgressPercentage(150, 100)).toBe(100); // Cap at 100%
        expect(calculateProgressPercentage(-10, 100)).toBe(0); // Minimum 0%
        expect(calculateProgressPercentage(50, 0)).toBe(0); // Avoid division by zero
      });
    });

    describe('isFeatureUnlockable', () => {
      it('should determine if a feature is unlockable based on tokens', () => {
        const userTokens = { community: 50, innovation: 20 };

        // Feature requires less tokens than user has
        expect(isFeatureUnlockable({ community: 30 }, userTokens)).toBe(true);

        // Feature requires more tokens than user has
        expect(isFeatureUnlockable({ community: 60 }, userTokens)).toBe(false);

        // Feature requires tokens of different types
        expect(isFeatureUnlockable({ community: 30, innovation: 10 }, userTokens)).toBe(true);
        expect(isFeatureUnlockable({ community: 30, innovation: 30 }, userTokens)).toBe(false);

        // Feature requires token type user doesn't have
        expect(isFeatureUnlockable({ leadership: 10 }, userTokens)).toBe(false);
      });

      it('should handle edge cases', () => {
        const userTokens = { community: 50 };

        // No requirements
        expect(isFeatureUnlockable({}, userTokens)).toBe(true);

        // Null or undefined inputs
        expect(isFeatureUnlockable(null, userTokens)).toBe(true);
        expect(isFeatureUnlockable(undefined, userTokens)).toBe(true);
        expect(isFeatureUnlockable({}, null)).toBe(false);
        expect(isFeatureUnlockable({}, undefined)).toBe(false);
      });
    });
  });
});

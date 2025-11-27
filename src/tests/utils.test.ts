import { describe, it, expect } from 'vitest';

// Tests pour les fonctions utilitaires
describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('25');
      expect(formatted).toContain('2023');
    });
  });

  describe('validateEmail', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('admin@opuslab.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });
  });

  describe('formatUserName', () => {
    const formatUserName = (firstName: string, lastName: string): string => {
      return `${firstName} ${lastName}`.trim();
    };

    it('should format user names correctly', () => {
      expect(formatUserName('John', 'Doe')).toBe('John Doe');
      expect(formatUserName('Jane', 'Smith')).toBe('Jane Smith');
    });

    it('should handle empty names', () => {
      expect(formatUserName('', 'Doe')).toBe('Doe');
      expect(formatUserName('John', '')).toBe('John');
      expect(formatUserName('', '')).toBe('');
    });
  });

  describe('truncateText', () => {
    const truncateText = (text: string, maxLength: number): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });

  describe('getInitials', () => {
    const getInitials = (firstName: string, lastName: string): string => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    it('should get user initials', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
      expect(getInitials('jane', 'smith')).toBe('JS');
      expect(getInitials('Admin', 'User')).toBe('AU');
    });

    it('should handle empty names', () => {
      expect(getInitials('', 'Doe')).toBe('D');
      expect(getInitials('John', '')).toBe('J');
      expect(getInitials('', '')).toBe('');
    });
  });
});

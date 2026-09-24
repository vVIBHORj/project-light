import {
  phoneSchema,
  emailSchema,
  otpSchema,
  createAccountSchema,
  loginSchema,
  recoverySchema,
} from '../schemas';
import { mockAuthRepo } from '../../../data/mocks';

describe('Auth Schemas & Repository Tests (Blueprint Section 17)', () => {
  describe('Zod Validation Schemas', () => {
    it('validates a correct Indian phone number', () => {
      expect(phoneSchema.safeParse('+91 98765 43210').success).toBe(true);
      expect(phoneSchema.safeParse('9876543210').success).toBe(true);
      expect(phoneSchema.safeParse('12345').success).toBe(false);
    });

    it('validates a valid email address and rejects malformed formats', () => {
      expect(emailSchema.safeParse('priya.sharma@example.com').success).toBe(true);
      expect(emailSchema.safeParse('not-an-email').success).toBe(false);
    });

    it('validates full create account input with mandatory 18+ terms consent', () => {
      const validPhoneSignup = {
        method: 'phone' as const,
        identifier: '+919876543210',
        termsAccepted: true as const,
        marketingConsent: false,
        referralCode: 'WELCOME2026',
      };
      expect(createAccountSchema.safeParse(validPhoneSignup).success).toBe(true);

      const missingConsent = {
        method: 'phone' as const,
        identifier: '+919876543210',
        termsAccepted: false,
      };
      const result = createAccountSchema.safeParse(missingConsent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Terms and Privacy');
      }
    });

    it('validates 6-digit numeric OTP', () => {
      expect(otpSchema.safeParse('123456').success).toBe(true);
      expect(otpSchema.safeParse('12345').success).toBe(false);
      expect(otpSchema.safeParse('1234567').success).toBe(false);
      expect(otpSchema.safeParse('12345a').success).toBe(false);
    });

    it('validates login identifier', () => {
      expect(loginSchema.safeParse({ identifier: '+919876543210' }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: 'user@domain.com' }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: '' }).success).toBe(false);
    });

    it('validates account recovery identifier', () => {
      expect(recoverySchema.safeParse({ identifier: 'user@example.com' }).success).toBe(true);
      expect(recoverySchema.safeParse({ identifier: '' }).success).toBe(false);
    });
  });

  describe('Mock Auth Repository Workflows', () => {
    it('fetches bootstrap config successfully', async () => {
      const config = await mockAuthRepo.getBootstrapConfig();
      expect(config).toBeDefined();
      expect(config.minSupportedVersion).toBe('1.0.0');
      expect(config.maintenance).toBe(false);
      expect(config.forceUpdate).toBe(false);
    });

    it('handles signUp and returns auth challenge', async () => {
      const challenge = await mockAuthRepo.signUp('+919876543210', 'phone');
      expect(challenge.challengeId).toBeDefined();
      expect(challenge.method).toBe('phone');
      expect(challenge.attemptsLeft).toBe(5);
      expect(challenge.expiresAt).toBeGreaterThan(Date.now());
    });

    it('verifies valid OTP (123456) and returns authenticated user session', async () => {
      const challenge = await mockAuthRepo.login('+919876543210');
      const response = await mockAuthRepo.verifyOtp(challenge.challengeId, '123456');
      expect(response.user).toBeDefined();
      expect(response.token).toBeDefined();
      expect(response.user.id).toBeDefined();
    });

    it('decrements attempts on wrong OTP and locks out after 5 failures', async () => {
      const challenge = await mockAuthRepo.signUp('+919876543211', 'phone');

      // 1st wrong attempt
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000111')).rejects.toThrow('Invalid verification code');

      // 4 more wrong attempts
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000112')).rejects.toThrow();
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000113')).rejects.toThrow();
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000114')).rejects.toThrow();

      // 5th wrong attempt triggers lockout
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000115')).rejects.toThrow('locked for 60 seconds');
    });

    it('handles expired OTP challenge (code 999999)', async () => {
      const challenge = await mockAuthRepo.login('+919876543210');
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '999999')).rejects.toThrow('expired');
    });

    it('handles suspicious risk detection code (000000)', async () => {
      const challenge = await mockAuthRepo.login('+919876543210');
      await expect(mockAuthRepo.verifyOtp(challenge.challengeId, '000000')).rejects.toThrow('SECURITY_CHALLENGE_REQUIRED');
    });

    it('provides privacy-preserving account recovery responses without leakage', async () => {
      const response = await mockAuthRepo.requestRecovery('some_user@example.com');
      expect(response.success).toBe(true);
      expect(response.message).toContain('If an account exists');
    });

    it('resolves security challenge for confirm_me and not_me', async () => {
      const confirmRes = await mockAuthRepo.resolveSecurityChallenge('chal-123', 'confirm_me');
      expect(confirmRes.success).toBe(true);
      expect(confirmRes.token).toBeDefined();

      const notMeRes = await mockAuthRepo.resolveSecurityChallenge('chal-123', 'not_me');
      expect(notMeRes.success).toBe(true);
      expect(notMeRes.token).toBeUndefined();
    });

    it('lists active sessions and allows single and bulk revocation (AUTH-08)', async () => {
      const initialSessions = await mockAuthRepo.getSessions();
      expect(initialSessions.length).toBeGreaterThanOrEqual(1);

      const current = initialSessions.find((s) => s.isCurrent);
      expect(current).toBeDefined();

      // Revoke all other sessions
      await mockAuthRepo.revokeAllOtherSessions();
      const updatedSessions = await mockAuthRepo.getSessions();
      expect(updatedSessions.length).toBe(1);
      expect(updatedSessions[0].isCurrent).toBe(true);
    });
  });
});

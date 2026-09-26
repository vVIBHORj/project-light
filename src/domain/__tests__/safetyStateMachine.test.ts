import { SafetyStateMachine } from '../safetyStateMachine';
import { INDIA_EMERGENCY_HELPLINES, GRIEVANCE_OFFICER } from '../safetyTypes';

describe('Phase 9: SafetyStateMachine Pure Domain Tests', () => {
  describe('SAFE-02 & SAFE-03: Case ID Generation & Phone Masking', () => {
    it('generates deterministic formatted case IDs with prefix and current year', () => {
      const caseId = SafetyStateMachine.generateCaseId();
      expect(caseId).toMatch(/^CASE-\d{4}-\d{4}$/);
    });

    it('masks phone numbers safely while preserving recognizable prefix and suffix', () => {
      const masked1 = SafetyStateMachine.maskPhoneNumber('+91 9876543210');
      expect(masked1).toContain('****');
      expect(masked1.endsWith('3210')).toBe(true);

      const masked2 = SafetyStateMachine.maskPhoneNumber('9876543210');
      expect(masked2).toContain('****');
      expect(masked2.endsWith('3210')).toBe(true);
    });
  });

  describe('SAFE-04: Mutual Visibility Rules for Block & Restrict', () => {
    const blockedPairs = new Set<string>();
    const restrictedPairs = new Set<string>();

    beforeEach(() => {
      blockedPairs.clear();
      restrictedPairs.clear();
    });

    it('allows normal interaction when neither user has blocked or restricted', () => {
      const res = SafetyStateMachine.evaluateVisibility(
        'user_1',
        'user_2',
        blockedPairs,
        restrictedPairs
      );

      expect(res.isVisible).toBe(true);
      expect(res.canMessage).toBe(true);
      expect(res.isBlocked).toBe(false);
      expect(res.isRestricted).toBe(false);
    });

    it('enforces two-way mutual invisibility when actor blocks target', () => {
      blockedPairs.add('user_1:user_2');

      // Actor perspective
      const actorView = SafetyStateMachine.evaluateVisibility(
        'user_1',
        'user_2',
        blockedPairs,
        restrictedPairs
      );
      expect(actorView.isVisible).toBe(false);
      expect(actorView.canMessage).toBe(false);
      expect(actorView.isBlocked).toBe(true);

      // Target perspective (mutual invisibility)
      const targetView = SafetyStateMachine.evaluateVisibility(
        'user_2',
        'user_1',
        blockedPairs,
        restrictedPairs
      );
      expect(targetView.isVisible).toBe(false);
      expect(targetView.canMessage).toBe(false);
      expect(targetView.isBlocked).toBe(true);
    });

    it('enforces quiet boundary when actor restricts target', () => {
      restrictedPairs.add('user_1:user_2');

      const actorView = SafetyStateMachine.evaluateVisibility(
        'user_1',
        'user_2',
        blockedPairs,
        restrictedPairs
      );
      expect(actorView.isVisible).toBe(true);
      expect(actorView.canMessage).toBe(false);
      expect(actorView.isRestricted).toBe(true);
      expect(actorView.isBlocked).toBe(false);
    });
  });

  describe('SAFE-07: Safety Case Timeline Transitions', () => {
    it('transitions report case from received to in_review and action_taken', () => {
      const step1 = SafetyStateMachine.evaluateCaseTransition('received', 'start_review');
      expect(step1.nextStatus).toBe('in_review');
      expect(step1.timelineItem.title).toContain('Review');

      const step2 = SafetyStateMachine.evaluateCaseTransition('in_review', 'take_action');
      expect(step2.nextStatus).toBe('action_taken');
      expect(step2.timelineItem.description).toContain('Corrective enforcement');
    });

    it('supports appeal submission and resolution lifecycle', () => {
      const appealStep = SafetyStateMachine.evaluateCaseTransition('action_taken', 'submit_appeal');
      expect(appealStep.nextStatus).toBe('appealed');

      const resolveStep = SafetyStateMachine.evaluateCaseTransition('appealed', 'resolve_appeal');
      expect(resolveStep.nextStatus).toBe('appeal_resolved');
    });
  });

  describe('SAFE-01: India Emergency Helplines & Grievance Officer', () => {
    it('includes all mandatory Indian statutory helplines: 112, 100, 1091, 181, 1930, 1098', () => {
      const numbers = INDIA_EMERGENCY_HELPLINES.map((h) => h.number);
      expect(numbers).toContain('112');
      expect(numbers).toContain('100');
      expect(numbers).toContain('1091');
      expect(numbers).toContain('181');
      expect(numbers).toContain('1930');
      expect(numbers).toContain('1098');
    });

    it('includes Grievance Officer statutory disclosure per IT Rules 2021', () => {
      expect(GRIEVANCE_OFFICER.email).toContain('@');
      expect(GRIEVANCE_OFFICER.statutoryNotice).toContain('Information Technology');
    });
  });
});

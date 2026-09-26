import { useSafetyStore } from '../state/useSafetyStore';
import { SafetyStateMachine } from '../../../domain/safetyStateMachine';
import { INDIA_EMERGENCY_HELPLINES, GRIEVANCE_OFFICER } from '../../../domain/safetyTypes';

describe('Phase 9 — Safety Domain & Store Test Suite', () => {
  beforeEach(() => {
    // Reset store state
    useSafetyStore.setState({
      safetyCases: [],
      restrictions: [],
      trustedContacts: [],
      activeDatePlan: null,
      reportTarget: null,
      blockRestrictTarget: null,
      activeCase: null,
      isReportModalOpen: false,
      isBlockRestrictModalOpen: false,
      isDateSafetyModalOpen: false,
      isTrustedContactsModalOpen: false,
      isCaseTimelineModalOpen: false,
      isAgeHoldModalOpen: false,
      analyticsEvents: [],
    });
  });

  describe('SAFE-01: Safety Center & Statutory Compliance', () => {
    it('provides valid Indian statutory emergency helplines', () => {
      expect(INDIA_EMERGENCY_HELPLINES.length).toBeGreaterThanOrEqual(5);
      const emergency112 = INDIA_EMERGENCY_HELPLINES.find((h) => h.number === '112');
      const womenHelpline = INDIA_EMERGENCY_HELPLINES.find((h) => h.number === '1091');
      const cyberHelpline = INDIA_EMERGENCY_HELPLINES.find((h) => h.number === '1930');

      expect(emergency112).toBeDefined();
      expect(emergency112?.available).toContain('24x7');
      expect(womenHelpline).toBeDefined();
      expect(cyberHelpline).toBeDefined();
    });

    it('contains Grievance Officer information per IT Rules 2021', () => {
      expect(GRIEVANCE_OFFICER.name).toBe('Ananya Deshmukh, Advocate');
      expect(GRIEVANCE_OFFICER.designation).toContain('Grievance');
      expect(GRIEVANCE_OFFICER.email).toContain('@light.app');
      expect(GRIEVANCE_OFFICER.statutoryNotice).toContain('Information Technology');
    });
  });

  describe('SAFE-02 & SAFE-03: Report User & Content Flow', () => {
    it('submitting a report generates a deterministic Case ID and records case', async () => {
      const store = useSafetyStore.getState();
      store.openReportModal({
        targetType: 'user',
        targetId: 'user_bad_actor',
        targetName: 'Suspicious Member',
      });

      const newCase = await store.submitReport('user_current_1', {
        category: 'harassment',
        severity: 'high',
        details: 'Sent harassing messages repeatedly',
      });

      expect(newCase).toBeDefined();
      expect(newCase?.caseId).toMatch(/^CASE-\d{4}-\d{4}$/);

      const updatedStore = useSafetyStore.getState();
      const createdCase = updatedStore.safetyCases.find((c) => c.caseId === newCase?.caseId);
      expect(createdCase).toBeDefined();
      expect(createdCase?.targetName).toBe('Suspicious Member');
      expect(createdCase?.status).toBe('received');
      expect(createdCase?.timeline.length).toBeGreaterThanOrEqual(1);
    });

    it('logs report_submitted analytics event upon submission', async () => {
      const store = useSafetyStore.getState();
      store.openReportModal({
        targetType: 'message',
        targetId: 'msg_99',
        targetName: 'Inappropriate Message',
      });

      await store.submitReport('user_current_1', {
        category: 'hate_speech',
        severity: 'urgent',
        applyImmediateProtection: 'block',
      });

      const updatedStore = useSafetyStore.getState();
      const event = updatedStore.analyticsEvents.find((e) => e.event === 'report_submitted');
      expect(event).toBeDefined();
      expect(event?.payload.category).toBe('hate_speech');
      expect(event?.payload.protectionApplied).toBe('block');
    });
  });

  describe('SAFE-04: Block & Restrict Visibility Rules', () => {
    it('block enforces two-way mutual invisibility', () => {
      const blockedPairs = new Set<string>(['user_1:user_2']);
      const restrictedPairs = new Set<string>();

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

    it('restrict silently prevents messaging while keeping profile visible', () => {
      const blockedPairs = new Set<string>();
      const restrictedPairs = new Set<string>(['user_1:user_2']);

      const view = SafetyStateMachine.evaluateVisibility(
        'user_1',
        'user_2',
        blockedPairs,
        restrictedPairs
      );
      expect(view.isVisible).toBe(true);
      expect(view.canMessage).toBe(false);
      expect(view.isRestricted).toBe(true);
      expect(view.isBlocked).toBe(false);
    });

    it('updates store when blocking and unblocking users', async () => {
      const store = useSafetyStore.getState();
      await store.blockUser('user_current_1', 'user_target_99', 'Target Person', 'Safety concern');

      const storeAfterBlock = useSafetyStore.getState();
      expect(
        storeAfterBlock.restrictions.some(
          (r) => r.targetUserId === 'user_target_99' && r.type === 'block'
        )
      ).toBe(true);

      await store.unblockUser('user_current_1', 'user_target_99');
      const storeAfterUnblock = useSafetyStore.getState();
      expect(
        storeAfterUnblock.restrictions.some((r) => r.targetUserId === 'user_target_99')
      ).toBe(false);
    });
  });

  describe('SAFE-05: Date Safety Check-In Timer & Quick SOS', () => {
    it('starts check-in timer and logs analytics', async () => {
      const store = useSafetyStore.getState();
      const plan = await store.startDateSafetyTimer({
        connectionId: 'conn_101',
        partnerName: 'Ananya Sharma',
        venueCategory: 'Cafe',
        locationZone: 'Indiranagar, Bangalore',
        startTime: '18:00',
        timerDurationMinutes: 120,
      });

      expect(plan).toBeDefined();
      expect(plan.partnerName).toBe('Ananya Sharma');
      expect(plan.timerStatus).toBe('active');

      const updatedStore = useSafetyStore.getState();
      expect(updatedStore.activeDatePlan?.id).toBe(plan.id);

      const event = updatedStore.analyticsEvents.find(
        (e) => e.event === 'date_safety_timer_started'
      );
      expect(event).toBeDefined();
    });

    it('triggers quick SOS alert', async () => {
      const store = useSafetyStore.getState();
      await store.startDateSafetyTimer({
        connectionId: 'conn_102',
        partnerName: 'Rohan Verma',
        venueCategory: 'Park',
        locationZone: 'Cubbon Park, Bangalore',
        startTime: '16:00',
        timerDurationMinutes: 90,
      });

      const sosRes = await store.triggerSos();
      expect(sosRes.success).toBe(true);

      const updatedStore = useSafetyStore.getState();
      const sosEvent = updatedStore.analyticsEvents.find((e) => e.event === 'sos_triggered');
      expect(sosEvent).toBeDefined();
    });
  });

  describe('SAFE-06: Trusted Contacts Masking & Management', () => {
    it('masks phone numbers securely', () => {
      const masked1 = SafetyStateMachine.maskPhoneNumber('+91 9876543210');
      expect(masked1).toContain('****');
      expect(masked1.endsWith('3210')).toBe(true);

      const masked2 = SafetyStateMachine.maskPhoneNumber('9876543210');
      expect(masked2).toContain('****');
      expect(masked2.endsWith('3210')).toBe(true);
    });

    it('adds trusted contact with masked storage', async () => {
      const store = useSafetyStore.getState();
      const newContact = await store.addTrustedContact({
        userId: 'user_current_1',
        name: 'Aarav Gupta',
        relationship: 'Brother',
        phoneNumber: '+91 9876543210',
      });

      expect(newContact).toBeDefined();
      expect(newContact.name).toBe('Aarav Gupta');
      expect(newContact.phoneMasked).toContain('****');
      expect(newContact.isVerifiedConsent).toBe(true);

      const updatedStore = useSafetyStore.getState();
      expect(updatedStore.trustedContacts.some((c) => c.name === 'Aarav Gupta')).toBe(true);
    });
  });

  describe('SAFE-07: Safety Case Status & Appeal Route', () => {
    it('allows submitting an appeal for eligible resolved cases', async () => {
      const store = useSafetyStore.getState();
      store.openReportModal({
        targetType: 'user',
        targetId: 'user_disputed_10',
        targetName: 'Disputed Member',
      });

      const submittedCase = await store.submitReport('user_current_1', {
        category: 'scam_financial',
        severity: 'medium',
        details: 'Attempted UPI scam',
      });

      const caseId = submittedCase!.caseId;
      await store.appealCase(caseId, 'I have additional chat screenshots showing transaction request');

      const updatedStore = useSafetyStore.getState();
      const appealedCase = updatedStore.safetyCases.find((c) => c.caseId === caseId);
      expect(appealedCase?.status).toBe('appealed');
      expect(appealedCase?.timeline.some((t) => t.status === 'appealed')).toBe(true);
    });
  });
});

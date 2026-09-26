import { create } from 'zustand';
import {
  SafetyCase,
  RestrictionItem,
  TrustedContact,
  DateSafetyPlan,
  ReportCategory,
  ReportSeverity,
} from '../../../domain/safetyTypes';
import { mockSafetyRepo } from '../../../data/mocks';
import { AddTrustedContactDto, StartDateSafetyDto } from '../../../data/repositories';

export interface SafetyState {
  // Cases & Reports (SAFE-02, SAFE-03, SAFE-07)
  safetyCases: SafetyCase[];
  isLoadingCases: boolean;
  activeCase: SafetyCase | null;

  // Blocked & Restricted Accounts (SAFE-04)
  restrictions: RestrictionItem[];
  isLoadingRestrictions: boolean;

  // Trusted Contacts (SAFE-06)
  trustedContacts: TrustedContact[];
  isLoadingContacts: boolean;

  // Date Safety & Timer (SAFE-05)
  activeDatePlan: DateSafetyPlan | null;

  // Modals & UI Sheet Visibility
  isReportModalOpen: boolean;
  reportTarget: {
    targetType: 'user' | 'message' | 'circle' | 'post' | 'comment';
    targetId: string;
    targetName: string;
  } | null;

  isBlockRestrictModalOpen: boolean;
  blockRestrictTarget: { userId: string; name: string } | null;

  isDateSafetyModalOpen: boolean;
  isTrustedContactsModalOpen: boolean;
  isCaseTimelineModalOpen: boolean;
  isAgeHoldModalOpen: boolean;

  // Analytics
  analyticsEvents: { event: string; payload: Record<string, unknown>; timestamp: string }[];

  // Actions
  loadSafetyCases: (userId: string) => Promise<void>;
  loadRestrictions: (userId: string) => Promise<void>;
  loadTrustedContacts: (userId: string) => Promise<void>;
  openReportModal: (target: {
    targetType: 'user' | 'message' | 'circle' | 'post' | 'comment';
    targetId: string;
    targetName: string;
  }) => void;
  closeReportModal: () => void;
  submitReport: (
    reporterId: string,
    data: {
      category: ReportCategory;
      severity: ReportSeverity;
      details?: string;
      evidenceSnippets?: string[];
      applyImmediateProtection?: 'none' | 'block' | 'restrict';
    }
  ) => Promise<SafetyCase | null>;
  appealCase: (caseId: string, reason: string) => Promise<void>;
  openBlockRestrictModal: (target: { userId: string; name: string }) => void;
  closeBlockRestrictModal: () => void;
  blockUser: (actorUserId: string, targetUserId: string, targetName: string, reason?: string) => Promise<void>;
  unblockUser: (actorUserId: string, targetUserId: string) => Promise<void>;
  restrictUser: (actorUserId: string, targetUserId: string, targetName: string, reason?: string) => Promise<void>;
  unrestrictUser: (actorUserId: string, targetUserId: string) => Promise<void>;
  addTrustedContact: (data: AddTrustedContactDto) => Promise<TrustedContact>;
  deleteTrustedContact: (contactId: string) => Promise<void>;
  startDateSafetyTimer: (data: StartDateSafetyDto) => Promise<DateSafetyPlan>;
  triggerSos: () => Promise<{ success: boolean; message: string }>;
  openCaseTimeline: (safetyCase: SafetyCase) => void;
  closeCaseTimeline: () => void;
  setDateSafetyModalOpen: (open: boolean) => void;
  setTrustedContactsModalOpen: (open: boolean) => void;
  setAgeHoldModalOpen: (open: boolean) => void;
  logAnalytics: (event: string, payload?: Record<string, unknown>) => void;
}

export const useSafetyStore = create<SafetyState>((set, get) => ({
  safetyCases: [],
  isLoadingCases: false,
  activeCase: null,

  restrictions: [],
  isLoadingRestrictions: false,

  trustedContacts: [],
  isLoadingContacts: false,

  activeDatePlan: null,

  isReportModalOpen: false,
  reportTarget: null,

  isBlockRestrictModalOpen: false,
  blockRestrictTarget: null,

  isDateSafetyModalOpen: false,
  isTrustedContactsModalOpen: false,
  isCaseTimelineModalOpen: false,
  isAgeHoldModalOpen: false,

  analyticsEvents: [],

  loadSafetyCases: async (userId) => {
    set({ isLoadingCases: true });
    try {
      const list = await mockSafetyRepo.getSafetyCases(userId);
      set({ safetyCases: list });
    } finally {
      set({ isLoadingCases: false });
    }
  },

  loadRestrictions: async (userId) => {
    set({ isLoadingRestrictions: true });
    try {
      const list = await mockSafetyRepo.getBlockedAndRestrictedUsers(userId);
      set({ restrictions: list });
    } finally {
      set({ isLoadingRestrictions: false });
    }
  },

  loadTrustedContacts: async (userId) => {
    set({ isLoadingContacts: true });
    try {
      const list = await mockSafetyRepo.getTrustedContacts(userId);
      set({ trustedContacts: list });
    } finally {
      set({ isLoadingContacts: false });
    }
  },

  openReportModal: (target) => {
    set({ isReportModalOpen: true, reportTarget: target });
  },

  closeReportModal: () => {
    set({ isReportModalOpen: false, reportTarget: null });
  },

  submitReport: async (reporterId, data) => {
    const target = get().reportTarget;
    if (!target) return null;

    const newCase = await mockSafetyRepo.submitReport({
      reporterId,
      targetType: target.targetType,
      targetId: target.targetId,
      targetName: target.targetName,
      category: data.category,
      severity: data.severity,
      details: data.details,
      evidenceSnippets: data.evidenceSnippets,
      applyImmediateProtection: data.applyImmediateProtection,
    });

    set((state) => ({
      safetyCases: [newCase, ...state.safetyCases],
      isReportModalOpen: false,
      reportTarget: null,
    }));

    get().logAnalytics('report_submitted', {
      caseId: newCase.caseId,
      category: data.category,
      targetType: target.targetType,
      protectionApplied: data.applyImmediateProtection || 'none',
    });

    return newCase;
  },

  appealCase: async (caseId, reason) => {
    const updated = await mockSafetyRepo.appealSafetyCase(caseId, reason);
    set((state) => ({
      safetyCases: state.safetyCases.map((c) => (c.caseId === caseId ? updated : c)),
      activeCase: updated,
    }));
    get().logAnalytics('safety_case_appealed', { caseId });
  },

  openBlockRestrictModal: (target) => {
    set({ isBlockRestrictModalOpen: true, blockRestrictTarget: target });
  },

  closeBlockRestrictModal: () => {
    set({ isBlockRestrictModalOpen: false, blockRestrictTarget: null });
  },

  blockUser: async (actorUserId, targetUserId, targetName, reason) => {
    await mockSafetyRepo.blockUser(actorUserId, targetUserId, targetName, reason);
    await get().loadRestrictions(actorUserId);
    set({ isBlockRestrictModalOpen: false, blockRestrictTarget: null });
    get().logAnalytics('user_blocked', { targetUserId, reason });
  },

  unblockUser: async (actorUserId, targetUserId) => {
    await mockSafetyRepo.unblockUser(actorUserId, targetUserId);
    await get().loadRestrictions(actorUserId);
    get().logAnalytics('user_unblocked', { targetUserId });
  },

  restrictUser: async (actorUserId, targetUserId, targetName, reason) => {
    await mockSafetyRepo.restrictUser(actorUserId, targetUserId, targetName, reason);
    await get().loadRestrictions(actorUserId);
    set({ isBlockRestrictModalOpen: false, blockRestrictTarget: null });
    get().logAnalytics('user_restricted', { targetUserId, reason });
  },

  unrestrictUser: async (actorUserId, targetUserId) => {
    await mockSafetyRepo.unrestrictUser(actorUserId, targetUserId);
    await get().loadRestrictions(actorUserId);
    get().logAnalytics('user_unrestricted', { targetUserId });
  },

  addTrustedContact: async (data) => {
    const newContact = await mockSafetyRepo.addTrustedContact(data);
    set((state) => ({
      trustedContacts: [...state.trustedContacts, newContact],
    }));
    get().logAnalytics('trusted_contact_added', { relationship: data.relationship });
    return newContact;
  },

  deleteTrustedContact: async (contactId) => {
    await mockSafetyRepo.deleteTrustedContact(contactId);
    set((state) => ({
      trustedContacts: state.trustedContacts.filter((c) => c.id !== contactId),
    }));
  },

  startDateSafetyTimer: async (data) => {
    const plan = await mockSafetyRepo.startDateSafetyTimer(data);
    set({ activeDatePlan: plan });
    get().logAnalytics('date_safety_timer_started', {
      durationMinutes: data.timerDurationMinutes,
      venueCategory: data.venueCategory,
    });
    return plan;
  },

  triggerSos: async () => {
    const active = get().activeDatePlan;
    const planId = active?.id || 'emergency_quick';
    const res = await mockSafetyRepo.triggerSosAlert(planId);
    get().logAnalytics('sos_triggered', { planId });
    return res;
  },

  openCaseTimeline: (safetyCase) => {
    set({ isCaseTimelineModalOpen: true, activeCase: safetyCase });
    get().logAnalytics('safety_case_viewed', { caseId: safetyCase.caseId });
  },

  closeCaseTimeline: () => {
    set({ isCaseTimelineModalOpen: false, activeCase: null });
  },

  setDateSafetyModalOpen: (open) => set({ isDateSafetyModalOpen: open }),
  setTrustedContactsModalOpen: (open) => set({ isTrustedContactsModalOpen: open }),
  setAgeHoldModalOpen: (open) => set({ isAgeHoldModalOpen: open }),

  logAnalytics: (event, payload = {}) => {
    set((state) => ({
      analyticsEvents: [
        ...state.analyticsEvents,
        { event, payload, timestamp: new Date().toISOString() },
      ],
    }));
  },
}));

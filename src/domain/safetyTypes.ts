export type ReportCategory =
  | 'harassment'
  | 'spam_solicitation'
  | 'impersonation_fake'
  | 'hate_speech'
  | 'boundary_violation'
  | 'scam_financial'
  | 'underage'
  | 'other';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'urgent';

export type SafetyCaseStatus =
  | 'received'
  | 'in_review'
  | 'action_taken'
  | 'no_action'
  | 'appealed'
  | 'appeal_resolved';

export interface SafetyTimelineItem {
  status: SafetyCaseStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface SafetyCase {
  caseId: string;
  targetType: 'user' | 'message' | 'circle' | 'post' | 'comment';
  targetId: string;
  targetName: string;
  reporterId: string;
  category: ReportCategory;
  severity: ReportSeverity;
  details?: string;
  evidenceSnippets?: string[];
  status: SafetyCaseStatus;
  timeline: SafetyTimelineItem[];
  resolutionNotes?: string;
  appealEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string; // Stored securely
  phoneMasked: string; // Displayed safely e.g. +91 98****3210
  email?: string;
  isVerifiedConsent: boolean;
  addedAt: string;
}

export interface DateSafetyPlan {
  id: string;
  connectionId: string;
  partnerName: string;
  venueCategory: string;
  locationZone: string;
  startTime: string;
  timerDurationMinutes: number;
  timerStatus: 'active' | 'completed' | 'sos_triggered';
  startedAt: string;
}

export interface RestrictionItem {
  id: string;
  targetUserId: string;
  targetName: string;
  type: 'block' | 'restrict';
  reason?: string;
  createdAt: string;
}

export interface EmergencyHelpline {
  name: string;
  number: string;
  description: string;
  available: string;
}

export interface GrievanceOfficerContact {
  name: string;
  designation: string;
  email: string;
  address: string;
  statutoryNotice: string;
}

export const INDIA_EMERGENCY_HELPLINES: EmergencyHelpline[] = [
  {
    name: 'National Emergency Helpline',
    number: '112',
    description: 'All-in-one emergency response (Police, Fire, Ambulance)',
    available: '24x7',
  },
  {
    name: 'Police Control Room',
    number: '100',
    description: 'Immediate police intervention across India',
    available: '24x7',
  },
  {
    name: 'Women in Distress Helpline',
    number: '1091',
    description: 'National Commission for Women round-the-clock emergency support',
    available: '24x7',
  },
  {
    name: 'Women Helpline (Domestic Abuse)',
    number: '181',
    description: 'Specialized counseling and rescue for women facing domestic harm',
    available: '24x7',
  },
  {
    name: 'National Cyber Crime Helpline',
    number: '1930',
    description: 'Financial fraud, online harassment, and cyber extortion reporting',
    available: '24x7',
  },
  {
    name: 'Childline (Under-18 Support)',
    number: '1098',
    description: 'Emergency care and child protection services',
    available: '24x7',
  },
];

export const GRIEVANCE_OFFICER: GrievanceOfficerContact = {
  name: 'Ananya Deshmukh, Advocate',
  designation: 'Resident Grievance Officer & Safety Lead',
  email: 'grievance-officer@light.app',
  address: 'Project LIGHT India, Embassy GolfLinks Tech Park, Domlur, Bengaluru 560071',
  statutoryNotice:
    'Appointed in compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. Acknowledgments dispatched within 24 hours; complaints disposed within 15 days.',
};

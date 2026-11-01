export type GradeLevel = 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Freshman Program' | 'Freshman University';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: DifficultyLevel;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  subjectName: string;
  grade: GradeLevel;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  userAnswers: Record<number, number>;
}

export interface ConceptStep {
  stepNumber: number;
  title: string;
  description: string;
  formulaOrExample?: string;
  examTip?: string;
  commonPitfall?: string;
}

export interface DownloadableMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'Formula Sheet' | 'Past Paper';
  fileSize: string;
  downloadUrl: string;
}

export interface LearningPart {
  id: string;
  topicId: string;
  chapterId: string;
  subjectId: string;
  grade: GradeLevel;
  partNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  isFreePreview: boolean;
  videoUrl: string;
  videoPoster?: string;
  videoChapters?: { time: number; label: string }[];
  textNotes: string;
  conceptBreakdown: ConceptStep[];
  downloadables: DownloadableMaterial[];
  quizQuestions: QuizQuestion[];
  examTimeMinutes?: number;
  isPublished?: boolean;
  status?: 'published' | 'draft';
  publishedAt?: string;
  lastModified?: string;
}

// Alias Lesson to LearningPart for backwards compatibility
export type Lesson = LearningPart;

export interface Topic {
  id: string;
  chapterId: string;
  subjectId: string;
  grade: GradeLevel;
  topicNumber: number;
  title: string;
  description: string;
  coverImage?: string;
  isFree?: boolean;
  parts: LearningPart[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  grade: GradeLevel;
  chapterNumber: number;
  title: string;
  order: number;
  isActive: boolean;
  coverImage?: string;
  isPremium?: boolean;
  isFree?: boolean;
  topics: Topic[];
  // Backwards compatibility getter:
  lessons: LearningPart[];
  isPublished?: boolean;
  status?: 'published' | 'draft';
  publishedAt?: string;
  lastModified?: string;
}

export interface Subject {
  id: string;
  title: string;
  grade: GradeLevel;
  stream?: 'Natural Science' | 'Social Science' | 'General';
  code: string;
  description: string;
  coverImage?: string;
  priceETB: number;
  priceUSD: number;
  isActive: boolean;
  instructorName: string;
  instructorTitle: string;
  totalChaptersCount?: number;
  totalLessonsCount?: number;
  isPublished?: boolean;
  status?: 'published' | 'draft';
  publishedAt?: string;
  lastModified?: string;
}

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  provider: 'Telebirr' | 'Commercial Bank of Ethiopia (CBE)' | 'Awash Bank' | 'Other';
  accountNumber: string;
  accountName: string;
  instructions: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
}

export interface GradePackagePricing {
  grade: GradeLevel;
  allSubjectsPriceETB: number;
  allSubjectsPriceUSD: number;
  isActive: boolean;
  durationLabel: string;
  durationDays: number;
  coverImage?: string;
}

export interface PromoDiscount {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  isActive: boolean;
  validUntil?: string;
}

export interface SubscriptionDurationOption {
  id: string;
  label: string;
  labelOromo: string;
  days: number;
  isDefault?: boolean;
}

export interface PaymentSettings {
  gradePackages: Record<GradeLevel, GradePackagePricing>;
  subjectPrices: Record<string, { priceETB: number; priceUSD: number }>;
  paymentMethods: PaymentMethodConfig[];
  promotions: PromoDiscount[];
  subscriptionDurations: SubscriptionDurationOption[];
  activeAcademicYear: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorName: string;
  action: 'APPROVE_PAYMENT' | 'REJECT_PAYMENT' | 'GRANT_ACCESS' | 'REVOKE_ACCESS' | 'UPDATE_PRICES' | 'UPDATE_PAYMENT_METHODS' | 'BROADCAST_ANNOUNCEMENT';
  targetStudentId?: string;
  targetStudentName?: string;
  details: string;
}

export interface PaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  purchaseType: 'all_subjects_package' | 'individual_subjects';
  subjectId: string; // Primary or comma-separated list of IDs
  subjectTitle: string; // Primary or summary
  subjectIds?: string[]; // Array of selected subjects
  subjectTitles?: string[]; // Array of selected subject names
  grade: GradeLevel;
  amountETB: number;
  amountUSD: number;
  discountAppliedETB?: number;
  promoCodeUsed?: string;
  paymentMethod: 'Telebirr' | 'Commercial Bank of Ethiopia (CBE)' | 'Awash Bank' | 'Direct Card' | string;
  referenceNumber: string;
  screenshotUrl: string;
  submittedAt: string;
  status: PaymentStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  subscriptionExpiresAt?: string;
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'lesson' | 'quiz' | 'payment' | 'announcement';
  isRead: boolean;
  targetGrade?: GradeLevel | 'All';
  linkToLessonId?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: GradeLevel;
  stream?: 'Natural Science' | 'Social Science';
  schoolName?: string;
  cityOrRegion?: string;
  password?: string;
  isRegistered?: boolean;
  enrolledSubjectIds: string[];
  pendingSubjectIds: string[];
  completedLessonIds: string[];
  quizAttempts: QuizAttempt[];
  avatarUrl?: string;
  registrationDate: string;
  subscriptionExpiresAt?: string; // ISO date string or 'Lifetime'
  hasAllSubjectsAccess?: boolean;
}


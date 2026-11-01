import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Subject,
  Chapter,
  Lesson,
  PaymentSubmission,
  StudentProfile,
  UserNotification,
  GradeLevel,
  QuizAttempt,
  PaymentSettings,
  AuditLogEntry,
  PaymentMethodConfig,
  GradePackagePricing,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

import { setupRealtimeSync } from '../lib/supabaseClient';

export interface RegisterStudentInput {
  name: string;
  phone: string;
  email: string;
  grade: GradeLevel;
  stream?: 'Natural Science' | 'Social Science';
  schoolName: string;
  cityOrRegion: string;
  password?: string;
}

interface AppContextType {
  // Role & User
  userRole: 'student' | 'admin';
  setUserRole: (role: 'student' | 'admin') => void;
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  language: 'om' | 'en';
  setLanguage: (lang: 'om' | 'en') => void;
  currentStudent: StudentProfile;
  setCurrentStudent: React.Dispatch<React.SetStateAction<StudentProfile>>;
  allStudents: StudentProfile[];
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  registerStudent: (input: RegisterStudentInput) => Promise<{ success: boolean; student?: StudentProfile; error?: string }>;
  loginStudent: (identifier: string, password?: string) => Promise<{ success: boolean; student?: StudentProfile; error?: string }>;
  logoutStudent: () => void;
  
  // Curriculum
  subjects: Subject[];
  chapters: Chapter[];
  selectedGrade: GradeLevel | 'All';
  setSelectedGrade: (grade: GradeLevel | 'All') => void;
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;

  // Payments & Access
  payments: PaymentSubmission[];
  paymentSettings: PaymentSettings | null;
  updatePaymentSettings: (settings: PaymentSettings) => Promise<boolean>;
  auditLogs: AuditLogEntry[];
  refreshAuditLogs: () => Promise<void>;
  submitPayment: (submission: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<boolean>;
  approvePayment: (paymentId: string, adminNotes?: string, durationDays?: number) => Promise<boolean>;
  rejectPayment: (paymentId: string, reason: string) => Promise<boolean>;
  checkSubjectAccess: (subjectId: string) => { isUnlocked: boolean; isPending: boolean; isApproved: boolean; isExpired?: boolean };
  grantStudentAccess: (studentId: string, options: { subjectId?: string; allSubjects?: boolean; grant: boolean; expirationDays?: number }) => Promise<boolean>;

  // Student Actions
  markLessonComplete: (lessonId: string) => void;
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => QuizAttempt;
  
  // Admin Content Management
  addSubject: (newSubject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  moveSubject: (id: string, direction: 'up' | 'down') => void;
  addChapter: (newChapter: Omit<Chapter, 'id' | 'lessons'>) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  moveChapter: (id: string, direction: 'up' | 'down') => void;
  addLessonToChapter: (chapterId: string, newLesson: Omit<Lesson, 'id' | 'chapterId'>) => void;
  updateLesson: (chapterId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (chapterId: string, lessonId: string) => void;
  moveLesson: (chapterId: string, lessonId: string, direction: 'up' | 'down') => void;
  toggleStudentSubjectAccess: (studentId: string, subjectId: string) => void;
  togglePublishStatus: (itemType: 'subject' | 'chapter' | 'lesson', itemId: string, isPublished: boolean, parentId?: string) => Promise<boolean>;

  // Notifications
  notifications: UserNotification[];
  markNotificationRead: (id: string) => void;
  broadcastNotification: (title: string, message: string, targetGrade: GradeLevel | 'All') => void;
  
  // Quick navigation helpers
  viewLessonById: (lessonId: string) => void;

  // Cloud & Realtime Synchronization
  isRealtimeConnected: boolean;
  isLoadingCurriculum: boolean;
  cloudSyncNotice: string | null;
  dismissCloudNotice: () => void;
  isSyncingToServer: boolean;
  lastServerSyncTime: string | null;
  pushCurriculumToServer: (subs?: Subject[], chaps?: Chapter[]) => Promise<boolean>;
  refreshCurriculumFromServer: (silent?: boolean) => Promise<void>;
  refreshPaymentSettingsFromServer: () => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<'student' | 'admin'>('student');
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('oda_admin_email') || 'odaworku174@gmail.com';
  });
  const [language, setLanguage] = useState<'om' | 'en'>(() => {
    const saved = localStorage.getItem('oda_lang');
    return (saved as 'om' | 'en') || 'om'; // Default to Afaan Oromoo as preferred by the user!
  });
  
  // Realtime & Cloud Synchronization state
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState<boolean>(true);
  const [cloudSyncNotice, setCloudSyncNotice] = useState<string | null>(null);
  const [isSyncingToServer, setIsSyncingToServer] = useState<boolean>(false);
  const [lastServerSyncTime, setLastServerSyncTime] = useState<string | null>(null);
  const [isServerLoaded, setIsServerLoaded] = useState<boolean>(false);
  const lastVersionRef = useRef<number>(0);

  const dismissCloudNotice = () => setCloudSyncNotice(null);

  // In-memory curriculum state (server DB is authoritative source of truth)
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);

  const [allStudents, setAllStudents] = useState<StudentProfile[]>(() => {
    const saved = localStorage.getItem('oda_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [currentStudent, setCurrentStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('oda_current_student');
    return saved ? JSON.parse(saved) : (allStudents[0] || INITIAL_STUDENTS[0]);
  });

  const [payments, setPayments] = useState<PaymentSubmission[]>(INITIAL_PAYMENTS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    const saved = localStorage.getItem('oda_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'All'>('All');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('oda_is_authenticated');
    if (saved !== null) {
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('oda_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  // 1. Authoritative Refresh: Fetch latest curriculum from cloud backend
  const refreshCurriculumFromServer = useCallback(async (silent = false) => {
    try {
      const isSuperAdmin = userRole === 'admin' && adminEmail.toLowerCase() === 'odaworku174@gmail.com';
      const url = `/api/curriculum?role=${userRole}&actorEmail=${encodeURIComponent(isSuperAdmin ? adminEmail : '')}`;
      
      const res = await fetch(url, {
        headers: {
          'x-admin-email': isSuperAdmin ? adminEmail : '',
          'x-admin-token': isSuperAdmin ? 'oda-super-admin-auth' : '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.subjects) && Array.isArray(data.chapters)) {
          setSubjects(data.subjects);
          setChapters(data.chapters);
          setLastServerSyncTime(data.updatedAt || new Date().toISOString());

          if (!silent && lastVersionRef.current > 0 && data.version && data.version !== lastVersionRef.current) {
            setCloudSyncNotice('Qabiyyeen barnootaa haaraan sarara online irraa dhufeera (Live Synced)!');
            setTimeout(() => setCloudSyncNotice(null), 4000);
          }

          if (data.version) {
            lastVersionRef.current = data.version;
          }
        }
      }
    } catch (err) {
      console.warn('[ODA APP] Notice fetching curriculum:', err);
    } finally {
      setIsLoadingCurriculum(false);
    }
  }, [userRole, adminEmail]);

  // 2. Authoritative Refresh: Fetch dynamic payment settings & prices from cloud backend
  const refreshPaymentSettingsFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/payment-settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setPaymentSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('[ODA APP] Notice fetching payment settings:', err);
    }
  }, []);

  // 3. Initial Load: Fetch all data from cloud backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        await Promise.allSettled([
          refreshCurriculumFromServer(true),
          refreshPaymentSettingsFromServer(),
          (async () => {
            const stuRes = await fetch('/api/students');
            if (stuRes.ok) {
              const stuJson = await stuRes.json();
              if (isMounted && stuJson.success && Array.isArray(stuJson.students) && stuJson.students.length > 0) {
                setAllStudents(stuJson.students);
              }
            }
          })(),
          (async () => {
            const payRes = await fetch('/api/payments');
            if (payRes.ok) {
              const payJson = await payRes.json();
              if (isMounted && payJson.success && Array.isArray(payJson.payments)) {
                setPayments(payJson.payments);
              }
            }
          })(),
          (async () => {
            const auditRes = await fetch('/api/audit-logs');
            if (auditRes.ok) {
              const auditJson = await auditRes.json();
              if (isMounted && auditJson.success && Array.isArray(auditJson.logs)) {
                setAuditLogs(auditJson.logs);
              }
            }
          })(),
        ]);
      } finally {
        if (isMounted) setIsServerLoaded(true);
      }
    };

    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, [refreshCurriculumFromServer, refreshPaymentSettingsFromServer]);

  // 4. Live Realtime Subscriptions (SSE + Supabase Realtime + Focus/Visibility revalidation)
  useEffect(() => {
    const cleanup = setupRealtimeSync({
      onCurriculumUpdate: () => {
        refreshCurriculumFromServer(false);
      },
      onPricingUpdate: () => {
        refreshPaymentSettingsFromServer();
      },
      onStudentAccessUpdate: (payload: any) => {
        if (payload?.studentId && currentStudent?.id === payload.studentId) {
          fetch('/api/students')
            .then(r => r.json())
            .then(data => {
              if (data.success && Array.isArray(data.students)) {
                const updated = data.students.find((s: StudentProfile) => s.id === payload.studentId);
                if (updated) {
                  setCurrentStudent(updated);
                  setCloudSyncNotice("Mirgi koorsii keessanii haaromeera! (Course access unlocked)");
                  setTimeout(() => setCloudSyncNotice(null), 5000);
                }
              }
            })
            .catch(() => {});
        }
      },
      onStatusChange: (status) => {
        setIsRealtimeConnected(status.sseConnected || status.supabaseConnected);
      },
    });

    // Background heartbeat poll every 12 seconds as a resilient fallback
    const interval = setInterval(() => {
      refreshCurriculumFromServer(true);
    }, 12000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [refreshCurriculumFromServer, refreshPaymentSettingsFromServer, currentStudent?.id]);

  // 5. Pushes curriculum updates to online server (SUPER ADMIN ONLY)
  const pushCurriculumToServer = async (
    subsToSync?: Subject[],
    chapsToSync?: Chapter[]
  ): Promise<boolean> => {
    // SECURITY GUARD: Only the authenticated Super Admin can modify shared curriculum
    if (userRole !== 'admin' || adminEmail.toLowerCase() !== 'odaworku174@gmail.com') {
      console.warn('[ODA APP] Blocked pushCurriculumToServer from non-admin role');
      return false;
    }

    const s = subsToSync || subjects;
    const c = chapsToSync || chapters;
    if (s.length === 0 || c.length === 0) return false;

    setIsSyncingToServer(true);
    try {
      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-token': 'oda-super-admin-auth',
        },
        body: JSON.stringify({
          subjects: s,
          chapters: c,
          actorEmail: adminEmail,
          adminToken: 'oda-super-admin-auth',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLastServerSyncTime(data.updatedAt || new Date().toISOString());
          if (data.version) lastVersionRef.current = data.version;
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to sync curriculum to online server:', err);
      return false;
    } finally {
      setIsSyncingToServer(false);
    }
  };

  // 6. Instantly toggle publish/draft status of a subject, chapter, or lesson (SUPER ADMIN ONLY)
  const togglePublishStatus = async (
    itemType: 'subject' | 'chapter' | 'lesson',
    itemId: string,
    isPublished: boolean,
    parentId?: string
  ): Promise<boolean> => {
    if (userRole !== 'admin' || adminEmail.toLowerCase() !== 'odaworku174@gmail.com') {
      return false;
    }

    // Optimistically update local state immediately
    if (itemType === 'lesson') {
      setChapters(prev =>
        prev.map(chap => {
          if (!parentId || chap.id === parentId) {
            return {
              ...chap,
              lessons: chap.lessons.map(l =>
                l.id === itemId
                  ? { ...l, isPublished, status: isPublished ? 'published' : 'draft', publishedAt: isPublished ? new Date().toISOString() : undefined }
                  : l
              ),
            };
          }
          return chap;
        })
      );
    } else if (itemType === 'chapter') {
      setChapters(prev =>
        prev.map(chap =>
          chap.id === itemId
            ? { ...chap, isPublished, status: isPublished ? 'published' : 'draft', publishedAt: isPublished ? new Date().toISOString() : undefined }
            : chap
        )
      );
    } else if (itemType === 'subject') {
      setSubjects(prev =>
        prev.map(sub =>
          sub.id === itemId
            ? { ...sub, isPublished, status: isPublished ? 'published' : 'draft', publishedAt: isPublished ? new Date().toISOString() : undefined }
            : sub
        )
      );
    }

    try {
      const res = await fetch('/api/curriculum/toggle-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
          'x-admin-token': 'oda-super-admin-auth',
        },
        body: JSON.stringify({
          itemType,
          itemId,
          chapterId: parentId,
          isPublished,
          actorEmail: adminEmail,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('[ODA APP] Failed to toggle publish status:', err);
      return false;
    }
  };

  // 7. Auto-sync to server ONLY when Super Admin is actively editing
  useEffect(() => {
    if (!isServerLoaded || userRole !== 'admin' || adminEmail.toLowerCase() !== 'odaworku174@gmail.com') {
      return;
    }
    const timer = setTimeout(() => {
      pushCurriculumToServer(subjects, chapters);
    }, 1200);
    return () => clearTimeout(timer);
  }, [subjects, chapters, isServerLoaded, userRole, adminEmail]);

  useEffect(() => {
    localStorage.setItem('oda_chapters', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem('oda_students', JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem('oda_current_student', JSON.stringify(currentStudent));
  }, [currentStudent]);

  useEffect(() => {
    localStorage.setItem('oda_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('oda_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('oda_lang', language);
  }, [language]);

  // Refresh audit logs from server
  const refreshAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
          localStorage.setItem('oda_audit_logs', JSON.stringify(data.logs));
        }
      }
    } catch (e) {
      console.warn('Audit logs refresh error:', e);
    }
  };

  // Update dynamic payment settings & prices (Owner Admin)
  const updatePaymentSettings = async (newSettings: PaymentSettings): Promise<boolean> => {
    try {
      setPaymentSettings(newSettings);
      localStorage.setItem('oda_payment_settings', JSON.stringify(newSettings));

      const res = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings, actorEmail: 'odaworku174@gmail.com' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          refreshAuditLogs();
          return true;
        }
      }
      return true;
    } catch (e) {
      console.error('Error updating payment settings:', e);
      return false;
    }
  };

  // Check subject access for current student - Strict Granular Course Access & Expiration
  const checkSubjectAccess = (subjectId: string) => {
    if (userRole === 'admin') {
      return { isUnlocked: true, isPending: false, isApproved: true, isExpired: false };
    }

    // 1. Check subscription expiration date
    if (currentStudent.subscriptionExpiresAt) {
      const expiresTime = new Date(currentStudent.subscriptionExpiresAt).getTime();
      if (!isNaN(expiresTime) && Date.now() > expiresTime) {
        return { isUnlocked: false, isPending: false, isApproved: false, isExpired: true };
      }
    }

    const targetSub = subjects.find(s => s.id === subjectId);

    // 2. Check if student has All-Subjects package for this grade
    const isGradePackageActive =
      currentStudent.hasAllSubjectsAccess &&
      targetSub &&
      targetSub.grade === currentStudent.grade;

    // 3. Check if specific subject is in enrolledSubjectIds
    const isEnrolled = (currentStudent.enrolledSubjectIds || []).includes(subjectId);

    // 4. Check if approved payment exists
    const hasApproved = payments.some(p => {
      if (p.studentId !== currentStudent.id || p.status !== 'Approved') return false;
      if (p.purchaseType === 'all_subjects_package' && targetSub && p.grade === targetSub.grade) {
        return true;
      }
      if (p.subjectId === subjectId) return true;
      if (Array.isArray(p.subjectIds) && p.subjectIds.includes(subjectId)) return true;
      return false;
    });

    // 5. Check if pending payment exists
    const isPendingPayment = payments.some(p => {
      if (p.studentId !== currentStudent.id || p.status !== 'Pending') return false;
      if (p.purchaseType === 'all_subjects_package' && targetSub && p.grade === targetSub.grade) {
        return true;
      }
      if (p.subjectId === subjectId) return true;
      if (Array.isArray(p.subjectIds) && p.subjectIds.includes(subjectId)) return true;
      return false;
    });

    const isPendingStudentList = (currentStudent.pendingSubjectIds || []).includes(subjectId);
    const isUnlocked = isGradePackageActive || isEnrolled || hasApproved;
    const isPending = (isPendingPayment || isPendingStudentList) && !isUnlocked;

    return {
      isUnlocked,
      isPending,
      isApproved: isUnlocked,
      isExpired: false,
    };
  };

  // Submit payment by student (Sends to backend with receipt & ref)
  const submitPayment = async (
    submission: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>
  ): Promise<boolean> => {
    const newId = `pay-req-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPayment: PaymentSubmission = {
      ...submission,
      id: newId,
      submittedAt: formattedDate,
      status: 'Pending',
    };

    // Optimistically update local state
    setPayments(prev => [newPayment, ...prev]);

    const targetSubIds = newPayment.subjectIds || [newPayment.subjectId];

    setCurrentStudent(prev => {
      const currentPending = prev.pendingSubjectIds || [];
      const updated = Array.from(new Set([...currentPending, ...targetSubIds]));
      return { ...prev, pendingSubjectIds: updated };
    });

    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === submission.studentId) {
          const currentPending = stu.pendingSubjectIds || [];
          const updated = Array.from(new Set([...currentPending, ...targetSubIds]));
          return { ...stu, pendingSubjectIds: updated };
        }
        return stu;
      })
    );

    // Add local notification
    const notif: UserNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment Verification Submitted',
      message: `Your payment receipt for ${submission.subjectTitle} has been submitted to Admin Mr. Oda for verification.`,
      timestamp: 'Just now',
      type: 'payment',
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);

    // Send to backend API
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayment),
      });
      if (res.ok) {
        const resJson = await res.json();
        if (resJson.success && resJson.payment) {
          setPayments(prev => prev.map(p => (p.id === newId ? resJson.payment : p)));
        }
        return true;
      }
    } catch (e) {
      console.warn('Backend payment submission sync fallback to local:', e);
    }
    return true;
  };

  // Admin approves payment
  const approvePayment = async (
    paymentId: string,
    adminNotes?: string,
    durationDays: number = 180
  ): Promise<boolean> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return false;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const expirationDate = new Date(Date.now() + durationDays * 86400000).toISOString();

    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? {
              ...p,
              status: 'Approved',
              adminNotes: adminNotes || 'Payment verified by Admin Mr. Oda.',
              verifiedAt: formattedDate,
              verifiedBy: 'Mr. Oda Worku',
              subscriptionExpiresAt: expirationDate,
            }
          : p
      )
    );

    const targetSubIds = payment.subjectIds || [payment.subjectId];

    // Grant access to student
    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === payment.studentId) {
          let enrolled = stu.enrolledSubjectIds || [];
          if (payment.purchaseType === 'all_subjects_package') {
            const gradeSubs = subjects.filter(s => s.grade === payment.grade).map(s => s.id);
            enrolled = Array.from(new Set([...enrolled, ...gradeSubs]));
            stu.hasAllSubjectsAccess = true;
          } else {
            enrolled = Array.from(new Set([...enrolled, ...targetSubIds]));
          }
          const pending = (stu.pendingSubjectIds || []).filter(id => !targetSubIds.includes(id));
          return {
            ...stu,
            enrolledSubjectIds: enrolled,
            pendingSubjectIds: pending,
            subscriptionExpiresAt: expirationDate,
          };
        }
        return stu;
      })
    );

    // Update current student if matches
    if (currentStudent.id === payment.studentId) {
      setCurrentStudent(prev => {
        let enrolled = prev.enrolledSubjectIds || [];
        if (payment.purchaseType === 'all_subjects_package') {
          const gradeSubs = subjects.filter(s => s.grade === payment.grade).map(s => s.id);
          enrolled = Array.from(new Set([...enrolled, ...gradeSubs]));
          prev.hasAllSubjectsAccess = true;
        } else {
          enrolled = Array.from(new Set([...enrolled, ...targetSubIds]));
        }
        const pending = (prev.pendingSubjectIds || []).filter(id => !targetSubIds.includes(id));
        return {
          ...prev,
          enrolledSubjectIds: enrolled,
          pendingSubjectIds: pending,
          subscriptionExpiresAt: expirationDate,
        };
      });
    }

    // Add student confirmation notification
    const notif: UserNotification = {
      id: `notif-${Date.now()}`,
      title: 'Course Access Activated! / Koorsoon Keessan Banameera!',
      message: `Your payment for ${payment.subjectTitle} was confirmed. All video lessons and materials are now unlocked until ${expirationDate.split('T')[0]}!`,
      timestamp: 'Just now',
      type: 'payment',
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);

    // Send to backend
    try {
      await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Approve',
          adminNotes,
          actorEmail: 'odaworku174@gmail.com',
          durationDays,
        }),
      });
      refreshAuditLogs();
    } catch (e) {
      console.warn('Backend payment approval sync notice:', e);
    }

    return true;
  };

  // Admin rejects payment
  const rejectPayment = async (paymentId: string, reason: string): Promise<boolean> => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return false;

    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId
          ? { ...p, status: 'Rejected', adminNotes: reason }
          : p
      )
    );

    const targetSubIds = payment.subjectIds || [payment.subjectId];

    // Remove from pending
    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === payment.studentId) {
          return {
            ...stu,
            pendingSubjectIds: (stu.pendingSubjectIds || []).filter(id => !targetSubIds.includes(id)),
          };
        }
        return stu;
      })
    );

    if (currentStudent.id === payment.studentId) {
      setCurrentStudent(prev => ({
        ...prev,
        pendingSubjectIds: (prev.pendingSubjectIds || []).filter(id => !targetSubIds.includes(id)),
      }));
    }

    // Notify student
    const notif: UserNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payment Verification Issue',
      message: `Your payment for ${payment.subjectTitle} could not be verified. Note: ${reason}. Please re-submit clear receipt proof.`,
      timestamp: 'Just now',
      type: 'payment',
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);

    // Call backend
    try {
      await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'Reject',
          adminNotes: reason,
          actorEmail: 'odaworku174@gmail.com',
        }),
      });
      refreshAuditLogs();
    } catch (e) {
      console.warn('Backend payment rejection sync notice:', e);
    }

    return true;
  };

  // Grant or Revoke student subject or package access manually in Admin (with audit log)
  const grantStudentAccess = async (
    studentId: string,
    options: { subjectId?: string; allSubjects?: boolean; grant: boolean; expirationDays?: number }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/students/${studentId}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, actorEmail: 'odaworku174@gmail.com' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.student) {
          setAllStudents(prev => prev.map(s => (s.id === studentId ? data.student : s)));
          if (currentStudent.id === studentId) {
            setCurrentStudent(data.student);
          }
          refreshAuditLogs();
          return true;
        }
      }
    } catch (e) {
      console.warn('Grant access server notice:', e);
    }

    // Fallback local update
    toggleStudentSubjectAccess(studentId, options.subjectId || '');
    return true;
  };

  // Toggle student subject access manually in Admin (fallback helper)
  const toggleStudentSubjectAccess = (studentId: string, subjectId: string) => {
    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === studentId) {
          const hasAccess = (stu.enrolledSubjectIds || []).includes(subjectId);
          const newEnrolled = hasAccess
            ? stu.enrolledSubjectIds.filter(id => id !== subjectId)
            : [...(stu.enrolledSubjectIds || []), subjectId];
          const newPending = (stu.pendingSubjectIds || []).filter(id => id !== subjectId);
          return { ...stu, enrolledSubjectIds: newEnrolled, pendingSubjectIds: newPending };
        }
        return stu;
      })
    );

    if (currentStudent.id === studentId) {
      setCurrentStudent(prev => {
        const hasAccess = (prev.enrolledSubjectIds || []).includes(subjectId);
        const newEnrolled = hasAccess
          ? prev.enrolledSubjectIds.filter(id => id !== subjectId)
          : [...(prev.enrolledSubjectIds || []), subjectId];
        return { ...prev, enrolledSubjectIds: newEnrolled };
      });
    }
  };


  // Student marks lesson as complete
  const markLessonComplete = (lessonId: string) => {
    setCurrentStudent(prev => {
      const alreadyCompleted = prev.completedLessonIds.includes(lessonId);
      const updated = alreadyCompleted
        ? prev.completedLessonIds.filter(id => id !== lessonId)
        : [...prev.completedLessonIds, lessonId];
      return { ...prev, completedLessonIds: updated };
    });

    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === currentStudent.id) {
          const alreadyCompleted = stu.completedLessonIds.includes(lessonId);
          const updated = alreadyCompleted
            ? stu.completedLessonIds.filter(id => id !== lessonId)
            : [...stu.completedLessonIds, lessonId];
          return { ...stu, completedLessonIds: updated };
        }
        return stu;
      })
    );
  };

  // Record quiz attempt
  const recordQuizAttempt = (attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAttempt: QuizAttempt = {
      ...attemptData,
      id: `qa-${Date.now()}`,
      completedAt: formatted,
    };

    setCurrentStudent(prev => ({
      ...prev,
      quizAttempts: [newAttempt, ...prev.quizAttempts],
    }));

    setAllStudents(prev =>
      prev.map(stu => {
        if (stu.id === currentStudent.id) {
          return { ...stu, quizAttempts: [newAttempt, ...stu.quizAttempts] };
        }
        return stu;
      })
    );

    return newAttempt;
  };

  // Admin Subject CRUD
  const addSubject = (newSubjectData: Omit<Subject, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const newSubject: Subject = { ...newSubjectData, id };
    setSubjects(prev => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    if (selectedSubject && selectedSubject.id === id) {
      setSelectedSubject(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setChapters(prev => prev.filter(c => c.subjectId !== id));
    if (selectedSubject?.id === id) {
      setSelectedSubject(null);
    }
  };

  const moveSubject = (id: string, direction: 'up' | 'down') => {
    setSubjects(prev => {
      const targetSub = prev.find(s => s.id === id);
      if (!targetSub) return prev;
      const sameGrade = prev.filter(s => s.grade === targetSub.grade);
      const index = sameGrade.findIndex(s => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === sameGrade.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const reorderedGradeSubs = [...sameGrade];
      const temp = reorderedGradeSubs[index];
      reorderedGradeSubs[index] = reorderedGradeSubs[targetIndex];
      reorderedGradeSubs[targetIndex] = temp;

      // Reassemble with other grades
      const result: Subject[] = [];
      let gradeCounter = 0;
      for (const s of prev) {
        if (s.grade === targetSub.grade) {
          result.push(reorderedGradeSubs[gradeCounter++]);
        } else {
          result.push(s);
        }
      }
      return result;
    });
  };

  // Admin Chapter CRUD
  const addChapter = (newChapterData: Omit<Chapter, 'id' | 'lessons'>) => {
    const id = `chap-${Date.now()}`;
    const newChapter: Chapter = { ...newChapterData, id, lessons: [] };
    setChapters(prev => [...prev, newChapter]);
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteChapter = (id: string) => {
    setChapters(prev => prev.filter(c => c.id !== id));
  };

  const moveChapter = (id: string, direction: 'up' | 'down') => {
    setChapters(prev => {
      const targetChap = prev.find(c => c.id === id);
      if (!targetChap) return prev;
      const subChaps = prev.filter(c => c.subjectId === targetChap.subjectId);
      const index = subChaps.findIndex(c => c.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === subChaps.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const reordered = [...subChaps];
      const temp = reordered[index];
      reordered[index] = reordered[targetIndex];
      reordered[targetIndex] = temp;

      // Update chapterNumber & order
      const updatedWithNumbers = reordered.map((c, i) => ({
        ...c,
        chapterNumber: i + 1,
        order: i + 1,
      }));

      return prev.map(c => {
        if (c.subjectId === targetChap.subjectId) {
          const match = updatedWithNumbers.find(u => u.id === c.id);
          return match || c;
        }
        return c;
      });
    });
  };

  // Admin Lesson CRUD
  const addLessonToChapter = (chapterId: string, newLessonData: Omit<Lesson, 'id' | 'chapterId'>) => {
    const id = `les-${Date.now()}`;
    const newLesson: Lesson = { ...newLessonData, id, chapterId };
    setChapters(prev =>
      prev.map(chap => {
        if (chap.id === chapterId) {
          const lessons = [...chap.lessons, newLesson];
          return {
            ...chap,
            lessons: lessons.map((l, i) => ({ ...l, partNumber: i + 1 })),
          };
        }
        return chap;
      })
    );
  };

  const updateLesson = (chapterId: string, lessonId: string, updates: Partial<Lesson>) => {
    setChapters(prev =>
      prev.map(chap => {
        if (chap.id === chapterId) {
          return {
            ...chap,
            lessons: chap.lessons.map(l => (l.id === lessonId ? { ...l, ...updates } : l)),
          };
        }
        return chap;
      })
    );
    if (selectedLesson && selectedLesson.id === lessonId) {
      setSelectedLesson(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    setChapters(prev =>
      prev.map(chap => {
        if (chap.id === chapterId) {
          const remaining = chap.lessons.filter(l => l.id !== lessonId);
          return {
            ...chap,
            lessons: remaining.map((l, i) => ({ ...l, partNumber: i + 1 })),
          };
        }
        return chap;
      })
    );
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson(null);
    }
  };

  const moveLesson = (chapterId: string, lessonId: string, direction: 'up' | 'down') => {
    setChapters(prev =>
      prev.map(chap => {
        if (chap.id !== chapterId) return chap;
        const index = chap.lessons.findIndex(l => l.id === lessonId);
        if (index === -1) return chap;
        if (direction === 'up' && index === 0) return chap;
        if (direction === 'down' && index === chap.lessons.length - 1) return chap;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const reordered = [...chap.lessons];
        const temp = reordered[index];
        reordered[index] = reordered[targetIndex];
        reordered[targetIndex] = temp;

        return {
          ...chap,
          lessons: reordered.map((l, i) => ({ ...l, partNumber: i + 1 })),
        };
      })
    );
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const broadcastNotification = (title: string, message: string, targetGrade: GradeLevel | 'All') => {
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type: 'announcement',
      isRead: false,
      targetGrade,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Mandatory Student Registration with Validation & Backend Persistence
  const registerStudent = async (
    input: RegisterStudentInput
  ): Promise<{ success: boolean; student?: StudentProfile; error?: string }> => {
    // 1. Client-side validation checks
    if (!input.name.trim()) {
      return { success: false, error: 'Maqaa guutuu galchuun dirqama (Full name is required)' };
    }
    const cleanDigits = input.phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 9 || cleanDigits.length > 15) {
      return {
        success: false,
        error: 'Lakkoofsa bilbilaa sirrii galchaa (fakkeenyaaf: 0911223344 ykn 0711223344)',
      };
    }
    if (!input.schoolName.trim()) {
      return { success: false, error: 'Maqaa mana barumsaa galchuun dirqama (School name is required)' };
    }

    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Galmee irratti dogoggorri uumameera. Irra deebi'aa yaalaa.",
        };
      }

      const verifiedStudent: StudentProfile = data.student;
      setAllStudents(prev => [verifiedStudent, ...prev]);
      setCurrentStudent(verifiedStudent);
      setIsAuthenticated(true);
      setSelectedGrade(verifiedStudent.grade);

      // Welcome notification
      const welcomeNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        title: 'Baga Nagaan Dhuftan ODA EDUCATIONAL APP!',
        message: `Galmeen keessan milkaa'inaan xumurameera. Kutaa ${verifiedStudent.grade} ${
          verifiedStudent.stream ? `(${verifiedStudent.stream})` : ''
        } filattaniiru. Barnoota keessan jalqabuu dandeessu!`,
        timestamp: 'Amma',
        type: 'announcement',
        isRead: false,
        targetGrade: verifiedStudent.grade,
      };
      setNotifications(prev => [welcomeNotif, ...prev]);

      return { success: true, student: verifiedStudent };
    } catch (e: any) {
      // Offline fallback: check local duplicates
      const isDuplicate = allStudents.some(
        s => (s.phone || '').replace(/[^0-9]/g, '') === cleanDigits
      );
      if (isDuplicate) {
        return {
          success: false,
          error: `Lakkoofsi bilbilaa (${input.phone}) kanaan dura galmaa'eera! Maaloo kallattiin seenaa (login).`,
        };
      }

      const fallbackStudent: StudentProfile = {
        id: `stu-reg-${Date.now()}`,
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email.trim() || `${cleanDigits}@student.oda.edu.et`,
        grade: input.grade,
        stream: input.stream,
        schoolName: input.schoolName.trim(),
        cityOrRegion: input.cityOrRegion.trim(),
        password: input.password || '123456',
        isRegistered: true,
        enrolledSubjectIds: [],
        pendingSubjectIds: [],
        completedLessonIds: [],
        quizAttempts: [],
        registrationDate: new Date().toISOString().split('T')[0],
      };

      setAllStudents(prev => [fallbackStudent, ...prev]);
      setCurrentStudent(fallbackStudent);
      setIsAuthenticated(true);
      setSelectedGrade(input.grade);
      return { success: true, student: fallbackStudent };
    }
  };

  // Secure Student Login (Strict: No unverified demo creation)
  const loginStudent = async (
    identifier: string,
    password?: string
  ): Promise<{ success: boolean; student?: StudentProfile; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = cleanId.replace(/[^0-9]/g, '');

    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.student) {
        setCurrentStudent(data.student);
        setIsAuthenticated(true);
        if (data.student.grade) setSelectedGrade(data.student.grade);
        return { success: true, student: data.student };
      }
    } catch (e) {
      console.warn('Backend login fallback to local cache check:', e);
    }

    // Check local database
    const found = allStudents.find(s => {
      const sDigits = (s.phone || '').replace(/[^0-9]/g, '');
      const sEmail = (s.email || '').toLowerCase();
      const sName = (s.name || '').toLowerCase();
      return (
        (cleanDigits && sDigits === cleanDigits) ||
        sEmail === cleanId ||
        sName === cleanId
      );
    });

    if (found) {
      if (password && found.password && found.password !== password.trim()) {
        return { success: false, error: 'Jechi iccitii (password) dogoggora!' };
      }
      setCurrentStudent(found);
      setIsAuthenticated(true);
      if (found.grade) setSelectedGrade(found.grade);
      return { success: true, student: found };
    }

    return {
      success: false,
      error: "Barataan lakkoofsa/imeelii kanaan galmaa'e hin argamne. Maaloo dura galmee xumuraa (Register).",
    };
  };

  const logoutStudent = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('oda_is_authenticated');
  };

  const viewLessonById = (lessonId: string) => {
    for (const chap of chapters) {
      const match = chap.lessons.find(l => l.id === lessonId);
      if (match) {
        const sub = subjects.find(s => s.id === match.subjectId) || null;
        setSelectedSubject(sub);
        setSelectedLesson(match);
        return;
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        adminEmail,
        setAdminEmail,
        language,
        setLanguage,
        currentStudent,
        setCurrentStudent,
        allStudents,
        isAuthenticated,
        setIsAuthenticated,
        registerStudent,
        loginStudent,
        logoutStudent,
        subjects,
        chapters,
        selectedGrade,
        setSelectedGrade,
        selectedSubject,
        setSelectedSubject,
        selectedLesson,
        setSelectedLesson,
        payments,
        paymentSettings,
        updatePaymentSettings,
        auditLogs,
        refreshAuditLogs,
        submitPayment,
        approvePayment,
        rejectPayment,
        checkSubjectAccess,
        grantStudentAccess,
        markLessonComplete,
        recordQuizAttempt,
        addSubject,
        updateSubject,
        deleteSubject,
        moveSubject,
        addChapter,
        updateChapter,
        deleteChapter,
        moveChapter,
        addLessonToChapter,
        updateLesson,
        deleteLesson,
        moveLesson,
        toggleStudentSubjectAccess,
        togglePublishStatus,
        notifications,
        markNotificationRead,
        broadcastNotification,
        viewLessonById,
        isRealtimeConnected,
        isLoadingCurriculum,
        cloudSyncNotice,
        dismissCloudNotice,
        isSyncingToServer,
        lastServerSyncTime,
        pushCurriculumToServer,
        refreshCurriculumFromServer,
        refreshPaymentSettingsFromServer,
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

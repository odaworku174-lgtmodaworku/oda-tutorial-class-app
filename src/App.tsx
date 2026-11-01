import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { CourseCatalog } from './components/student/CourseCatalog';
import { LessonViewer } from './components/student/LessonViewer';
import { StudentProgressDashboard } from './components/student/StudentProgressDashboard';
import { StudentProfileView } from './components/student/StudentProfileView';
import { RegistrationScreen } from './components/student/RegistrationScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Lesson, Subject, Chapter } from './types';
import { GraduationCap, BookOpen, CreditCard, ShieldCheck, User, Smartphone, Lock, CheckCircle2, X, Radio } from 'lucide-react';
import { AdminAuthModal } from './components/admin/AdminAuthModal';

const MainAppContent: React.FC = () => {
  const {
    userRole,
    setUserRole,
    selectedLesson,
    setSelectedLesson,
    selectedSubject,
    setSelectedSubject,
    subjects,
    chapters,
    setSelectedGrade,
    language,
    isAuthenticated,
    loginStudent,
    cloudSyncNotice,
    dismissCloudNotice,
    isRealtimeConnected,
  } = useApp();

  const isOromo = language === 'om';
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [showMobileAdminAuth, setShowMobileAdminAuth] = useState(false);

  // Deep-link URL parameter parsing (e.g., from Telegram / WhatsApp shared links or ?admin=login)
  React.useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const searchParams = new URLSearchParams(window.location.search);
      const gradeParam = searchParams.get('grade');
      const subjectParam = searchParams.get('subject');
      const lessonParam = searchParams.get('lesson');
      const adminParam = searchParams.get('admin') || searchParams.get('portal');

      // Admin portal direct trigger: ?admin=login or ?admin=true
      if (adminParam === 'login' || adminParam === 'true' || adminParam === 'oda') {
        const isAuthed = localStorage.getItem('oda_admin_authenticated') === 'true';
        if (isAuthed) {
          setUserRole('admin');
          setCurrentTab('admin-dashboard');
        } else {
          setShowMobileAdminAuth(true);
        }
      }

      if (gradeParam || subjectParam || lessonParam) {
        if (gradeParam) {
          setSelectedGrade(gradeParam as any);
        }

        if (subjectParam) {
          const matchedSub = subjects.find(s => s.id === subjectParam);
          if (matchedSub) {
            setSelectedSubject(matchedSub);
          }
        }

        if (lessonParam) {
          for (const chap of chapters) {
            const matchedLesson = chap.lessons.find(l => l.id === lessonParam);
            if (matchedLesson) {
              const matchedSub = subjects.find(s => s.id === matchedLesson.subjectId);
              if (matchedSub) setSelectedSubject(matchedSub);
              setActiveChapter(chap);
              setSelectedLesson(matchedLesson);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Deep link initialization error:', err);
    }
  }, [subjects, chapters, isAuthenticated, loginStudent, setSelectedGrade, setSelectedLesson, setSelectedSubject]);

  // If student is not authenticated, render the Play Store Registration & Onboarding screen
  if (userRole === 'student' && !isAuthenticated) {
    return <RegistrationScreen />;
  }

  const handleSelectLesson = (lesson: Lesson, subject: Subject, chapter: Chapter) => {
    setSelectedSubject(subject);
    setActiveChapter(chapter);
    setSelectedLesson(lesson);
  };

  const handleBackToCourse = () => {
    setSelectedLesson(null);
  };

  // If a lesson is actively selected, show the rich LessonViewer
  if (selectedLesson && selectedSubject) {
    const chapter = activeChapter || chapters.find(c => c.id === selectedLesson.chapterId) || chapters[0];
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <LessonViewer
            lesson={selectedLesson}
            subject={selectedSubject}
            chapter={chapter}
            onBackToCourse={handleBackToCourse}
          />
        </main>
        <Footer onOpenAdmin={() => setShowMobileAdminAuth(true)} isOromo={isOromo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Realtime Central Cloud Sync Live Notice */}
      {cloudSyncNotice && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border border-emerald-500/50 backdrop-blur-md text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          </div>
          <span className="text-emerald-100">{cloudSyncNotice}</span>
          <button
            onClick={dismissCloudNotice}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {userRole === 'student' ? (
          <>
            {currentTab === 'catalog' && (
              <CourseCatalog onSelectLesson={handleSelectLesson} />
            )}
            {currentTab === 'my-learning' && (
              <StudentProgressDashboard
                onSelectLesson={handleSelectLesson}
                onBrowseCourses={() => setCurrentTab('catalog')}
              />
            )}
            {currentTab === 'profile' && <StudentProfileView />}
          </>
        ) : (
          <AdminDashboard
            onPreviewLesson={handleSelectLesson}
            initialTab={
              currentTab === 'admin-payments'
                ? 'payments'
                : currentTab === 'admin-content'
                ? 'content'
                : currentTab === 'admin-students'
                ? 'students'
                : 'overview'
            }
          />
        )}
      </main>

      <Footer onOpenAdmin={() => setShowMobileAdminAuth(true)} isOromo={isOromo} />

      {/* MOBILE BOTTOM NAVIGATION BAR FOR TOUCH DEVICES */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
        {userRole === 'student' ? (
          <>
            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('catalog');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
                currentTab === 'catalog'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>{isOromo ? 'Kutaalee' : 'Grades'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('my-learning');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
                currentTab === 'my-learning'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{isOromo ? 'Adeemsa' : 'Progress'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('profile');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-bold ${
                currentTab === 'profile'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>{isOromo ? 'Kaffaltii' : 'Payment'}</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('admin-dashboard');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'admin-dashboard'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>{isOromo ? 'Dashboard' : 'Overview'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('admin-content');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'admin-content'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{isOromo ? 'Qabiyyee' : 'Content'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab('admin-payments');
              }}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold ${
                currentTab === 'admin-payments'
                  ? 'text-sky-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>{isOromo ? 'Kaffaltii' : 'Payments'}</span>
            </button>

            <button
              onClick={() => {
                setUserRole('student');
                setSelectedLesson(null);
                setCurrentTab('catalog');
              }}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold text-amber-600 hover:text-amber-700"
            >
              <GraduationCap className="w-5 h-5" />
              <span>{isOromo ? "Gara Barataatti" : 'Student View'}</span>
            </button>
          </>
        )}
      </nav>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={showMobileAdminAuth}
        onClose={() => setShowMobileAdminAuth(false)}
        onSuccess={() => {
          setUserRole('admin');
          setSelectedLesson(null);
          setCurrentTab('admin-dashboard');
        }}
      />
    </div>
  );
};

const Footer: React.FC<{ onOpenAdmin: () => void; isOromo: boolean }> = ({ onOpenAdmin, isOromo }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
            O
          </div>
          <span className="font-bold text-slate-900">ODA EDUCATIONAL APP</span>
          <span>·</span>
          <span>Grade 9–12 & Freshman University Curriculum</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">STEM & Social Science Learning System</span>
          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100"
            title="Iddoo Bulchiinsaa (Mr. Oda Worku)"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>{isOromo ? 'Barsiisaa / Bulchiinsa' : 'Teacher Portal'}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

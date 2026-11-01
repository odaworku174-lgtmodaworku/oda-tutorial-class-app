import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_LOGO_IMAGE } from '../../data/mockData';
import {
  Bell,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  User,
  Layers,
  LogOut,
  Smartphone,
  Wifi,
  WifiOff,
  X,
  HardDrive,
  Share2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AdminAuthModal } from '../admin/AdminAuthModal';
import { ShareModal } from './ShareModal';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const {
    userRole,
    setUserRole,
    language,
    setLanguage,
    currentStudent,
    allStudents,
    setCurrentStudent,
    notifications,
    markNotificationRead,
    payments,
    setSelectedLesson,
    logoutStudent,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Network connection monitoring for navigator.onLine
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionToast, setConnectionToast] = useState<{
    visible: boolean;
    status: 'offline' | 'restored';
    message: string;
    subMessage: string;
  } | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending').length;
  const isOromo = language === 'om';

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setIsOnline(true);
      setConnectionToast({
        visible: true,
        status: 'restored',
        message: isOromo ? "Intarneetiin deebi'eera!" : 'Connection restored!',
        subMessage: isOromo
          ? "Tajaajila online hunda fiidiyoo haaraa dabalatee banameera."
          : 'Back online. Live video streaming, tests, and cloud sync are restored.',
      });
      hideTimer = setTimeout(() => {
        setConnectionToast(prev => (prev?.status === 'restored' ? null : prev));
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionToast({
        visible: true,
        status: 'offline',
        message: isOromo ? 'Intarneetiin addaan citeera (Offline Mode)' : 'Connection Lost (Offline Mode)',
        subMessage: isOromo
          ? 'Qabiyyee fiidiyoo fi nootiiwwan kanaan dura buufaman (cached) qofatu banama.'
          : 'You are offline. Only cached lesson videos, notes, and downloaded content remain accessible.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check: if already offline when app mounts
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOromo]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedLesson(null);
                setCurrentTab(userRole === 'admin' ? 'admin-dashboard' : 'catalog');
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <img
                src={APP_LOGO_IMAGE}
                alt="ODA Logo"
                className="w-10 h-10 object-contain rounded-full shadow-sm ring-2 ring-emerald-500/20 shrink-0"
              />
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                  ODA EDUCATIONAL APP
                </span>
                <span className="hidden sm:inline text-xs text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-full ml-2 border border-sky-200">
                  {isOromo ? 'Kutaa 9–12 & Yuunivarsitii' : 'Grade 9–12 & University'}
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {userRole === 'student' ? (
              <>
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                    setCurrentTab('catalog');
                  }}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'catalog' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Kutaalee & Barnoota' : 'Curriculum & Courses'}
                </button>
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                    setCurrentTab('my-learning');
                  }}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'my-learning' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Adeemsa Barumsaa' : 'My Learning & Progress'}
                </button>
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                    setCurrentTab('profile');
                  }}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'profile' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Kaffaltii & Nagahee' : 'Payments & Receipts'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('admin-dashboard')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'admin-dashboard' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Fuula Hojii (Dashboard)' : 'Dashboard Overview'}
                </button>
                <button
                  onClick={() => setCurrentTab('admin-payments')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
                    currentTab === 'admin-payments' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  <span>{isOromo ? 'Mirkaneessa Kaffaltii' : 'Payment Approvals'}</span>
                  {pendingPaymentsCount > 0 && (
                    <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {pendingPaymentsCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setCurrentTab('admin-content')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'admin-content' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Bulchiinsa Qabiyyee' : 'Content Management'}
                </button>
                <button
                  onClick={() => setCurrentTab('admin-students')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 ${
                    currentTab === 'admin-students' ? 'text-sky-700 font-semibold border-b-2 border-sky-600' : ''
                  }`}
                >
                  {isOromo ? 'Galmee Barattootaa' : 'Student Roster'}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Action (Role switcher + Language Toggle + Notifications) */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Afaan Oromoo / English Toggle */}
            <button
              onClick={() => setLanguage(isOromo ? 'en' : 'om')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
              title="Afaan jijjiiri / Change language"
            >
              <span>🌐</span>
              <span className="font-bold">{isOromo ? 'Afaan Oromoo' : 'English'}</span>
            </button>
            {/* Student Switcher dropdown (for demo purposes) */}
            {userRole === 'student' && (
              <div className="relative">
                <button
                  onClick={() => setShowStudentPicker(!showStudentPicker)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  title="Switch demo student"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline font-medium">{currentStudent.name}</span>
                  <span className="text-slate-400">({currentStudent.grade})</span>
                </button>

                {showStudentPicker && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                    <div className="px-3 py-1 text-xs font-semibold text-slate-400">
                      Switch Student Account
                    </div>
                    {allStudents.map(student => (
                      <button
                        key={student.id}
                        onClick={() => {
                          setCurrentStudent(student);
                          setShowStudentPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 ${
                          currentStudent.id === student.id ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                        }`}
                      >
                        <span className="font-medium">{student.name}</span>
                        <span className="text-slate-400 text-[11px]">{student.grade} · {student.enrolledSubjectIds.length} course(s) unlocked</span>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setSelectedLesson(null);
                          setCurrentTab('profile');
                          setShowStudentPicker(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{isOromo ? 'Profaayilii & Kaffaltii' : 'View Student Profile'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowStudentPicker(false);
                          logoutStudent();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isOromo ? 'Ba\'i (Log Out / Galmee)' : 'Log Out (Return to Registration)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    <span className="text-xs text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.isRead ? 'bg-sky-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Indicator for Network Status (navigator.onLine) */}
            {!isOnline ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs animate-pulse cursor-pointer"
                title={isOromo ? "Intarneetiin addaan citeera: Qabiyyee kuufame (cached) qofatu banama." : "Connection lost: Only cached lesson videos and notes remain accessible."}
                onClick={() => {
                  setConnectionToast({
                    visible: true,
                    status: 'offline',
                    message: isOromo ? 'Intarneetiin addaan citeera (Offline)' : 'Connection Lost (Offline Mode)',
                    subMessage: isOromo
                      ? 'Qabiyyee fiidiyoo fi nootiiwwan kanaan dura buufaman (cached) qofatu banama.'
                      : 'Only cached lesson videos, notes, and downloaded content remain accessible.',
                  });
                }}
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden xs:inline">{isOromo ? 'Offline (Kuusaa Qofa)' : 'Offline (Cached Only)'}</span>
              </div>
            ) : (
              <div
                className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80"
                title="Online: Workbox Service Worker sync active"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{isOromo ? 'Online (Syncd)' : 'Online (Sync)'}</span>
              </div>
            )}

            {/* Share App Button (Accessible to Admin & Students) */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors shadow-xs"
              title={isOromo ? 'Appii kana barattootaaf qoodaa' : 'Share this app with students'}
            >
              <Share2 className="w-3.5 h-3.5 text-sky-700" />
              <span className="hidden sm:inline">{isOromo ? 'Qoodi' : 'Share'}</span>
            </button>

            {/* PWA Android Install Button (Visible on mobile & desktop) */}
            <PWAInstallButton isOromo={isOromo} className="flex" />

            {/* Exit Admin Mode button: STRICTLY shown only when verified as Admin */}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setUserRole('student');
                  setSelectedLesson(null);
                  setCurrentTab('catalog');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm ring-2 ring-amber-400/40 transition-colors whitespace-nowrap shrink-0"
                title={isOromo ? "Gara ilaalcha barataatti deebi'i" : "Return to Student View"}
              >
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>{isOromo ? "Gara Barataatti Deebi'i" : 'Exit to Student View'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Network Status Toast Notification */}
      {connectionToast && connectionToast.visible && (
        <aside
          role="status"
          aria-live="polite"
          className={`fixed top-18 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] sm:w-auto p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-2 flex items-start gap-3 ${
            connectionToast.status === 'offline'
              ? 'bg-amber-950/95 text-amber-50 border-amber-500/60 shadow-amber-950/30'
              : 'bg-emerald-950/95 text-emerald-50 border-emerald-500/60 shadow-emerald-950/30'
          }`}
        >
          <div
            className={`p-2 rounded-xl shrink-0 ${
              connectionToast.status === 'offline'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30'
            }`}
          >
            {connectionToast.status === 'offline' ? (
              <WifiOff className="w-5 h-5" />
            ) : (
              <Wifi className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black tracking-wide">
                {connectionToast.message}
              </h4>
              <button
                onClick={() => setConnectionToast(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded-md transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
              {connectionToast.subMessage}
            </p>
          </div>
        </aside>
      )}

      {/* Admin Owner Verification Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={() => {
          setUserRole('admin');
          setSelectedLesson(null);
          setCurrentTab('admin-dashboard');
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </header>
  );
};

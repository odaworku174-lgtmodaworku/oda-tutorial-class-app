import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Chapter, Lesson } from '../../types';
import { PaymentApprovals } from './PaymentApprovals';
import { ContentManager } from './ContentManager';
import { StudentRoster } from './StudentRoster';
import { QuestionBankManager } from './QuestionBankManager';
import { NotificationBroadcaster } from './NotificationBroadcaster';
import { ReportsAnalytics } from './ReportsAnalytics';
import { PaymentSettingsManager } from './PaymentSettingsManager';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  CreditCard,
  Bell,
  HelpCircle,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles,
  DollarSign,
} from 'lucide-react';

interface AdminDashboardProps {
  onPreviewLesson: (lesson: Lesson, subject: Subject, chapter: Chapter) => void;
  initialTab?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onPreviewLesson, initialTab }) => {
  const { payments, allStudents, subjects, chapters } = useApp();
  const [activeAdminTab, setActiveAdminTab] = useState<string>(initialTab || 'overview');

  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const approvedPayments = payments.filter(p => p.status === 'Approved');
  const totalETB = approvedPayments.reduce((acc, p) => acc + p.amountETB, 0);

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
            <span>ADMINISTRATIVE CONTROL PANEL</span>
            <span>·</span>
            <span>N&T SOFTWARE & MR. ODA</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Educational System Operations & Governance
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Manage course curriculum hierarchy (Grade → Subject → Chapter → Lesson), verify manual payment screenshots, monitor student progress, and publish exam questions.
          </p>
        </div>

        {pendingPayments.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
            <div className="text-xs">
              <span className="font-bold text-amber-300 block">{pendingPayments.length} Verifications Pending</span>
              <button
                onClick={() => setActiveAdminTab('payments')}
                className="text-white underline hover:text-amber-200 font-medium mt-0.5 inline-block"
              >
                Review submissions now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Sub-Nav Segmented Controls */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('payments')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'payments'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          <span>Payment Approvals</span>
          {pendingPayments.length > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
              {pendingPayments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('content')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'content'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Curriculum & Lessons</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('students')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'students'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-600" />
          <span>Student Roster</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('questions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'questions'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>Question Bank</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('broadcast')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'broadcast'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-rose-600" />
          <span>Push Broadcaster</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('pricing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'pricing'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Payment & Pricing Settings</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeAdminTab === 'reports'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
          <span>Reports & Financials</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Pending Approvals</span>
              <div className="text-2xl font-bold text-amber-600 font-mono-numbers mt-1">
                {pendingPayments.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Awaiting receipt check</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Revenue Cleared</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
                {totalETB.toLocaleString()} ETB
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Verified bank transactions</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Published Curriculum</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
                {subjects.length} Subjects
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">{totalLessons} Video & Note Lessons</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Active Students</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-1">
                {allStudents.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Grade 9–12 & University</span>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveAdminTab('payments')}
              className="p-5 text-left bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-xs transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Payment Verification Desk
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review submitted bank transaction screenshots, verify reference numbers, and approve course access.
              </p>
            </button>

            <button
              onClick={() => setActiveAdminTab('content')}
              className="p-5 text-left bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-xs transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Content & Lesson Manager
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add video lessons, write structured academic notes, format concept steps, and attach downloadable PDFs.
              </p>
            </button>

            <button
              onClick={() => setActiveAdminTab('broadcast')}
              className="p-5 text-left bg-white rounded-xl border border-slate-200 hover:border-sky-500 hover:shadow-xs transition-all space-y-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Broadcast Push Notification
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dispatch alerts for new lessons, upcoming mock exams, and national syllabus announcements.
              </p>
            </button>
          </div>

          {/* Pending Submissions Quick Preview if any */}
          {pendingPayments.length > 0 && (
            <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Recent Submissions Requiring Attention
                  </h3>
                </div>
                <button
                  onClick={() => setActiveAdminTab('payments')}
                  className="text-xs font-bold text-amber-800 hover:underline"
                >
                  View All Submissions
                </button>
              </div>

              <div className="divide-y divide-amber-200/60 text-xs">
                {pendingPayments.slice(0, 3).map(p => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{p.studentName}</span>
                      <span className="text-slate-500 ml-2">requested {p.subjectTitle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">{p.amountETB} ETB</span>
                      <button
                        onClick={() => setActiveAdminTab('payments')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'payments' && <PaymentApprovals />}
      {activeAdminTab === 'content' && <ContentManager onPreviewLesson={onPreviewLesson} />}
      {activeAdminTab === 'students' && <StudentRoster />}
      {activeAdminTab === 'questions' && <QuestionBankManager />}
      {activeAdminTab === 'broadcast' && <NotificationBroadcaster />}
      {activeAdminTab === 'pricing' && <PaymentSettingsManager />}
      {activeAdminTab === 'reports' && <ReportsAnalytics />}
    </div>
  );
};

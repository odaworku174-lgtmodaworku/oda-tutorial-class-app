import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CreditCard,
  Users,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Clock,
  Sparkles,
  AlertTriangle,
  UserCheck,
  UserX,
  BookOpen,
} from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const { allStudents, subjects, chapters, payments, language } = useApp();
  const isOromo = language === 'om';

  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const approvedPayments = payments.filter(p => p.status === 'Approved');
  const rejectedPayments = payments.filter(p => p.status === 'Rejected');

  const totalRevenueETB = approvedPayments.reduce((acc, p) => acc + (p.amountETB || 0), 0);
  const totalRevenueUSD = approvedPayments.reduce((acc, p) => acc + (p.amountUSD || 0), 0);

  // Student metrics
  const totalStudents = allStudents.length;
  const premiumStudents = allStudents.filter(
    s => (s.enrolledSubjectIds && s.enrolledSubjectIds.length > 0) || s.hasAllSubjectsAccess
  ).length;
  const freeStudents = totalStudents - premiumStudents;

  // Purchases breakdown
  const packagePurchases = approvedPayments.filter(p => p.purchaseType === 'all_subjects_package').length;
  const individualPurchases = approvedPayments.filter(p => p.purchaseType !== 'all_subjects_package').length;

  // Subscription expirations
  const now = Date.now();
  const expiredSubscriptions = allStudents.filter(s => {
    if (!s.subscriptionExpiresAt) return false;
    const expTime = new Date(s.subscriptionExpiresAt).getTime();
    return !isNaN(expTime) && expTime < now;
  }).length;

  // Payment Channel Breakdown
  const channelTotals: Record<string, number> = {};
  approvedPayments.forEach(p => {
    channelTotals[p.paymentMethod] = (channelTotals[p.paymentMethod] || 0) + p.amountETB;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          {isOromo ? 'Gabaasa Bulchiinsaa & Faayinaansii' : 'Institutional Reports & Financial Analytics'}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {isOromo
            ? 'Gabaasa barattoota galmaa’anii, kaffaltii qulqullaa’e, fi kutaalee barnootaa'
            : 'Audited enrollment volume, premium subscriptions, pending verifications, and revenue collections'}
        </p>
      </div>

      {/* 9 Core Required KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* 1. Total Registered Students */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">1. Total Registered</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">{totalStudents}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified student profiles</span>
        </div>

        {/* 2. Premium Students */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">2. Premium Students</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono-numbers">{premiumStudents}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {totalStudents > 0 ? Math.round((premiumStudents / totalStudents) * 100) : 0}% conversion rate
          </span>
        </div>

        {/* 3. Free Students */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">3. Free Students</span>
            <UserX className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-700 font-mono-numbers">{freeStudents}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Preview access only</span>
        </div>

        {/* 4. Pending Payments */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">4. Pending Payments</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono-numbers">{pendingPayments.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting admin review</span>
        </div>

        {/* 5. Successful Payments */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">5. Successful Payments</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">{approvedPayments.length}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Approved & verified transactions</span>
        </div>

        {/* 6. Total Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">6. Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono-numbers">
            {totalRevenueETB.toLocaleString()} ETB
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">~${totalRevenueUSD.toLocaleString()} USD</span>
        </div>

        {/* 7. Course Purchases (Packages) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">7. All Subjects Packages</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-900 font-mono-numbers">{packagePurchases}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Full grade bundle sales</span>
        </div>

        {/* 8. Individual Subject Purchases */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">8. Individual Subject Sales</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-900 font-mono-numbers">{individualPurchases}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Single subject enrollments</span>
        </div>

        {/* 9. Subscription Expirations */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">9. Expired Subscriptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono-numbers">{expiredSubscriptions}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Access revoked due to duration</span>
        </div>
      </div>

      {/* Visual Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Gateway Shares */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Revenue Collections by Gateway</h3>
          <div className="space-y-3">
            {Object.entries(channelTotals).map(([method, amount]) => {
              const share = totalRevenueETB > 0 ? Math.round((amount / totalRevenueETB) * 100) : 0;
              return (
                <div key={method} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{method}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {amount.toLocaleString()} ETB ({share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-sky-600 h-2 rounded-full transition-all" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Student Distribution by Grade Level</h3>
          <div className="space-y-3">
            {(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Freshman Program'] as const).map(grade => {
              const count = allStudents.filter(s => s.grade === grade || (grade === 'Freshman Program' && s.grade === 'Freshman University')).length;
              const share = allStudents.length > 0 ? Math.round((count / allStudents.length) * 100) : 0;

              return (
                <div key={grade} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700">{grade}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {count} Students ({share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verified Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Cleared Revenue Transactions</h3>
          <span className="text-xs text-slate-500 font-mono-numbers">
            {approvedPayments.length} Approved Payments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Receipt / Ref</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Course / Package</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date Cleared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {approvedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                    No approved payments in ledger yet.
                  </td>
                </tr>
              ) : (
                approvedPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono font-bold text-sky-700">{p.referenceNumber}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{p.studentName}</td>
                    <td className="px-5 py-3 text-slate-600">{p.subjectTitle}</td>
                    <td className="px-5 py-3">{p.paymentMethod}</td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{p.amountETB} ETB</td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {p.verifiedAt || p.submittedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

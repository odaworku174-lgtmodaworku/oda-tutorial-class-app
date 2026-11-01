import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentSubmission, GradeLevel } from '../../types';
import {
  User,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ShieldCheck,
  Eye,
  X,
  Phone,
  Mail,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export const StudentProfileView: React.FC = () => {
  const { currentStudent, setCurrentStudent, payments, subjects, logoutStudent, language } = useApp();
  const isOromo = language === 'om';
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  // Filter payments belonging to current student
  const studentPayments = payments.filter(p => p.studentId === currentStudent.id);

  const handleGradeChange = (newGrade: GradeLevel) => {
    setCurrentStudent(prev => ({ ...prev, grade: newGrade }));
  };

  return (
    <div className="space-y-8">
      {/* Student Account Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-2xl border border-sky-200">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentStudent.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  Active Student
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentStudent.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {currentStudent.phone}
                </span>
                {currentStudent.schoolName && (
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    🏫 {currentStudent.schoolName}
                  </span>
                )}
                {currentStudent.cityOrRegion && (
                  <span className="flex items-center gap-1 text-slate-500">
                    📍 {currentStudent.cityOrRegion}
                  </span>
                )}
                {currentStudent.stream && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    {currentStudent.stream}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Registered: {currentStudent.registrationDate}
                </span>
              </div>
            </div>
          </div>

          {/* Grade Selector & Logout */}
          <div className="flex flex-col sm:items-end gap-2.5">
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-xs text-slate-500 font-medium">Target Academic Level:</span>
              <select
                value={currentStudent.grade}
                onChange={e => handleGradeChange(e.target.value as GradeLevel)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Freshman University">Freshman University</option>
              </select>
            </div>

            <button
              onClick={() => logoutStudent()}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isOromo ? 'Herrega Cufi (Log Out)' : 'Log Out Account'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400 block">Enrolled Courses</span>
            <span className="text-base font-bold text-slate-900 font-mono-numbers">
              {currentStudent.enrolledSubjectIds.length} Subjects
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Pending Verifications</span>
            <span className="text-base font-bold text-slate-900 font-mono-numbers">
              {currentStudent.pendingSubjectIds.length}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Mock Quizzes Attempted</span>
            <span className="text-base font-bold text-slate-900 font-mono-numbers">
              {currentStudent.quizAttempts.length} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Payment History & Manual Verification Receipts */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payment & Verification History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review course payment slips and administrator verification statuses
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono-numbers">
            {studentPayments.length} Records
          </span>
        </div>

        {studentPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No payment verification requests recorded for this account.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Course / Subject</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment Channel</th>
                  <th className="px-5 py-3">Reference Number</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Admin Notes</th>
                  <th className="px-5 py-3">Receipt Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>{payment.subjectTitle}</div>
                      <span className="text-[11px] text-slate-400">{payment.grade}</span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {payment.amountETB} ETB
                      <span className="text-[10px] text-slate-400 block font-normal font-sans">
                        (${payment.amountUSD} USD)
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-600">
                      {payment.referenceNumber}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {payment.submittedAt}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          payment.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : payment.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {payment.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {payment.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {payment.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs text-[11px]">
                      {payment.adminNotes || '—'}
                      {payment.verifiedAt && (
                        <span className="text-[10px] text-slate-400 block">
                          Verified at {payment.verifiedAt}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedReceiptUrl(payment.screenshotUrl)}
                        className="flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-semibold"
                      >
                        <Eye className="w-3 h-3" /> View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Image Modal */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-800">Uploaded Payment Receipt Proof</span>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={selectedReceiptUrl}
                alt="Payment proof slip"
                className="max-h-[60vh] object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentSubmission, PaymentStatus } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const PaymentApprovals: React.FC = () => {
  const { payments, approvePayment, rejectPayment } = useApp();
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectPayment, setInspectPayment] = useState<PaymentSubmission | null>(null);
  const [rejectReasonModalPayment, setRejectReasonModalPayment] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Transaction reference number not found in bank system.');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  const filteredPayments = payments.filter(p => {
    const matchesFilter = filterStatus === 'All' || p.status === filterStatus;
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = payments.filter(p => p.status === 'Pending').length;

  const handleApprove = (payment: PaymentSubmission) => {
    approvePayment(payment.id, 'Verified and approved by Administrator Mr. Oda.');
    setActionSuccessNotice(`Access granted for ${payment.studentName} to "${payment.subjectTitle}".`);
    setInspectPayment(null);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  const handleConfirmReject = () => {
    if (!rejectReasonModalPayment) return;
    rejectPayment(rejectReasonModalPayment.id, rejectionReason);
    setActionSuccessNotice(`Payment rejected for ${rejectReasonModalPayment.studentName}.`);
    setRejectReasonModalPayment(null);
    setInspectPayment(null);
    setTimeout(() => setActionSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Payment Verification Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual receipt verification for student course enrollment approval
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingCount} Pending Verification Requests</span>
          </div>
        )}
      </div>

      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
              {status === 'Pending' && pendingCount > 0 && (
                <span className="ml-1.5 text-[10px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-mono">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student or ref number..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payment submissions match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Student Details</th>
                  <th className="px-5 py-3">Requested Course</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Channel & Ref</th>
                  <th className="px-5 py-3">Date Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{payment.studentName}</div>
                      <div className="text-[11px] text-slate-400">{payment.studentEmail}</div>
                      <div className="text-[11px] text-slate-400">{payment.studentPhone}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{payment.subjectTitle}</div>
                      <span className="text-[11px] text-slate-400">{payment.grade}</span>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">
                      {payment.amountETB} ETB
                      <span className="text-[10px] text-slate-400 block font-normal font-sans">
                        (${payment.amountUSD})
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-800">{payment.paymentMethod}</span>
                      <span className="font-mono text-[11px] text-slate-500 block">
                        {payment.referenceNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {payment.submittedAt}
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
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectPayment(payment)}
                          className="flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Slip
                        </button>

                        {payment.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payment)}
                              className="px-2.5 py-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded text-xs font-semibold shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectReasonModalPayment(payment)}
                              className="px-2 py-1 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Screenshot & Full Review Modal */}
      {inspectPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verification Inspection</h3>
                <span className="text-xs text-slate-500">
                  {inspectPayment.studentName} · {inspectPayment.subjectTitle}
                </span>
              </div>
              <button
                onClick={() => setInspectPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Slip Visual */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Uploaded Receipt Slip:</span>
                <div className="bg-slate-900 rounded-lg p-2 flex items-center justify-center max-h-72 overflow-hidden border border-slate-200">
                  <img
                    src={inspectPayment.screenshotUrl}
                    alt="Receipt slip preview"
                    className="max-h-68 object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student:</span>
                    <strong className="text-slate-800">{inspectPayment.studentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800">{inspectPayment.studentEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="text-slate-800">{inspectPayment.studentPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Channel:</span>
                    <span className="font-semibold text-slate-800">{inspectPayment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference Number:</span>
                    <span className="font-mono font-bold text-sky-700">{inspectPayment.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Transferred:</span>
                    <span className="font-mono font-bold text-slate-900">{inspectPayment.amountETB} ETB (${inspectPayment.amountUSD})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted At:</span>
                    <span className="font-mono text-slate-600">{inspectPayment.submittedAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-bold text-slate-800">{inspectPayment.status}</span>
                  </div>
                </div>

                {inspectPayment.adminNotes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                    <strong className="block text-[11px] mb-0.5">Existing Admin Note:</strong>
                    {inspectPayment.adminNotes}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Approving unlocks course chapters for this student immediately.
              </span>
              <div className="flex items-center gap-2">
                {inspectPayment.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        setRejectReasonModalPayment(inspectPayment);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Reject Submission
                    </button>
                    <button
                      onClick={() => handleApprove(inspectPayment)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                    >
                      Approve & Unlock Access
                    </button>
                  </>
                )}
                {inspectPayment.status !== 'Pending' && (
                  <button
                    onClick={() => setInspectPayment(null)}
                    className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Note Dialog */}
      {rejectReasonModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Reject Payment Verification</span>
            </div>
            <p className="text-xs text-slate-600">
              Provide feedback for {rejectReasonModalPayment.studentName}. This note will be shown on their dashboard so they can rectify the payment slip.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectReasonModalPayment(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeLevel, UserNotification } from '../../types';
import {
  Bell,
  Send,
  CheckCircle2,
  Users,
  Sparkles,
  Radio,
  Clock,
} from 'lucide-react';

const NOTIFICATION_TEMPLATES = [
  {
    title: 'New Video Lesson Available',
    message: 'A brand-new video tutorial and concept breakdown have been published in your curriculum.',
    target: 'All' as const,
  },
  {
    title: 'National Entrance Exam Mock Test Released',
    message: 'The timed full-length practice exam is now open. Test your speed and problem-solving readiness.',
    target: 'Grade 12' as const,
  },
  {
    title: 'University Midterm Preparation Workshop',
    message: 'Freshman Applied Calculus I Chapter 1 review notes and formula sheet are ready for download.',
    target: 'Freshman University' as const,
  },
];

export const NotificationBroadcaster: React.FC = () => {
  const { notifications, broadcastNotification } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGrade, setTargetGrade] = useState<GradeLevel | 'All'>('All');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    broadcastNotification(title.trim(), message.trim(), targetGrade);
    setSentSuccess(true);
    setTitle('');
    setMessage('');

    setTimeout(() => {
      setSentSuccess(false);
    }, 4000);
  };

  const handleApplyTemplate = (tmpl: typeof NOTIFICATION_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setTargetGrade(tmpl.target);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Push Notification Broadcaster</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Send real-time alerts and announcements to student mobile and web applications
        </p>
      </div>

      {sentSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Broadcast successfully delivered to active student devices!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Compose Broadcast Notification</h3>

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Student Audience
              </label>
              <select
                value={targetGrade}
                onChange={e => setTargetGrade(e.target.value as GradeLevel | 'All')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">All Registered Students (Broad Distribution)</option>
                <option value="Grade 9">Grade 9 Students Only</option>
                <option value="Grade 10">Grade 10 Students Only</option>
                <option value="Grade 11">Grade 11 Students Only</option>
                <option value="Grade 12">Grade 12 (Entrance Exam Candidates)</option>
                <option value="Freshman University">Freshman University Students</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notification Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. New Video Lesson Released in Grade 12 Calculus"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notification Body / Content *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter detailed update, exam reminder, or curriculum notice..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <span className="font-semibold text-slate-500 block mb-1.5 text-[11px]">
                Quick Notice Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {NOTIFICATION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition-colors"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Push Notification</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview & Recent (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Notification Center Stream
            </h4>
            <p className="text-xs text-slate-500">
              Active alerts currently appearing on student devices
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.map(n => (
                <div key={n.id} className="pt-2.5 first:pt-0 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">{n.message}</p>
                  {n.targetGrade && (
                    <span className="text-[10px] text-sky-700 font-mono mt-1 inline-block">
                      Audience: {n.targetGrade}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

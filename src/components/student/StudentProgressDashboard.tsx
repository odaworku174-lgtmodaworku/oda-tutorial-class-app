import React from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Chapter, Lesson } from '../../types';
import {
  Trophy,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface StudentProgressDashboardProps {
  onSelectLesson: (lesson: Lesson, subject: Subject, chapter: Chapter) => void;
  onBrowseCourses: () => void;
}

export const StudentProgressDashboard: React.FC<StudentProgressDashboardProps> = ({
  onSelectLesson,
  onBrowseCourses,
}) => {
  const { currentStudent, subjects, chapters } = useApp();

  const enrolledSubjects = subjects.filter(s =>
    currentStudent.enrolledSubjectIds.includes(s.id)
  );

  // Overall Stats
  const totalCompletedLessons = currentStudent.completedLessonIds.length;
  const attempts = currentStudent.quizAttempts || [];
  const averageQuizScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;
  const totalPassedQuizzes = attempts.filter(a => a.passed).length;

  return (
    <div className="space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Student Academic Dashboard</span>
            <span>·</span>
            <span className="text-sky-700 font-semibold">{currentStudent.grade}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Welcome back, {currentStudent.name}
          </h1>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Track your curriculum progression, review past examination results, and maintain your daily preparation schedule.
          </p>
        </div>

        <button
          onClick={onBrowseCourses}
          className="self-start md:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>Explore All Subjects</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Metric KPI Strip (Section 0.Legibility & Frontend Constitution: Tabular Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Unlocked Courses</span>
            <BookOpen className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {enrolledSubjects.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {currentStudent.pendingSubjectIds.length > 0
              ? `${currentStudent.pendingSubjectIds.length} pending review`
              : 'All enrollments verified'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Lessons Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {totalCompletedLessons}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Video & note milestones
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Average Exam Score</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {averageQuizScore}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {attempts.length} mock attempts
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">Exams Passed</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {totalPassedQuizzes} / {attempts.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            &gt;= 70% threshold
          </span>
        </div>
      </div>

      {/* Enrolled Courses Progress Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Enrolled Subject Pathways</h2>
          <span className="text-xs text-slate-500">{enrolledSubjects.length} Active Courses</span>
        </div>

        {enrolledSubjects.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Enrolled Courses Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Browse our course catalog, view free lesson previews, and submit your receipt to unlock full curriculum access.
            </p>
            <button
              onClick={onBrowseCourses}
              className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors"
            >
              Browse Curriculum
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledSubjects.map(sub => {
              const subChapters = chapters.filter(c => c.subjectId === sub.id && c.isActive);
              const allSubLessons: Lesson[] = [];
              subChapters.forEach(c => allSubLessons.push(...c.lessons));
              
              const completedInSub = allSubLessons.filter(l =>
                currentStudent.completedLessonIds.includes(l.id)
              ).length;
              const subPercent =
                allSubLessons.length > 0
                  ? Math.round((completedInSub / allSubLessons.length) * 100)
                  : 0;

              const firstLesson = allSubLessons[0];
              const firstChapter = subChapters[0];

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">
                        {sub.grade} · {sub.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{sub.title}</h3>
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-700">
                      {subPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      {completedInSub} of {allSubLessons.length} lessons done
                    </span>
                    {firstLesson && firstChapter && (
                      <button
                        onClick={() => onSelectLesson(firstLesson, sub, firstChapter)}
                        className="text-sky-600 font-semibold hover:text-sky-800 transition-colors flex items-center gap-1"
                      >
                        Resume Learning <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quiz Attempt History & Analytics */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Practice Exam Performance History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified scores and timestamped quiz evaluations
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 font-mono-numbers">
            {attempts.length} Total Attempts
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No quiz attempts recorded yet. Attempt a timed quiz in any lesson to see your evaluation history here.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3">Exam Title</th>
                  <th className="px-5 py-3">Subject & Grade</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Percentage</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attempts.map(attempt => (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {attempt.quizTitle}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <div>{attempt.subjectName}</div>
                      <span className="text-[11px] text-slate-400">{attempt.grade}</span>
                    </td>
                    <td className="px-5 py-3 font-mono font-medium">
                      {attempt.score} / {attempt.totalQuestions}
                    </td>
                    <td className="px-5 py-3 font-mono font-bold">
                      {attempt.percentage}%
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          attempt.passed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {attempt.passed ? 'Passed' : 'Needs Review'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                      {attempt.completedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

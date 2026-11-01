import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentProfile, GradeLevel, Subject } from '../../types';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Key,
  ShieldCheck,
  Mail,
  Phone,
  BookOpen,
  Trophy,
  X,
} from 'lucide-react';

export const StudentRoster: React.FC = () => {
  const { allStudents, subjects, toggleStudentSubjectAccess, grantStudentAccess } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<GradeLevel | 'All'>('All');
  const [managingAccessStudent, setManagingAccessStudent] = useState<StudentProfile | null>(null);

  const filteredStudents = allStudents.filter(stu => {
    const matchesGrade = filterGrade === 'All' || stu.grade === filterGrade;
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.phone.includes(searchQuery);
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Enrollment & Access Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student accounts, track academic progress, and manually grant or revoke course access
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono-numbers">
          {allStudents.length} Registered Students
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Grade tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto w-full sm:w-auto">
          {(['All', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Freshman University'] as (GradeLevel | 'All')[]).map(grade => (
            <button
              key={grade}
              onClick={() => setFilterGrade(grade)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filterGrade === grade ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {grade}
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
            placeholder="Search student by name/email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Grade Level</th>
                <th className="px-5 py-3">Enrolled Subjects</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Quiz Average</th>
                <th className="px-5 py-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map(student => {
                const studentAttempts = student.quizAttempts || [];
                const avg =
                  studentAttempts.length > 0
                    ? Math.round(
                        studentAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                          studentAttempts.length
                      )
                    : null;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div>{student.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal font-mono">
                            ID: {student.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-700">{student.email}</div>
                      <span className="text-[11px] text-slate-400">{student.phone}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {student.grade}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {student.enrolledSubjectIds.length}
                        </span>
                        <span className="text-slate-400">Courses Unlocked</span>
                      </div>
                      {student.pendingSubjectIds.length > 0 && (
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          ({student.pendingSubjectIds.length} pending review)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono">
                      {student.completedLessonIds.length} lessons
                    </td>
                    <td className="px-5 py-3">
                      {avg !== null ? (
                        <span className="font-bold text-slate-900 font-mono-numbers">
                          {avg}%
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No exams yet</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setManagingAccessStudent(student)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors ml-auto"
                      >
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        <span>Manage Access</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Access Permissions Modal */}
      {managingAccessStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Course Permissions: {managingAccessStudent.name}
                </h3>
                <span className="text-xs text-slate-500">{managingAccessStudent.email} · {managingAccessStudent.grade}</span>
              </div>
              <button
                onClick={() => setManagingAccessStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Toggle access permissions below or grant the entire Grade package. All actions are recorded with an immutable audit log.
            </p>

            {/* Quick All Subjects Grant */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-indigo-950 block">
                  All Subjects Package ({managingAccessStudent.grade})
                </span>
                <span className="text-[11px] text-indigo-700">
                  {managingAccessStudent.hasAllSubjectsAccess
                    ? 'Student currently has full package access'
                    : 'Grant complete bundle for this grade'}
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const grantState = !managingAccessStudent.hasAllSubjectsAccess;
                  await grantStudentAccess(managingAccessStudent.id, {
                    allSubjects: true,
                    grant: grantState,
                    expirationDays: 180,
                  });
                  setManagingAccessStudent(prev => {
                    if (!prev) return null;
                    const gradeSubs = subjects.filter(s => s.grade === prev.grade).map(s => s.id);
                    return {
                      ...prev,
                      hasAllSubjectsAccess: grantState,
                      enrolledSubjectIds: grantState ? Array.from(new Set([...prev.enrolledSubjectIds, ...gradeSubs])) : [],
                    };
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  managingAccessStudent.hasAllSubjectsAccess
                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {managingAccessStudent.hasAllSubjectsAccess ? 'Revoke All Access' : 'Grant All Subjects'}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {subjects
                .filter(s => s.grade === managingAccessStudent.grade)
                .map(subject => {
                  const isEnrolled =
                    managingAccessStudent.hasAllSubjectsAccess ||
                    managingAccessStudent.enrolledSubjectIds.includes(subject.id);

                  return (
                    <div
                      key={subject.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{subject.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {subject.grade} · {subject.code} · {subject.priceETB} ETB
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          const willGrant = !isEnrolled;
                          await grantStudentAccess(managingAccessStudent.id, {
                            subjectId: subject.id,
                            grant: willGrant,
                            expirationDays: 180,
                          });
                          // Refresh local reference
                          setManagingAccessStudent(prev => {
                            if (!prev) return null;
                            const newEnrolled = willGrant
                              ? [...prev.enrolledSubjectIds, subject.id]
                              : prev.enrolledSubjectIds.filter(id => id !== subject.id);
                            return { ...prev, enrolledSubjectIds: newEnrolled };
                          });
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                          isEnrolled
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                      >
                        {isEnrolled ? 'Access Granted (Revoke)' : 'Grant Access'}
                      </button>
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setManagingAccessStudent(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

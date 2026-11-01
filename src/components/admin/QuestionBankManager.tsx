import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuizQuestion, DifficultyLevel, Subject, Chapter } from '../../types';
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Filter,
  Clock,
  Layers,
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const { subjects, chapters, updateLesson } = useApp();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [targetSubjectId, setTargetSubjectId] = useState(subjects[0]?.id || '');
  const subjectChapters = chapters.filter(c => c.subjectId === targetSubjectId);
  const [targetChapterId, setTargetChapterId] = useState(subjectChapters[0]?.id || '');
  const [targetLessonId, setTargetLessonId] = useState(subjectChapters[0]?.lessons[0]?.id || '');

  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [explanation, setExplanation] = useState('');

  // Collect all questions across chapters & lessons
  const allQuestions: { question: QuizQuestion; lessonTitle: string; chapterId: string; lessonId: string }[] = [];
  chapters.forEach(chap => {
    chap.lessons.forEach(les => {
      les.quizQuestions?.forEach(q => {
        allQuestions.push({
          question: q,
          lessonTitle: les.title,
          chapterId: chap.id,
          lessonId: les.id,
        });
      });
    });
  });

  const filteredQuestions = allQuestions.filter(item => {
    const matchesSubject = selectedSubjectId === 'All' || item.question.subjectId === selectedSubjectId;
    const matchesDiff = selectedDifficulty === 'All' || item.question.difficulty === selectedDifficulty;
    const matchesSearch =
      item.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesDiff && matchesSearch;
  });

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optA.trim() || !optB.trim()) return;

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: questionText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctOptionIndex: correctIndex,
      explanation: explanation.trim() || 'Refer to the chapter lecture theorems and derivations.',
      difficulty,
      subjectId: targetSubjectId,
      chapterId: targetChapterId,
    };

    // Find current lesson and append question
    const targetChapter = chapters.find(c => c.id === targetChapterId);
    const targetLesson = targetChapter?.lessons.find(l => l.id === targetLessonId);
    if (targetChapter && targetLesson) {
      updateLesson(targetChapter.id, targetLesson.id, {
        quizQuestions: [...(targetLesson.quizQuestions || []), newQ],
      });
    }

    setIsAddModalOpen(false);
    setQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
  };

  const handleDeleteQuestion = (chapterId: string, lessonId: string, questionId: string) => {
    const chap = chapters.find(c => c.id === chapterId);
    const les = chap?.lessons.find(l => l.id === lessonId);
    if (chap && les) {
      updateLesson(chap.id, les.id, {
        quizQuestions: les.quizQuestions.filter(q => q.id !== questionId),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quiz & Question Bank Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Multiple Choice Questions (MCQs), difficulty levels, and automated answer explanations
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New MCQ Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.grade})
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search questions or lessons..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
            No questions match your current filters. Click "Add New MCQ Question" to create one.
          </div>
        ) : (
          filteredQuestions.map(({ question: q, lessonTitle, chapterId, lessonId }) => (
            <div
              key={q.id}
              className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Lesson: {lessonTitle}</span>
                </div>

                <button
                  onClick={() => handleDeleteQuestion(chapterId, lessonId, q.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm font-semibold text-slate-900">{q.question}</p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctOptionIndex;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Solution key */}
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/70">
                <span className="font-semibold text-slate-800 block text-[11px]">Explanation:</span>
                {q.explanation}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Question to Question Bank</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Subject</label>
                  <select
                    value={targetSubjectId}
                    onChange={e => {
                      setTargetSubjectId(e.target.value);
                      const subChaps = chapters.filter(c => c.subjectId === e.target.value);
                      if (subChaps[0]) {
                        setTargetChapterId(subChaps[0].id);
                        if (subChaps[0].lessons[0]) setTargetLessonId(subChaps[0].lessons[0].id);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Lesson</label>
                  <select
                    value={targetLessonId}
                    onChange={e => setTargetLessonId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  >
                    {chapters
                      .filter(c => c.subjectId === targetSubjectId)
                      .flatMap(c => c.lessons)
                      .map(l => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Prompt *</label>
                <textarea
                  rows={2}
                  required
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Enter the problem statement or multiple choice question..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700">Options (Select radio for correct answer) *</label>
                {[
                  { label: 'A', val: optA, setVal: setOptA },
                  { label: 'B', val: optB, setVal: setOptB },
                  { label: 'C', val: optC, setVal: setOptC },
                  { label: 'D', val: optD, setVal: setOptD },
                ].map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="w-4 h-4 text-sky-600"
                    />
                    <span className="font-mono font-bold text-slate-500 w-4">{item.label}.</span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={e => item.setVal(e.target.value)}
                      placeholder={`Choice ${item.label}`}
                      className="flex-1 px-2.5 py-1.5 border rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-2.5 py-1.5 border rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Step-by-Step Explanation</label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Detailed derivation or reasoning for why the chosen option is correct..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

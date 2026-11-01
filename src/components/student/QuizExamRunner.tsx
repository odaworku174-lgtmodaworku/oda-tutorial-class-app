import React, { useState, useEffect } from 'react';
import { QuizQuestion, Lesson, Subject } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, CheckCircle2, XCircle, AlertCircle, Bookmark, ArrowRight, ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

interface QuizExamRunnerProps {
  lesson: Lesson;
  subject: Subject;
  onFinish?: () => void;
}

export const QuizExamRunner: React.FC<QuizExamRunnerProps> = ({ lesson, subject, onFinish }) => {
  const { recordQuizAttempt } = useApp();
  const questions: QuizQuestion[] = lesson.quizQuestions || [];

  const initialDurationMinutes = lesson.examTimeMinutes || 15;
  const [secondsRemaining, setSecondsRemaining] = useState(initialDurationMinutes * 60);
  const [isExamActive, setIsExamActive] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTimeSpent, setFinalTimeSpent] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!isExamActive || hasSubmitted) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExamActive, hasSubmitted]);

  const handleStartExam = () => {
    setIsExamActive(true);
    setHasSubmitted(false);
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentIndex(0);
    setSecondsRemaining(initialDurationMinutes * 60);
    setStartTime(Date.now());
  };

  const handleSelectOption = (optionIndex: number) => {
    if (hasSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const toggleFlag = (index: number) => {
    setFlaggedQuestions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmitExam = () => {
    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : initialDurationMinutes * 60 - secondsRemaining;
    setFinalTimeSpent(elapsed);
    setIsExamActive(false);
    setHasSubmitted(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = percentage >= 70;

    recordQuizAttempt({
      quizTitle: `${lesson.title} Practice Exam`,
      subjectName: subject.title,
      grade: lesson.grade,
      score: correctCount,
      totalQuestions: total,
      percentage,
      passed,
      timeSpentSeconds: elapsed,
      userAnswers,
    });
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-800">No Exam Questions Added Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          The administrator or instructor has not published quiz questions for this lesson yet. Check back soon!
        </p>
      </div>
    );
  }

  // Initial State: Intro Screen
  if (!isExamActive && !hasSubmitted) {
    return (
      <div className="p-8 bg-white rounded-xl border border-slate-200">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center mx-auto border border-sky-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Timed Practice Exam Mode</h3>
            <p className="text-xs text-slate-500 mt-1">
              Exam-focused assessment for {lesson.title}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block">Questions</span>
              <span className="font-bold text-slate-800 text-sm font-mono-numbers">{questions.length} MCQs</span>
            </div>
            <div>
              <span className="text-slate-400 block">Time Limit</span>
              <span className="font-bold text-slate-800 text-sm font-mono-numbers">{initialDurationMinutes} Minutes</span>
            </div>
            <div>
              <span className="text-slate-400 block">Passing Score</span>
              <span className="font-bold text-slate-800 text-sm font-mono-numbers">70%</span>
            </div>
          </div>

          <div className="text-left p-4 bg-sky-50/50 rounded-lg border border-sky-100 text-xs text-slate-700 space-y-1.5">
            <div className="font-semibold text-sky-900">Exam Instructions:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Each question has four choices with only one correct answer.</li>
              <li>You can flag difficult questions to revisit them before submitting.</li>
              <li>Timer will auto-submit answers when the clock reaches 00:00.</li>
              <li>Instant grading and step-by-step explanations appear upon completion.</li>
            </ul>
          </div>

          <button
            onClick={handleStartExam}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-colors"
          >
            Start Timed Exam
          </button>
        </div>
      </div>
    );
  }

  // Submitted: Results Screen with Full Explanations
  if (hasSubmitted) {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOptionIndex) correctCount += 1;
    });
    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="space-y-6">
        {/* Score Banner */}
        <div className={`p-6 rounded-xl border text-center ${passed ? 'bg-emerald-50/80 border-emerald-200' : 'bg-rose-50/80 border-rose-200'}`}>
          <div className="inline-flex p-3 rounded-full mb-3 shadow-xs bg-white">
            <Trophy className={`w-8 h-8 ${passed ? 'text-emerald-600' : 'text-rose-600'}`} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {passed ? 'Exam Passed! Excellent Work' : 'Exam Completed - Needs Review'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            You scored {correctCount} out of {questions.length} questions correctly
          </p>

          <div className="inline-flex items-center gap-6 mt-4 px-6 py-2.5 bg-white/90 rounded-lg border border-slate-200/80 shadow-xs text-xs font-mono-numbers">
            <div>
              <span className="text-slate-400 block text-[11px]">Percentage</span>
              <span className="text-lg font-bold text-slate-900">{percentage}%</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[11px]">Time Taken</span>
              <span className="text-lg font-bold text-slate-900">{formatTime(finalTimeSpent)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[11px]">Result</span>
              <span className={`text-lg font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {passed ? 'PASSED' : 'RETAKE SUGGESTED'}
              </span>
            </div>
          </div>

          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={handleStartExam}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake Exam
            </button>
            {onFinish && (
              <button
                onClick={onFinish}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Continue Course
              </button>
            )}
          </div>
        </div>

        {/* Detailed Solutions Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-sm font-bold text-slate-900">Question-by-Question Solution & Analysis</h4>
            <span className="text-xs text-slate-500">{questions.length} Total Evaluated</span>
          </div>

          {questions.map((q, idx) => {
            const selectedOpt = userAnswers[idx];
            const isCorrect = selectedOpt === q.correctOptionIndex;
            const isUnanswered = selectedOpt === undefined;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-white'
                    : 'border-rose-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Difficulty: {q.difficulty}
                    </span>
                  </div>
                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Unanswered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-3 leading-relaxed">
                  {q.question}
                </p>

                <div className="space-y-1.5 mb-3">
                  {q.options.map((option, optIdx) => {
                    const isOptionCorrect = optIdx === q.correctOptionIndex;
                    const isUserChoice = optIdx === selectedOpt;

                    let optStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                    if (isOptionCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isUserChoice && !isCorrect) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{option}</span>
                        </div>
                        {isOptionCorrect && (
                          <span className="text-[11px] font-semibold text-emerald-700">Correct Answer</span>
                        )}
                        {isUserChoice && !isOptionCorrect && (
                          <span className="text-[11px] font-semibold text-rose-700">Your Answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Instructor's Explanation & Solution:</span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Exam View
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const isTimeCritical = secondsRemaining < 120;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Exam Header Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-500 font-medium">Timed Examination</span>
          <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">{lesson.title}</h3>
        </div>

        {/* Live Timer Clock */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono-numbers text-sm font-bold shadow-xs ${
            isTimeCritical
              ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatTime(secondsRemaining)}</span>
        </div>

        <button
          onClick={handleSubmitExam}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          Submit Exam
        </button>
      </div>

      <div className="p-6">
        {/* Question Palette / Navigator */}
        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-medium">
              Progress: <strong className="text-slate-900">{answeredCount}</strong> of {questions.length} answered
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> Answered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> Flagged
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-200 inline-block" /> Unanswered
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {questions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined;
              const isFlagged = flaggedQuestions[idx];
              const isCurrent = idx === currentIndex;

              let style = 'bg-slate-100 text-slate-600 border-slate-200';
              if (isAnswered) style = 'bg-sky-600 text-white border-sky-600';
              if (isFlagged) style = 'bg-amber-400 text-amber-950 border-amber-500';
              if (isCurrent) style += ' ring-2 ring-slate-900 ring-offset-1 font-bold';

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded text-xs font-mono font-medium border flex items-center justify-center transition-all ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Body */}
        {currentQuestion && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  Difficulty: {currentQuestion.difficulty}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleFlag(currentIndex)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[currentIndex] ? 'Flagged for Review' : 'Flag for Review'}</span>
              </button>
            </div>

            <p className="text-base font-semibold text-slate-900 pt-1 leading-relaxed">
              {currentQuestion.question}
            </p>

            {/* MCQ Options Radio List */}
            <div className="space-y-2 pt-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-semibold ring-1 ring-sky-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[11px] shrink-0 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-600 text-white font-bold'
                          : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Complete & Submit Exam
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

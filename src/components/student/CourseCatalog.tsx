import React, { useState, useMemo } from 'react';
import { Subject, GradeLevel, Chapter, Topic, LearningPart, Lesson } from '../../types';
import { useApp } from '../../context/AppContext';
import { PaymentModal } from './PaymentModal';
import {
  APP_LOGO_IMAGE,
  HERO_BANNER_IMAGE,
  GRADE_9_LANDSCAPE,
  GRADE_10_LANDSCAPE,
  GRADE_11_LANDSCAPE,
  GRADE_12_LANDSCAPE,
  FRESHMAN_LANDSCAPE,
  STREAM_NATURAL_SCIENCE,
  STREAM_SOCIAL_SCIENCE,
  SUBJECT_MATH_IMAGE,
  SUBJECT_PHYSICS_IMAGE,
  SUBJECT_BIOLOGY_IMAGE,
  SUBJECT_CHEMISTRY_IMAGE,
  SUBJECT_HISTORY_IMAGE,
  SUBJECT_GEOGRAPHY_IMAGE,
  SUBJECT_ECONOMICS_IMAGE,
  SUBJECT_ENGLISH_IMAGE,
  SUBJECT_PSYCHOLOGY_IMAGE,
  SUBJECT_LOGIC_IMAGE,
  CHAPTER_BANNER_1,
  CHAPTER_BANNER_2,
  CHAPTER_BANNER_3,
  CHAPTER_BANNER_4,
  CHAPTER_BANNER_5,
  CHAPTER_BANNER_6,
} from '../../data/mockData';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  Search,
  ArrowLeft,
  Play,
  FileText,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Filter,
  Check,
  Star,
  Layers,
  ArrowRight,
  Unlock,
  AlertCircle,
  Video,
} from 'lucide-react';

interface CourseCatalogProps {
  onSelectLesson: (lesson: Lesson, subject: Subject, chapter: Chapter) => void;
}

type CatalogStage = 'grades' | 'streams' | 'subjects' | 'chapters' | 'parts';

interface GradeCardConfig {
  grade: GradeLevel;
  displayTitle: string;
  image: string;
  accent: string;
  isStreamBased: boolean;
}

const GRADE_CARDS: GradeCardConfig[] = [
  {
    grade: 'Grade 9',
    displayTitle: 'Grade 9',
    image: GRADE_9_LANDSCAPE,
    accent: 'from-amber-500/80 to-amber-950/90',
    isStreamBased: false,
  },
  {
    grade: 'Grade 10',
    displayTitle: 'Grade 10',
    image: GRADE_10_LANDSCAPE,
    accent: 'from-blue-600/80 to-slate-950/90',
    isStreamBased: false,
  },
  {
    grade: 'Grade 11',
    displayTitle: 'Grade 11',
    image: GRADE_11_LANDSCAPE,
    accent: 'from-emerald-600/80 to-teal-950/90',
    isStreamBased: true,
  },
  {
    grade: 'Grade 12',
    displayTitle: 'Grade 12',
    image: GRADE_12_LANDSCAPE,
    accent: 'from-indigo-600/80 to-slate-950/90',
    isStreamBased: true,
  },
  {
    grade: 'Freshman Program',
    displayTitle: 'Freshman Program',
    image: FRESHMAN_LANDSCAPE,
    accent: 'from-purple-600/80 to-slate-950/90',
    isStreamBased: true,
  },
];

const CHAPTER_THEMES = [
  {
    gradient: 'from-blue-950/95 via-sky-900/85 to-slate-950/60',
    accent: 'bg-sky-500/30 text-sky-200 border-sky-400/30',
    cover: CHAPTER_BANNER_1,
  },
  {
    gradient: 'from-emerald-950/95 via-teal-900/85 to-slate-950/60',
    accent: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30',
    cover: CHAPTER_BANNER_2,
  },
  {
    gradient: 'from-purple-950/95 via-indigo-900/85 to-slate-950/60',
    accent: 'bg-purple-500/30 text-purple-200 border-purple-400/30',
    cover: CHAPTER_BANNER_3,
  },
  {
    gradient: 'from-amber-950/95 via-orange-900/85 to-slate-950/60',
    accent: 'bg-amber-500/30 text-amber-200 border-amber-400/30',
    cover: CHAPTER_BANNER_4,
  },
  {
    gradient: 'from-cyan-950/95 via-blue-900/85 to-slate-950/60',
    accent: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/30',
    cover: CHAPTER_BANNER_5,
  },
  {
    gradient: 'from-rose-950/95 via-red-900/85 to-slate-950/60',
    accent: 'bg-rose-500/30 text-rose-200 border-rose-400/30',
    cover: CHAPTER_BANNER_6,
  },
];

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ onSelectLesson }) => {
  const { subjects, chapters, checkSubjectAccess, language, userRole, paymentSettings } = useApp();
  const isOromo = language === 'om';

  // Navigation hierarchy: Grade -> Stream -> Subject -> Chapter -> Part
  const [stage, setStage] = useState<CatalogStage>('grades');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedStream, setSelectedStream] = useState<'Natural Science' | 'Social Science' | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccess, setFilterAccess] = useState<'all' | 'free' | 'premium'>('all');

  // Payment / Premium modal
  const [paymentModalSubject, setPaymentModalSubject] = useState<Subject | null>(null);

  // Fallback image helper
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackUrl: string) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallbackUrl;
  };

  const cleanSubjectTitle = (raw: string): string => {
    return raw.replace(/\s*\([^)]*\)/g, '').trim() || raw;
  };

  const extractChapterTopic = (rawTitle: string): string => {
    return rawTitle.replace(/^Chapter\s*\d+\s*[:\-–]\s*/i, '').trim();
  };

  const extractPartTopic = (rawTitle: string): string => {
    return rawTitle.replace(/^Part\s*\d+\s*[:\-–]\s*/i, '').trim();
  };

  // 1. Grade Selection
  const handleGradeClick = (gradeConfig: GradeCardConfig) => {
    setSelectedGrade(gradeConfig.grade);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedChapter(null);

    if (gradeConfig.isStreamBased) {
      setStage('streams');
    } else {
      setStage('subjects');
    }
  };

  // 2. Stream Selection
  const handleStreamClick = (stream: 'Natural Science' | 'Social Science') => {
    setSelectedStream(stream);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setStage('subjects');
  };

  // 3. Subject Selection -> opens Chapters
  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setStage('chapters');
  };

  // 4. Chapter Selection -> opens Parts
  const handleChapterClick = (chapter: Chapter) => {
    const isFreeChapter = chapter.chapterNumber === 1 || chapter.isFree;
    const isAccessible = isFreeChapter || checkSubjectAccess(chapter.subjectId).isUnlocked || userRole === 'admin';

    if (!isAccessible) {
      setPaymentModalSubject(selectedSubject);
      return;
    }

    setSelectedChapter(chapter);
    setStage('parts');
  };

  // 5. Part Selection -> launches Lesson Viewer
  const handlePartClick = (part: LearningPart, chapter: Chapter) => {
    if (!selectedSubject) return;

    const isSubjectUnlocked = checkSubjectAccess(selectedSubject.id).isUnlocked;
    const isFreePart = chapter.chapterNumber === 1 || chapter.isFree || part.isFreePreview;

    if (!isFreePart && !isSubjectUnlocked && userRole !== 'admin') {
      setPaymentModalSubject(selectedSubject);
      return;
    }

    onSelectLesson(part, selectedSubject, chapter);
  };

  // Navigation Jumps
  const resetToGrades = () => {
    setStage('grades');
    setSelectedGrade(null);
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const jumpToStreams = () => {
    setStage('streams');
    setSelectedStream(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const jumpToSubjects = () => {
    setStage('subjects');
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const jumpToChapters = () => {
    setStage('chapters');
    setSelectedChapter(null);
  };

  // Visible subjects for active grade & stream (Strictly hide drafts from students)
  const visibleSubjects = useMemo(() => {
    if (!selectedGrade) return [];

    let list = subjects.filter(s => {
      const isGradeMatch =
        s.grade === selectedGrade ||
        (selectedGrade === 'Freshman Program' && (s.grade === 'Freshman University' || s.grade === 'Freshman Program')) ||
        (selectedGrade === 'Freshman University' && (s.grade === 'Freshman University' || s.grade === 'Freshman Program'));
      const isPublished = userRole === 'admin' || (s.isPublished !== false && s.status !== 'draft');
      return isGradeMatch && s.isActive && isPublished;
    });

    if (selectedStream) {
      list = list.filter(s => s.stream === selectedStream || s.stream === 'General');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [subjects, selectedGrade, selectedStream, searchQuery, userRole]);

  // Chapters for active subject (ordered Chapter 1, 2, 3... and strictly published for students)
  const activeSubjectChapters = useMemo(() => {
    if (!selectedSubject) return [];
    let list = chapters
      .filter(c => {
        const isPublished = userRole === 'admin' || (c.isPublished !== false && c.status !== 'draft');
        return c.subjectId === selectedSubject.id && c.isActive && isPublished;
      })
      .sort((a, b) => (a.chapterNumber || a.order) - (b.chapterNumber || b.order));

    if (filterAccess === 'free') {
      list = list.filter(c => c.chapterNumber === 1 || c.isFree);
    } else if (filterAccess === 'premium') {
      list = list.filter(c => c.chapterNumber > 1 && !c.isFree);
    }

    return list;
  }, [chapters, selectedSubject, filterAccess, userRole]);

  // Parts for active chapter (strictly hide draft lessons from students)
  const activeChapterParts = useMemo(() => {
    if (!selectedChapter) return [];
    let partsList: LearningPart[] = [];
    if (selectedChapter.lessons && selectedChapter.lessons.length > 0) {
      partsList = selectedChapter.lessons;
    } else if (selectedChapter.topics && selectedChapter.topics.length > 0) {
      selectedChapter.topics.forEach(t => {
        if (t.parts && t.parts.length > 0) {
          partsList.push(...t.parts);
        }
      });
    }
    return partsList.filter(p => userRole === 'admin' || (p.isPublished !== false && p.status !== 'draft'));
  }, [selectedChapter, userRole]);

  const subjectAccess = selectedSubject
    ? checkSubjectAccess(selectedSubject.id)
    : { isUnlocked: false, isPending: false };

  return (
    <div className="space-y-6 pb-16">
      {/* ==================================================================== */}
      {/* 1. BREADCRUMBS & NAVIGATION BAR */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <button
            onClick={resetToGrades}
            className={`flex items-center gap-1 font-semibold hover:text-sky-600 transition-colors ${
              stage === 'grades' ? 'text-sky-700 font-bold' : 'text-slate-600'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <span>{isOromo ? 'Fuula Jalqabaa' : 'Home'}</span>
          </button>

          {selectedGrade && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button
                onClick={() => {
                  if (selectedGrade === 'Grade 11' || selectedGrade === 'Grade 12' || selectedGrade === 'Freshman Program') {
                    jumpToStreams();
                  } else {
                    jumpToSubjects();
                  }
                }}
                className={`font-semibold hover:text-sky-600 transition-colors ${
                  stage === 'streams' || (stage === 'subjects' && !selectedStream) ? 'text-sky-700 font-bold' : 'text-slate-600'
                }`}
              >
                {selectedGrade}
              </button>
            </>
          )}

          {selectedStream && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button
                onClick={jumpToSubjects}
                className={`font-semibold hover:text-sky-600 transition-colors ${
                  stage === 'subjects' ? 'text-sky-700 font-bold' : 'text-slate-600'
                }`}
              >
                {selectedStream}
              </button>
            </>
          )}

          {selectedSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <button
                onClick={jumpToChapters}
                className={`font-bold hover:text-sky-600 transition-colors max-w-[180px] sm:max-w-xs truncate ${
                  stage === 'chapters' ? 'text-sky-800' : 'text-slate-600'
                }`}
              >
                {cleanSubjectTitle(selectedSubject.title)}
              </button>
            </>
          )}

          {selectedChapter && stage === 'parts' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-sky-800">
                Chapter {selectedChapter.chapterNumber || selectedChapter.order} · {isOromo ? 'Kutaalee (Parts)' : 'Parts'}
              </span>
            </>
          )}
        </div>

        {/* Dynamic Back Button */}
        {stage !== 'grades' && (
          <button
            onClick={() => {
              if (stage === 'parts') jumpToChapters();
              else if (stage === 'chapters') jumpToSubjects();
              else if (stage === 'subjects') {
                if (selectedStream) jumpToStreams();
                else resetToGrades();
              } else if (stage === 'streams') {
                resetToGrades();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isOromo ? "Duubatti Deebi'i" : 'Back'}</span>
          </button>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 2. HOME PAGE (GRADE CARDS ARRANGED VERTICALLY TOP-TO-BOTTOM) */}
      {/* ==================================================================== */}
      {stage === 'grades' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white shadow-md border border-slate-800 p-6 sm:p-8">
            <img
              src={HERO_BANNER_IMAGE}
              alt="ODA EDUCATIONAL APP"
              onError={e => handleImageError(e, GRADE_12_LANDSCAPE)}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <img
                  src={APP_LOGO_IMAGE}
                  alt="ODA Logo"
                  className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-full shadow-lg ring-2 ring-emerald-400/30 shrink-0"
                />
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  ODA EDUCATIONAL APP
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-200 font-medium">
                {isOromo ? 'Baga nagaan dhuftan gara ODA EDUCATIONAL APP' : 'Welcome to ODA EDUCATIONAL APP'}
              </p>

              {/* Home Search Bar */}
              <div className="pt-1">
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isOromo ? 'Barbaadi...' : 'Search...'}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white/10 backdrop-blur-md text-white placeholder-slate-400 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Large Learning Cards Arranged Vertically Top-to-Bottom */}
          <div className="flex flex-col gap-6">
            {GRADE_CARDS.map(card => {
              const dynamicGradeCover = paymentSettings?.gradePackages?.[card.grade]?.coverImage || card.image;
              return (
              <div
                key={card.grade}
                onClick={() => handleGradeClick(card)}
                className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
              >
                <img
                  src={dynamicGradeCover}
                  alt={card.displayTitle}
                  onError={e => handleImageError(e, HERO_BANNER_IMAGE)}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                <div className={`absolute inset-0 bg-gradient-to-t ${card.accent} opacity-85 group-hover:opacity-90 transition-opacity`} />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
                  <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                      {card.displayTitle}
                    </h2>
                  </div>

                  <div className="shrink-0 pt-2 md:pt-0">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg group-hover:bg-sky-50 group-hover:text-sky-900 transition-all">
                      <span>{isOromo ? 'Seeni' : 'Enter'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. STREAMS VIEW (FOR GRADE 11, GRADE 12, FRESHMAN) */}
      {/* ==================================================================== */}
      {stage === 'streams' && selectedGrade && (
        <div className="space-y-6">
          <div className="pb-2 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedGrade}
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            {/* Natural Science Card */}
            <div
              onClick={() => handleStreamClick('Natural Science')}
              className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
            >
              <img
                src={STREAM_NATURAL_SCIENCE}
                alt="Natural Science"
                onError={e => handleImageError(e, SUBJECT_PHYSICS_IMAGE)}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/75 to-slate-950/40 opacity-90 group-hover:opacity-95 transition-opacity" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    NATURAL SCIENCE
                  </h2>
                </div>

                <div className="shrink-0 pt-2 md:pt-0">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg group-hover:bg-emerald-400 transition-all">
                    <span>{isOromo ? 'Explore' : 'Explore'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Social Science Card */}
            <div
              onClick={() => handleStreamClick('Social Science')}
              className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
            >
              <img
                src={STREAM_SOCIAL_SCIENCE}
                alt="Social Science"
                onError={e => handleImageError(e, SUBJECT_HISTORY_IMAGE)}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/95 via-amber-900/75 to-slate-950/40 opacity-90 group-hover:opacity-95 transition-opacity" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    SOCIAL SCIENCE
                  </h2>
                </div>

                <div className="shrink-0 pt-2 md:pt-0">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg group-hover:bg-amber-400 transition-all">
                    <span>{isOromo ? 'Explore' : 'Explore'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. SUBJECTS VIEW (CARDS ARRANGED VERTICALLY WITH ATTRACTIVE IMAGES) */}
      {/* ==================================================================== */}
      {stage === 'subjects' && selectedGrade && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-900">
              <span>{selectedGrade}</span>
              {selectedStream && (
                <>
                  <span>·</span>
                  <span className="text-sky-700">{selectedStream}</span>
                </>
              )}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isOromo ? 'Barbaadi...' : 'Search...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {visibleSubjects.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
              {isOromo ? 'Homtuu hin argamne' : 'No subjects found.'}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {visibleSubjects.map(subject => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject)}
                  className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
                >
                  <img
                    src={subject.coverImage || SUBJECT_MATH_IMAGE}
                    alt={subject.title}
                    onError={e => handleImageError(e, HERO_BANNER_IMAGE)}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-950/20 opacity-90 group-hover:opacity-95 transition-opacity" />

                  <div className="relative z-10 text-white">
                    <h2 className="font-classical-serif font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-normal drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
                      {cleanSubjectTitle(subject.title)}
                    </h2>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. CHAPTERS VIEW: HEAVY LANDSCAPE COLORED CARDS (TOP-TO-DOWN) */}
      {/* ==================================================================== */}
      {stage === 'chapters' && selectedSubject && (
        <div className="space-y-6">
          {/* Header for Selected Subject */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h1 className="font-classical-serif font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {cleanSubjectTitle(selectedSubject.title)}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterAccess('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterAccess === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Chapters
              </button>
              <button
                onClick={() => setFilterAccess('free')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterAccess === 'free' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setFilterAccess('premium')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterAccess === 'premium' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Premium
              </button>
            </div>
          </div>

          {/* HEAVY LANDSCAPE COLORED CHAPTER CARDS ARRANGED TOP-TO-BOTTOM */}
          <div className="flex flex-col gap-6">
            {activeSubjectChapters.map((chapter, idx) => {
              const theme = CHAPTER_THEMES[idx % CHAPTER_THEMES.length];
              const isFreeChapter = chapter.chapterNumber === 1 || chapter.isFree;
              const isAccessible = isFreeChapter || subjectAccess.isUnlocked || userRole === 'admin';
              const chapterCover = chapter.coverImage || theme.cover;
              const chapterNum = chapter.chapterNumber || idx + 1;
              const chapterNumberLabel = `Chapter ${chapterNum}`;
              const chapterTopic = extractChapterTopic(chapter.title);

              return (
                <div
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter)}
                  className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
                >
                  <img
                    src={chapterCover}
                    alt={chapterNumberLabel}
                    onError={e => handleImageError(e, HERO_BANNER_IMAGE)}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />

                  {/* Heavy Landscape Colored Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-90 group-hover:opacity-95 transition-opacity`} />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />

                  <div className="relative z-10 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-2 mb-2">
                      {isFreeChapter ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          Free
                        </span>
                      ) : isAccessible ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500 text-white flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>

                    <h3 className="font-classical-serif font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-normal drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
                      {chapterNumberLabel}
                    </h3>

                    {chapterTopic && chapterTopic.toLowerCase() !== chapterNumberLabel.toLowerCase() && (
                      <p className="text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow-sm pt-2 max-w-2xl">
                        {chapterTopic}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. PARTS VIEW: BEAUTIFUL LANDSCAPE CARDS (TOP-TO-DOWN) */}
      {/* ==================================================================== */}
      {stage === 'parts' && selectedChapter && selectedSubject && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-200">
            <h1 className="font-classical-serif font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {selectedChapter.chapterNumber ? `Chapter ${selectedChapter.chapterNumber}` : selectedChapter.title}
            </h1>
            {extractChapterTopic(selectedChapter.title) && (
              <p className="font-classical-serif font-serif text-xs sm:text-sm text-slate-600 mt-0.5">
                {extractChapterTopic(selectedChapter.title)}
              </p>
            )}
          </div>

          {/* PARTS ARRANGED TOP TO DOWN WITH BEAUTIFUL LANDSCAPE IMAGES */}
          <div className="flex flex-col gap-6">
            {activeChapterParts.map((part, idx) => {
              const partCover = part.videoPoster || selectedChapter.coverImage || CHAPTER_BANNER_1;
              const isFreePart = selectedChapter.chapterNumber === 1 || selectedChapter.isFree || part.isFreePreview;
              const isAccessible = isFreePart || subjectAccess.isUnlocked || userRole === 'admin';
              const partNum = part.partNumber || idx + 1;
              const partNumberLabel = `Part ${partNum}`;
              const partTopic = extractPartTopic(part.title);

              return (
                <div
                  key={part.id}
                  onClick={() => handlePartClick(part, selectedChapter)}
                  className="group relative cursor-pointer overflow-hidden aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/7] bg-slate-950 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
                >
                  <img
                    src={partCover}
                    alt={partNumberLabel}
                    onError={e => handleImageError(e, HERO_BANNER_IMAGE)}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-950/20 opacity-90 group-hover:opacity-95 transition-opacity" />

                  <div className="relative z-10 flex flex-col justify-end text-white">
                    <div className="flex items-center gap-2 mb-2">
                      {isFreePart ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          Free
                        </span>
                      ) : isAccessible ? (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500 text-white flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>

                    <h2 className="font-classical-serif font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-normal drop-shadow-[0_4px_14px_rgba(0,0,0,0.85)]">
                      {partNumberLabel}
                    </h2>

                    {partTopic && partTopic.toLowerCase() !== partNumberLabel.toLowerCase() && (
                      <p className="font-classical-serif font-serif text-xs sm:text-sm text-white/90 font-medium tracking-wide drop-shadow-sm pt-2 max-w-2xl">
                        {partTopic}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PAYMENT & PREMIUM ACCESS MODAL */}
      {/* ==================================================================== */}
      {paymentModalSubject && (
        <PaymentModal
          subject={paymentModalSubject}
          isOpen={!!paymentModalSubject}
          onClose={() => setPaymentModalSubject(null)}
        />
      )}
    </div>
  );
};

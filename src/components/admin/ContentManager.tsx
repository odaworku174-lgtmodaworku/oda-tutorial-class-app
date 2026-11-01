import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Chapter, Lesson, GradeLevel, ConceptStep, DownloadableMaterial } from '../../types';
import {
  saveUploadedVideo,
  uploadVideoToOnlineServer,
  clearAllLocalDeviceVideos,
  parseVideoSource,
  getSystemStorageStats,
  deleteServerVideo,
  SystemStorageStats,
  UploadProgressInfo,
} from '../../utils/videoHelpers';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  Play,
  FileText,
  Lightbulb,
  Download,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  BookOpen,
  Video,
  Clock,
  Sparkle,
  Upload,
  Cloud,
  HardDrive,
  Smartphone,
  RefreshCw,
  Globe,
  CheckCircle2,
  Zap,
  Gauge,
  Database,
  Server,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageSelectorModal } from '../common/ImageSelectorModal';
import { SUBJECT_MATH_IMAGE } from '../../data/mockData';

interface ContentManagerProps {
  onPreviewLesson: (lesson: Lesson, subject: Subject, chapter: Chapter) => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ onPreviewLesson }) => {
  const {
    subjects,
    chapters,
    addSubject,
    updateSubject,
    deleteSubject,
    moveSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    moveChapter,
    addLessonToChapter,
    updateLesson,
    deleteLesson,
    moveLesson,
    togglePublishStatus,
    isRealtimeConnected,
    isSyncingToServer,
    lastServerSyncTime,
    pushCurriculumToServer,
    refreshCurriculumFromServer,
    paymentSettings,
    updatePaymentSettings,
  } = useApp();

  const [activeGrade, setActiveGrade] = useState<GradeLevel>('Grade 12');
  const gradeSubjects = subjects.filter(s => s.grade === activeGrade);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(gradeSubjects[0]?.id || 'sub-g12-math');

  // Keep selectedSubject in sync when grade changes
  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || gradeSubjects[0];
  const subjectChapters = chapters.filter(c => c.subjectId === (currentSubject?.id || ''));

  const [selectedChapterId, setSelectedChapterId] = useState<string>(subjectChapters[0]?.id || '');
  const currentChapter = subjectChapters.find(c => c.id === selectedChapterId) || subjectChapters[0];

  // Modals state
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingSubjectModal, setEditingSubjectModal] = useState<Subject | null>(null);

  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false);
  const [editingChapterModal, setEditingChapterModal] = useState<Chapter | null>(null);

  const [editingLessonModal, setEditingLessonModal] = useState<{ chapterId: string; lesson?: Lesson } | null>(null);

  // 500 GB+ Cloud Server Storage State
  const [serverStats, setServerStats] = useState<SystemStorageStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [showServerFilesList, setShowServerFilesList] = useState<boolean>(false);

  const loadServerStorageStats = async () => {
    setIsStatsLoading(true);
    try {
      const stats = await getSystemStorageStats();
      if (stats) setServerStats(stats);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    loadServerStorageStats();
  }, []);

  // New Subject Form state
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubPriceETB, setNewSubPriceETB] = useState('850');
  const [newSubInstructor, setNewSubInstructor] = useState('Dr. Solomon Alemu');
  const [newSubImage, setNewSubImage] = useState('');

  // Edit Subject Form state
  const [editSubTitle, setEditSubTitle] = useState('');
  const [editSubCode, setEditSubCode] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');
  const [editSubPriceETB, setEditSubPriceETB] = useState('850');
  const [editSubInstructor, setEditSubInstructor] = useState('');
  const [editSubImage, setEditSubImage] = useState('');

  // Image Selector Modal State
  interface ImagePickerTarget {
    type: 'grade' | 'subject_new' | 'subject_edit' | 'chapter_new' | 'chapter_edit' | 'lesson';
    title: string;
    currentUrl?: string;
  }
  const [imagePicker, setImagePicker] = useState<ImagePickerTarget | null>(null);

  // New Chapter Form state
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterImage, setNewChapterImage] = useState('');

  // Edit Chapter Form state
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editChapterNumber, setEditChapterNumber] = useState('1');
  const [editChapterImage, setEditChapterImage] = useState('');

  // Lesson Form state (Video defaults to empty to guarantee only uploaded parts are used)
  const [lessonPartNumber, setLessonPartNumber] = useState('1');
  const [lessonTopicSubtitle, setLessonTopicSubtitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState('25');
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [lessonVideoUrl, setLessonVideoUrl] = useState(''); // Clean default - no auto-taking!
  const [lessonVideoPoster, setLessonVideoPoster] = useState(''); // Video poster/cover image
  const [lessonTextNotes, setLessonTextNotes] = useState('');
  const [lessonExamMinutes, setLessonExamMinutes] = useState('15');
  const [lessonIsPublished, setLessonIsPublished] = useState<boolean>(true);
  const [conceptSteps, setConceptSteps] = useState<ConceptStep[]>([]);
  const [lessonDownloadables, setLessonDownloadables] = useState<DownloadableMaterial[]>([]);

  const handleImageSelected = (url: string) => {
    if (!imagePicker) return;
    switch (imagePicker.type) {
      case 'grade': {
        if (paymentSettings) {
          const currentPkg = paymentSettings.gradePackages?.[activeGrade] || {
            grade: activeGrade,
            allSubjectsPriceETB: 2400,
            isActive: true,
            includedSubjects: [],
            discountPercentage: 0,
          };
          updatePaymentSettings({
            ...paymentSettings,
            gradePackages: {
              ...paymentSettings.gradePackages,
              [activeGrade]: {
                ...currentPkg,
                coverImage: url,
              },
            },
          });
        }
        break;
      }
      case 'subject_new':
        setNewSubImage(url);
        break;
      case 'subject_edit':
        setEditSubImage(url);
        break;
      case 'chapter_new':
        setNewChapterImage(url);
        break;
      case 'chapter_edit':
        setEditChapterImage(url);
        break;
      case 'lesson':
        setLessonVideoPoster(url);
        break;
    }
    setImagePicker(null);
  };
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepTip, setNewStepTip] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadProgressData, setUploadProgressData] = useState<UploadProgressInfo | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDocUploading, setIsDocUploading] = useState<boolean>(false);
  const [docUploadFeedback, setDocUploadFeedback] = useState<string | null>(null);
  const [cleanedStorageMsg, setCleanedStorageMsg] = useState<string | null>(null);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);

  const handleDocumentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setIsDocUploading(true);
    setDocUploadFeedback(`Kitaabni/nootiin sarara online irratti fe'amaa jira... (${sizeMB} MB)`);

    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const newDoc: DownloadableMaterial = {
          id: `doc-${Date.now()}`,
          title: file.name,
          type: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Formula Sheet',
          fileSize: `${data.sizeMB || sizeMB} MB`,
          downloadUrl: data.documentUrl,
        };
        setLessonDownloadables(prev => [...prev, newDoc]);
        setDocUploadFeedback(`Faayilli "${file.name}" sarara online systemii irratti kuufameera!`);
      } else {
        setDocUploadFeedback(`Dogoggora: ${data.error || 'Fe\'uu hin dandeenye'}`);
      }
    } catch (err: any) {
      setDocUploadFeedback(`Dogoggora hidhannaa: ${err.message}`);
    } finally {
      setIsDocUploading(false);
    }
  };

  const handleManualSync = async () => {
    setManualSyncMsg('Gara sarara online serveriitti fe\'amaa jira...');
    const ok = await pushCurriculumToServer(subjects, chapters);
    if (ok) {
      setManualSyncMsg('Qabiyyeen barnootaa hundi sarara online serverii irratti milkaa\'inaan kuufameera!');
    } else {
      setManualSyncMsg('Dogoggorri uumame, maaloo irra deebi\'aa yaalaa.');
    }
    setTimeout(() => setManualSyncMsg(null), 4000);
  };

  // High-Speed Direct Upload to 500GB+ Cloud Storage without Phone Storage Usage
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadProgressData(null);
    setUploadFeedback(`Vidiyoon kallattiin gara 500 GB+ Server Diskitti ol-fe'amaa jira... (${sizeMB} MB)`);

    try {
      const result = await uploadVideoToOnlineServer(file, (progress) => {
        setUploadProgress(progress.percent);
        setUploadProgressData(progress);
      });
      setLessonVideoUrl(result.videoUrl);
      setUploadFeedback(`Vidiyoon sarara online systemii (500 GB+ Cloud Storage) irratti milkaa'inaan ol-kaa'ameera! (${result.sizeMB} MB) - Kuusaa bilbila keessanii 0 MB qabate!`);
      loadServerStorageStats();
    } catch (err: any) {
      console.error('Direct online server upload attempt:', err);
      setUploadFeedback(`Dogoggorri uumame: ${err?.message || 'Serveritti ol-fe\'uu hin dandeenye. Maaloo intarneetii mirkaneeffadhaa.'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleClearLocalStorage = async () => {
    try {
      const res = await clearAllLocalDeviceVideos();
      setCleanedStorageMsg(res.message);
      setTimeout(() => setCleanedStorageMsg(null), 4000);
    } catch {
      setCleanedStorageMsg("Qulqulleessuu irratti hanqinni uumame.");
    }
  };

  const handleDeleteVideoFile = async (fileName: string) => {
    if (!window.confirm(`Vidiyoo "${fileName}" server irraa balleessuu barbaadduu?`)) return;
    const ok = await deleteServerVideo(fileName);
    if (ok) {
      loadServerStorageStats();
    } else {
      alert("Vidiyicha balleessuu hin dandeenye.");
    }
  };

  // Open Edit Subject
  const handleOpenEditSubject = (sub: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditSubTitle(sub.title);
    setEditSubCode(sub.code);
    setEditSubDesc(sub.description);
    setEditSubPriceETB(String(sub.priceETB));
    setEditSubInstructor(sub.instructorName);
    setEditSubImage(sub.coverImage || '');
    setEditingSubjectModal(sub);
  };

  // Save Edited Subject
  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubjectModal) return;
    updateSubject(editingSubjectModal.id, {
      title: editSubTitle.trim(),
      code: editSubCode.trim(),
      description: editSubDesc.trim(),
      priceETB: Number(editSubPriceETB) || 850,
      priceUSD: Math.round((Number(editSubPriceETB) || 850) / 55),
      instructorName: editSubInstructor.trim(),
      coverImage: editSubImage.trim() || undefined,
    });
    setEditingSubjectModal(null);
  };

  // Open Edit Chapter
  const handleOpenEditChapter = (chap: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditChapterTitle(chap.title);
    setEditChapterNumber(String(chap.chapterNumber || 1));
    setEditChapterImage(chap.coverImage || '');
    setEditingChapterModal(chap);
  };

  // Save Edited Chapter
  const handleSaveEditChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapterModal) return;
    updateChapter(editingChapterModal.id, {
      title: editChapterTitle.trim(),
      chapterNumber: Number(editChapterNumber) || 1,
      coverImage: editChapterImage.trim() || undefined,
    });
    setEditingChapterModal(null);
  };

  // Open Lesson Modal
  const handleOpenLessonModal = (chapterId: string, existingLesson?: Lesson) => {
    setDocUploadFeedback(null);
    if (existingLesson) {
      setLessonPartNumber(String(existingLesson.partNumber || 1));
      setLessonTopicSubtitle(existingLesson.topicId || existingLesson.description || '');
      setLessonTitle(existingLesson.title);
      setLessonDesc(existingLesson.description);
      setLessonDuration(String(existingLesson.durationMinutes));
      setLessonIsFree(existingLesson.isFreePreview);
      setLessonVideoUrl(existingLesson.videoUrl);
      setLessonVideoPoster(existingLesson.videoPoster || '');
      setLessonTextNotes(existingLesson.textNotes || '');
      setLessonExamMinutes(String(existingLesson.examTimeMinutes || 15));
      setLessonIsPublished(existingLesson.isPublished !== false && existingLesson.status !== 'draft');
      setConceptSteps(existingLesson.conceptBreakdown || []);
      setLessonDownloadables(existingLesson.downloadables || []);
    } else {
      const nextPart = (currentChapter?.lessons.length || 0) + 1;
      setLessonPartNumber(String(nextPart));
      setLessonTopicSubtitle('');
      setLessonTitle(`Part ${nextPart}: New Lesson Topic`);
      setLessonDesc('');
      setLessonDuration('25');
      setLessonIsFree(false);
      setLessonVideoUrl(''); // Strictly empty - ensures only user-uploaded video is ever used!
      setLessonVideoPoster('');
      setLessonTextNotes('');
      setLessonExamMinutes('15');
      setLessonIsPublished(true);
      setConceptSteps([]);
      setLessonDownloadables([]);
      setUploadFeedback(null);
      setUploadProgressData(null);
    }
    setEditingLessonModal({ chapterId, lesson: existingLesson });
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLessonModal || !currentSubject) return;

    const partNum = Number(lessonPartNumber) || 1;
    const lessonData = {
      subjectId: currentSubject.id,
      grade: activeGrade,
      partNumber: partNum,
      topicId: lessonTopicSubtitle.trim() || `topic-part-${partNum}`,
      title: lessonTitle.trim(),
      description: lessonDesc.trim() || lessonTopicSubtitle.trim(),
      durationMinutes: Number(lessonDuration) || 20,
      isFreePreview: lessonIsFree,
      isPublished: lessonIsPublished,
      status: lessonIsPublished ? ('published' as const) : ('draft' as const),
      lastModified: new Date().toISOString(),
      publishedAt: lessonIsPublished ? new Date().toISOString() : undefined,
      videoUrl: lessonVideoUrl.trim(), // Empty if no video uploaded; will never auto-borrow another part!
      videoPoster: lessonVideoPoster.trim() || undefined,
      textNotes: lessonTextNotes.trim(),
      examTimeMinutes: Number(lessonExamMinutes) || 15,
      conceptBreakdown: conceptSteps,
      downloadables: lessonDownloadables,
      quizQuestions: editingLessonModal.lesson?.quizQuestions || [],
    };

    if (editingLessonModal.lesson) {
      updateLesson(editingLessonModal.chapterId, editingLessonModal.lesson.id, lessonData);
    } else {
      addLessonToChapter(editingLessonModal.chapterId, lessonData);
    }
    setEditingLessonModal(null);
  };

  const handleAddConceptStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: ConceptStep = {
      stepNumber: conceptSteps.length + 1,
      title: newStepTitle.trim(),
      description: newStepDesc.trim(),
      examTip: newStepTip.trim() || undefined,
    };
    setConceptSteps(prev => [...prev, newStep]);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepTip('');
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;
    addSubject({
      title: newSubTitle.trim(),
      grade: activeGrade,
      code: newSubCode.trim() || `${activeGrade.replace(' ', '')}-NEW`,
      description: newSubDesc.trim() || 'Comprehensive course curriculum.',
      priceETB: Number(newSubPriceETB) || 750,
      priceUSD: Math.round((Number(newSubPriceETB) || 750) / 55),
      isActive: true,
      instructorName: newSubInstructor.trim(),
      instructorTitle: 'Faculty Instructor',
      coverImage: newSubImage.trim() || undefined,
    });
    setIsNewSubjectModalOpen(false);
    setNewSubTitle('');
    setNewSubCode('');
    setNewSubDesc('');
    setNewSubImage('');
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim() || !currentSubject) return;
    addChapter({
      subjectId: currentSubject.id,
      grade: activeGrade,
      chapterNumber: subjectChapters.length + 1,
      title: newChapterTitle.trim(),
      order: subjectChapters.length + 1,
      isActive: true,
      coverImage: newChapterImage.trim() || undefined,
      topics: [],
    });
    setIsNewChapterModalOpen(false);
    setNewChapterTitle('');
    setNewChapterImage('');
  };

  return (
    <div className="space-y-6">
      {/* ONLINE SERVER SYNC & DELIVERY STATUS BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Sarara Online Irratti Kuufameera (Online Server Synced)
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Wanti adminiin (Mr. Oda Worku) upload godhe hundi sarara online serverii irratti ol-kaa'ama. Barattoonni appii kana banan tokkollee osoo hin hafin qabiyyee haaromfame hunda yeruma sana argatu.
            </p>
            {lastServerSyncTime && (
              <span className="text-[10px] text-emerald-400/80 font-mono block mt-1">
                Yeroo dhumaa online haarome: {new Date(lastServerSyncTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={handleManualSync}
            disabled={isSyncingToServer}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingToServer ? 'animate-spin' : ''}`} />
            <span>{isSyncingToServer ? "Serveritti Ol-Kaa'amaa jira..." : "Gara Serveritti Mirkaneessi (Sync Now)"}</span>
          </button>
        </div>
      </div>

      {manualSyncMsg && (
        <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{manualSyncMsg}</span>
        </div>
      )}

      {/* 500 GB+ DEDICATED CLOUD STORAGE & ZERO DEVICE MEMORY COCKPIT */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Kuusaa Sarara Online (Server Cloud Storage): 500 GB+
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dedicated & Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Vidiyoowwan fe'aman hundi sarara online serverii irratti kuufamu. Kuusaan bilbila keessanii (internal device storage) 0 MB qabata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearLocalStorage}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300/70"
              title="Clean local browser and device cache"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>Kuusaa Bilbilaa Qulqulleessi (0 MB)</span>
            </button>
            <button
              onClick={loadServerStorageStats}
              disabled={isStatsLoading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Haaromsi (Refresh stats)"
            >
              <RefreshCw className={`w-4 h-4 ${isStatsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {cleanedStorageMsg && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{cleanedStorageMsg}</span>
          </div>
        )}

        {/* Storage Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block font-semibold">Bal'ina Kuusaa Serverii (Quota)</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block font-mono">500.0 GB+</span>
            <span className="text-[10px] text-emerald-600 font-bold">Cloud Storage Allocated</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block font-semibold">Iddoo Hafte (Free Space)</span>
            <span className="text-base font-black text-emerald-700 mt-0.5 block font-mono">
              {serverStats?.freeStorageGB || '499.8'} GB
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {serverStats?.usedPercentage || '0.04%'} qabameera
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-400 block font-semibold">Vidiyoo Server Irra Jiru</span>
            <span className="text-base font-black text-sky-700 mt-0.5 block font-mono">
              {serverStats?.totalVideos || 0} Faayiloota
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {serverStats?.totalSizeMB || '0.0'} MB guutummaatti
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] text-emerald-800 block font-semibold">Kuusaa Bilbila Keessanii</span>
            <span className="text-base font-black text-emerald-900 mt-0.5 block font-mono">0 MB (Zero)</span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Internal Storage Safe</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Server Disk Usage: {serverStats?.totalSizeGB || '0.000'} GB / 500 GB</span>
            <span className="text-emerald-700 font-bold">{serverStats?.freeStorageGB || '499.8'} GB Hafteera</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0.5, parseFloat(serverStats?.usedPercentage || '0.1'))}%` }}
            />
          </div>
        </div>

        {/* Server Files Drawer Toggle */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowServerFilesList(!showServerFilesList)}
            className="text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {showServerFilesList ? "Faayiloota Serverii Dhoksaa ▲" : `Vidiyoowwan Server Irratti Kuufaman Ilaali (${serverStats?.files?.length || 0}) ▼`}
            </span>
          </button>
          <span className="text-[11px] text-slate-400">
            Fast HTTP streaming without internal phone buffering
          </span>
        </div>

        {showServerFilesList && serverStats && serverStats.files.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 max-h-48 overflow-y-auto">
            {serverStats.files.map((file) => (
              <div key={file.name} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono text-[11px] text-slate-800 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">({file.sizeMB} MB)</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`/uploads/videos/${file.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded text-sky-600 hover:bg-sky-50"
                    title="Bani"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteVideoFile(file.name)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50"
                    title="Haqi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Bar with Grade Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Curriculum & Content Management</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
              Live Order & Edit Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchy: Grade → Subject (re-orderable) → Chapter (re-orderable) → Parts/Lessons (re-orderable)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Grade Pill tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Freshman University'] as GradeLevel[]).map(grade => (
              <button
                key={grade}
                onClick={() => {
                  setActiveGrade(grade);
                  const firstSub = subjects.find(s => s.grade === grade);
                  if (firstSub) setSelectedSubjectId(firstSub.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  activeGrade === grade ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Grade Cover Image Action Button */}
          <button
            type="button"
            onClick={() => setImagePicker({
              type: 'grade',
              title: `Fakkii / Poster Kutaa Filadhu (${activeGrade})`,
              currentUrl: paymentSettings?.gradePackages?.[activeGrade]?.coverImage,
            })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
            title={`Fakkii ${activeGrade} gallery irraa jijjiiri`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Fakkii {activeGrade} (Gallery)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Hierarchy Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Column 1: Subjects List (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Subjects ({gradeSubjects.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click to manage chapters & parts
              </span>
            </div>
            <button
              onClick={() => setIsNewSubjectModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              title="Add New Subject"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {gradeSubjects.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No subjects registered for {activeGrade}.
              </div>
            ) : (
              gradeSubjects.map((sub, idx) => {
                const isSelected = (currentSubject?.id || '') === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      const subChaps = chapters.filter(c => c.subjectId === sub.id);
                      if (subChaps.length > 0) setSelectedChapterId(subChaps[0].id);
                    }}
                    className={`p-3 rounded-lg text-xs transition-all flex flex-col gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{sub.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5">{sub.title}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{sub.instructorName}</p>
                      </div>

                      {/* Reorder and Edit Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSubject(sub.id, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Subject Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === gradeSubjects.length - 1}
                          onClick={() => moveSubject(sub.id, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Subject Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={e => handleOpenEditSubject(sub, e)}
                          className="p-1 text-sky-600 hover:text-sky-800 rounded hover:bg-sky-100 transition-colors"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm(`Delete "${sub.title}" and its chapters?`)) {
                              deleteSubject(sub.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Chapters under selected Subject (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Chapters ({subjectChapters.length})
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[180px] inline-block font-semibold">
                {currentSubject?.title || 'No Subject Selected'}
              </span>
            </div>
            {currentSubject && (
              <button
                onClick={() => setIsNewChapterModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                title="Add New Chapter"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chapter</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {subjectChapters.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No chapters added for this subject. Click "Add Chapter" above.
              </div>
            ) : (
              subjectChapters.map((chap, idx) => {
                const isSelected = (currentChapter?.id || '') === chap.id;
                return (
                  <div
                    key={chap.id}
                    onClick={() => setSelectedChapterId(chap.id)}
                    className={`p-3 rounded-lg text-xs transition-all flex flex-col gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px] font-mono">
                            Chapter {chap.chapterNumber || idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            · {chap.lessons.length} Parts
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-1 leading-snug line-clamp-2">
                          {chap.title}
                        </div>
                      </div>

                      {/* Reorder and Edit Actions */}
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveChapter(chap.id, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Chapter Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === subjectChapters.length - 1}
                          onClick={() => moveChapter(chap.id, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-100"
                          title="Move Chapter Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={e => handleOpenEditChapter(chap, e)}
                          className="p-1 text-amber-700 hover:text-amber-900 rounded hover:bg-amber-100 transition-colors"
                          title="Edit Chapter"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (window.confirm(`Delete Chapter "${chap.title}"?`)) {
                              deleteChapter(chap.id);
                            }
                          }}
                          className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100 transition-colors"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Parts / Lessons under selected Chapter (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Parts / Lessons ({currentChapter?.lessons.length || 0})
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[200px] inline-block font-semibold">
                {currentChapter ? `Chapter ${currentChapter.chapterNumber || 1}` : 'No Chapter Selected'}
              </span>
            </div>
            {currentChapter && (
              <button
                onClick={() => handleOpenLessonModal(currentChapter.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                title="Add New Part"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Part</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {!currentChapter || currentChapter.lessons.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No parts created yet for this chapter. Click "Add Part" to add video tutorial, written notes & exam MCQs.
              </div>
            ) : (
              currentChapter.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all space-y-2 bg-slate-50/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] font-mono">
                          Part {lesson.partNumber || idx + 1}
                        </span>

                        {/* 1-Click Quick Publish / Draft Status Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const isPub = lesson.isPublished !== false && lesson.status !== 'draft';
                            togglePublishStatus('lesson', lesson.id, !isPub, currentChapter.id);
                          }}
                          className={`px-2 py-0.5 rounded-full font-bold text-[9px] transition-colors flex items-center gap-1 ${
                            lesson.isPublished !== false && lesson.status !== 'draft'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title={
                            lesson.isPublished !== false && lesson.status !== 'draft'
                              ? 'Barattoonni ni argu. Cuqaasaa dhoksuuf (Draft).'
                              : 'Barattoonni hin argan (Draft). Cuqaasaa maxxansuuf (Publish).'
                          }
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lesson.isPublished !== false && lesson.status !== 'draft'
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span>
                            {lesson.isPublished !== false && lesson.status !== 'draft'
                              ? 'Published'
                              : 'Draft'}
                          </span>
                        </button>

                        {lesson.isFreePreview && (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            Free
                          </span>
                        )}
                        {lesson.videoUrl && lesson.videoUrl.trim() !== '' ? (
                          <span className="text-[9px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 flex items-center gap-1 font-mono">
                            <Video className="w-2.5 h-2.5 text-sky-600" />
                            <span>Vidiyoo Qaba</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5 text-amber-600" />
                            <span>Barreeffama Qofa</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                        {lesson.title}
                      </div>
                      {lesson.topicId && (
                        <div className="text-[11px] text-slate-500 font-serif italic truncate">
                          Topic: {lesson.topicId}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>⏱️ {lesson.durationMinutes}m</span>
                        <span>·</span>
                        <span>📝 {lesson.conceptBreakdown?.length || 0} steps</span>
                        <span>·</span>
                        <span>🎯 {lesson.quizQuestions?.length || 0} MCQs</span>
                      </div>
                    </div>

                    {/* Reorder Parts & Edit */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveLesson(currentChapter.id, lesson.id, 'up')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                        title="Move Part Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === currentChapter.lessons.length - 1}
                        onClick={() => moveLesson(currentChapter.id, lesson.id, 'down')}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded hover:bg-slate-200"
                        title="Move Part Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenLessonModal(currentChapter.id, lesson)}
                        className="p-1 text-sky-600 hover:text-sky-800 rounded hover:bg-sky-100 transition-colors"
                        title="Edit Part"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete Part "${lesson.title}"?`)) {
                            deleteLesson(currentChapter.id, lesson.id);
                          }
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100 transition-colors"
                        title="Delete Part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar: Live Preview */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onPreviewLesson(lesson, currentSubject, currentChapter)}
                      className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Player
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Exam: {lesson.examTimeMinutes || 15}m
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Create New Subject */}
      {isNewSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Subject for {activeGrade}</h3>
              <button onClick={() => setIsNewSubjectModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Title * (English)</label>
                <input
                  type="text"
                  required
                  value={newSubTitle}
                  onChange={e => setNewSubTitle(e.target.value)}
                  placeholder="e.g. Mathematics, Physics, Chemistry..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={newSubCode}
                    onChange={e => setNewSubCode(e.target.value)}
                    placeholder="e.g. MATH-1201"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Price (ETB)</label>
                  <input
                    type="number"
                    value={newSubPriceETB}
                    onChange={e => setNewSubPriceETB(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={newSubInstructor}
                  onChange={e => setNewSubInstructor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fakkii Gosa Barnootaa (Subject Cover)</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                    <img
                      src={newSubImage || SUBJECT_MATH_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = SUBJECT_MATH_IMAGE; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={newSubImage}
                      onChange={e => setNewSubImage(e.target.value)}
                      placeholder="URL fakkii ykn Gallery irraa filadhu..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePicker({
                      type: 'subject_new',
                      title: `Fakkii Gosa Barnootaa Filadhu (${newSubTitle || 'Subject'})`,
                      currentUrl: newSubImage,
                    })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={e => setNewSubDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Existing Subject */}
      {editingSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Subject: {editingSubjectModal.title}</h3>
              <button onClick={() => setEditingSubjectModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Title * (English)</label>
                <input
                  type="text"
                  required
                  value={editSubTitle}
                  onChange={e => setEditSubTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={editSubCode}
                    onChange={e => setEditSubCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (ETB)</label>
                  <input
                    type="number"
                    value={editSubPriceETB}
                    onChange={e => setEditSubPriceETB(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={editSubInstructor}
                  onChange={e => setEditSubInstructor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fakkii Gosa Barnootaa (Subject Cover)</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                    <img
                      src={editSubImage || SUBJECT_MATH_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = SUBJECT_MATH_IMAGE; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={editSubImage}
                      onChange={e => setEditSubImage(e.target.value)}
                      placeholder="URL fakkii ykn Gallery irraa filadhu..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePicker({
                      type: 'subject_edit',
                      title: `Fakkii Gosa Barnootaa Filadhu (${editSubTitle || 'Subject'})`,
                      currentUrl: editSubImage,
                    })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editSubDesc}
                  onChange={e => setEditSubDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubjectModal(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Chapter */}
      {isNewChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Chapter</h3>
              <button onClick={() => setIsNewChapterModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateChapter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  placeholder="e.g. Chapter 3: Chemical Bonding"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fakkii Boqonnaa (Chapter Cover Banner)</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                    <img
                      src={newChapterImage || 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={newChapterImage}
                      onChange={e => setNewChapterImage(e.target.value)}
                      placeholder="URL fakkii ykn Gallery irraa filadhu..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePicker({
                      type: 'chapter_new',
                      title: `Fakkii Boqonnaa Filadhu (${newChapterTitle || 'Chapter'})`,
                      currentUrl: newChapterImage,
                    })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChapterModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Chapter */}
      {editingChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Chapter</h3>
              <button onClick={() => setEditingChapterModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveEditChapter} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chapter Number</label>
                <input
                  type="number"
                  value={editChapterNumber}
                  onChange={e => setEditChapterNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={editChapterTitle}
                  onChange={e => setEditChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fakkii Boqonnaa (Chapter Cover Banner)</label>
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                    <img
                      src={editChapterImage || 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={editChapterImage}
                      onChange={e => setEditChapterImage(e.target.value)}
                      placeholder="URL fakkii ykn Gallery irraa filadhu..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePicker({
                      type: 'chapter_edit',
                      title: `Fakkii Boqonnaa Filadhu (${editChapterTitle || 'Chapter'})`,
                      currentUrl: editChapterImage,
                    })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChapterModal(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Comprehensive Add / Edit Lesson (Part) Builder */}
      {editingLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {editingLessonModal.lesson ? `Edit Part ${lessonPartNumber}` : 'Create New Part'}
                </h3>
                <span className="text-xs text-slate-500">
                  Configure Part Number, Topic, video URL, written notes, and timed exam duration
                </span>
              </div>
              <button onClick={() => setEditingLessonModal(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Part Number & Topic Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Part Number (1, 2, 3...) *</label>
                  <input
                    type="number"
                    required
                    value={lessonPartNumber}
                    onChange={e => setLessonPartNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-emerald-800 bg-emerald-50/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Topic Subtitle (Under Part)</label>
                  <input
                    type="text"
                    value={lessonTopicSubtitle}
                    onChange={e => setLessonTopicSubtitle(e.target.value)}
                    placeholder="e.g. Fundamental Concepts & Theorem Derivations"
                    className="w-full px-3 py-2 border rounded-lg font-serif italic"
                  />
                </div>
              </div>

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Part Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    placeholder="e.g. Part 1: Introduction to Matrices"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={e => setLessonDuration(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="freePreviewCheckbox"
                    checked={lessonIsFree}
                    onChange={e => setLessonIsFree(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="freePreviewCheckbox" className="font-semibold text-slate-800 cursor-pointer text-xs">
                    Free Preview Part
                  </label>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="font-semibold text-slate-700 text-xs">Sadarkaa:</span>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-200">
                    <button
                      type="button"
                      onClick={() => setLessonIsPublished(true)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        lessonIsPublished
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setLessonIsPublished(false)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        !lessonIsPublished
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Part Poster / Thumbnail Selection with Gallery Support */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-slate-800 text-xs">
                    Fakkii Vidiyoo / Poster (Part Thumbnail Poster)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Fakkii barattoonni vidiyoo banuun dura argan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-11 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
                    <img
                      src={lessonVideoPoster || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                      alt="Part Poster"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={lessonVideoPoster}
                      onChange={e => setLessonVideoPoster(e.target.value)}
                      placeholder="URL fakkii ykn Gallery irraa fe'i..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setImagePicker({
                      type: 'lesson',
                      title: `Fakkii Vidiyoo / Poster Filadhu (Part ${lessonPartNumber})`,
                      currentUrl: lessonVideoPoster,
                    })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Gallery</span>
                  </button>
                </div>
              </div>

              {/* Video Upload & Online Cloud Stream Management */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <label className="font-bold text-slate-900 flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-emerald-600" />
                      <span>Kuusaa Vidiyoo Sarara Online (Online System Cloud Video)</span>
                    </label>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      Vidiyoon sarara online systemii irratti ol-kaa'ama. Kuusaan keessoo bilbila keessanii (internal storage) homaa hin qabamu!
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0 self-start sm:self-auto">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Kuusaa Bilbilaa: 0 MB</span>
                  </div>
                </div>

                {/* Storage Info Banner with Turbo Stream speed guarantee */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/50 text-xs text-white shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-black text-xs text-white tracking-wide flex items-center gap-1.5">
                          <span>Turbo Fast Stream Upload (Saffisa Olaanaa)</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                            Daqiiqaa 1 Gadi (Fast)
                          </span>
                        </span>
                        <p className="text-[11px] text-emerald-300/90 font-medium">
                          Raw Binary Stream + TCP NoDelay: Vidiyoon sekondii 30–60 keessatti fe'ama!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/10 text-[11px] text-slate-200 leading-relaxed border border-white/10 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>
                      <strong>Gorsa Saffisaaf:</strong> Vidiyoo MP4 (720p / 1080p, H.264) fayyadamaa. Faayilli 30MB–100MB daqiiqaa 1 gadi keessatti 100% guutuu ta'a; barattoonnis dafanii offline buufatu!
                    </span>
                  </div>
                </div>

                {/* Option A: Direct File Upload to Online System Server */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      Kallattiin Gara Online Serveritti Fe'aa (Turbo Stream to Disk)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      Fast Socket Active
                    </span>
                  </div>

                  <label className={`w-full cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all text-xs ${
                    isUploading
                      ? 'border-emerald-400 bg-emerald-50/60 pointer-events-none'
                      : 'border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 text-emerald-800 font-bold shadow-sm'
                  }`}>
                    {isUploading ? (
                      <div className="w-full space-y-3 p-4 bg-slate-950 text-white rounded-xl shadow-xl border border-emerald-500/40 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                            <span className="font-bold text-xs text-white">
                              Gara 500 GB+ Server Diskitti Ol-Fe'amaa Jira...
                            </span>
                          </div>
                          {uploadProgressData && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center gap-1 border border-amber-500/30">
                              <Zap className="w-3 h-3 text-amber-400" />
                              {uploadProgressData.speedMBs} MB/s
                            </span>
                          )}
                        </div>

                        {/* Progress Bar with pulse */}
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress || 0}%` }}
                          />
                        </div>

                        {uploadProgressData ? (
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 pt-0.5">
                            <div>
                              <span className="text-slate-500 block">Fe'ame:</span>
                              <span className="text-white font-bold">{uploadProgressData.loadedMB} / {uploadProgressData.totalMB} MB</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Yeroo Hafe:</span>
                              <span className="text-amber-300 font-bold">{uploadProgressData.etaSeconds > 0 ? `${uploadProgressData.etaSeconds}s remaining` : 'Xumuramaa jira...'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 block">Kuusaa Bilbilaa:</span>
                              <span className="text-emerald-400 font-bold">0 MB (Zero)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Saffisa ol'aanaan fe'amaa jira... {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>
                            <span className="text-emerald-400">0 MB phone memory used</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                          <span className="block font-bold text-emerald-900 text-sm">
                            Faayila Vidiyoo Bilbila / Kompiitara Irraa Filadhaa
                          </span>
                          <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                            Kallattiin gara 500 GB+ Server Diskitti kuufama (Kuusaa bilbila keessanii 0 MB)
                          </span>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/*"
                      onChange={handleVideoFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadFeedback && (
                  <div
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2.5 animate-in fade-in ${
                      uploadFeedback.toLowerCase().includes('dogoggorri') || uploadFeedback.includes('Status')
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-emerald-100/90 border-emerald-300 text-emerald-900'
                    }`}
                  >
                    {uploadFeedback.toLowerCase().includes('dogoggorri') || uploadFeedback.includes('Status') ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span className="leading-relaxed">{uploadFeedback}</span>
                  </div>
                )}

                {/* Option B: Direct Online Stream URL (YouTube / Google Drive / Direct Link) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-sky-600" />
                      Liinkii Vidiyoo Online (YouTube, Google Drive, ykn Server URL):
                    </label>
                    {lessonVideoUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setLessonVideoUrl('');
                          setUploadFeedback("Vidiyoon part kana irraa kaafameera. Partichi barreeffama qofaan mul'ata.");
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Vidiyoo Kaasi (Clear Video)
                      </button>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold">Vidiyoo Hin Qabu (Pending)</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={lessonVideoUrl}
                    onChange={e => {
                      setLessonVideoUrl(e.target.value);
                      setUploadFeedback(null);
                    }}
                    placeholder="Duwwaa dhiisaa yoo hin qabaanne, ykn YouTube / Google Drive / Server URL galchaa..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    * Hubachiisa: Yoo vidiyoon hin fe'amne duwwaa dhiisaa. Systemichi ofiin vidiyoo biraa tasa hin fudhatu!
                  </p>
                </div>

                {/* Device Storage Management / Cleaner for Mr. Oda */}
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Kuusaa duraan bilbila keessan irra kuufame qulqulleessuuf:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearLocalStorage}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Kuusaa Bilbilaa Qulqulleessi (Free Phone Storage)</span>
                  </button>
                </div>
                {cleanedStorageMsg && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{cleanedStorageMsg}</span>
                  </div>
                )}

                {/* Timed Exam Setting */}
                <div className="pt-1">
                  <label className="block font-semibold text-slate-700 mb-1 text-xs">Yeroo Qormaata MCQ (Timed Exam Minutes):</label>
                  <input
                    type="number"
                    value={lessonExamMinutes}
                    onChange={e => setLessonExamMinutes(e.target.value)}
                    className="w-full sm:w-40 px-3 py-2 border rounded-lg font-mono bg-white text-xs"
                  />
                </div>

                {/* Live Video Preview in Admin Form */}
                {lessonVideoUrl && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Ilaalcha Duraa Vidiyoo (Video Preview):
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {parseVideoSource(lessonVideoUrl).type === 'youtube'
                          ? 'YouTube Online'
                          : parseVideoSource(lessonVideoUrl).type === 'googledrive'
                          ? 'Google Drive Online'
                          : parseVideoSource(lessonVideoUrl).type === 'server_online'
                          ? 'Server Online Storage'
                          : 'Direct Online Stream'}
                      </span>
                    </div>

                    {parseVideoSource(lessonVideoUrl).type === 'youtube' ||
                    parseVideoSource(lessonVideoUrl).type === 'googledrive' ? (
                      <iframe
                        src={parseVideoSource(lessonVideoUrl).embedUrl}
                        title="Lesson Preview"
                        className="w-full aspect-video rounded-xl border border-slate-300 bg-black"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        key={lessonVideoUrl}
                        src={lessonVideoUrl}
                        controls
                        playsInline
                        className="w-full max-h-44 rounded-xl bg-black border border-slate-300 object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Written Notes / Document Content */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  In-App Written Notes / Summary (DRM Protected)
                </label>
                <textarea
                  rows={4}
                  value={lessonTextNotes}
                  onChange={e => setLessonTextNotes(e.target.value)}
                  placeholder="Comprehensive lecture notes, key formulas, theorems, and definitions displayed directly in the in-app document viewer..."
                  className="w-full px-3 py-2 border rounded-lg font-sans text-xs leading-relaxed"
                />
              </div>

              {/* Step-by-Step Concept Breakdown */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Concept Breakdown Steps ({conceptSteps.length})</span>
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conceptSteps.map((step, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded border border-slate-200 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800">Step {step.stepNumber}: {step.title}</span>
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate">{step.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConceptSteps(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Step Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    value={newStepTitle}
                    onChange={e => setNewStepTitle(e.target.value)}
                    placeholder="Step Title (e.g. Core Principle)"
                    className="px-2.5 py-1.5 border rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={newStepDesc}
                    onChange={e => setNewStepDesc(e.target.value)}
                    placeholder="Step Explanation"
                    className="px-2.5 py-1.5 border rounded bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddConceptStep}
                    disabled={!newStepTitle.trim()}
                    className="px-3 py-1 bg-slate-800 text-white rounded text-[11px] font-semibold disabled:opacity-40"
                  >
                    + Add Step
                  </button>
                </div>
              </div>

              {/* Downloadable Materials & Books / PDF Uploading */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      <span>Kitaaba & Nootii Barattootaa (Books & Study Materials)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kitaaba yookaan PDF nootii sarara online serverii irratti ol-fe'aa; barattoonni guutummaatti ni argatu.
                    </p>
                  </div>
                  <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                    {lessonDownloadables.length} Attached
                  </span>
                </div>

                {/* Upload Document Input */}
                <div className="pt-1">
                  <label className={`w-full cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-sky-300 bg-white hover:bg-sky-50 text-xs text-sky-800 font-bold transition-all shadow-2xs ${
                    isDocUploading ? 'pointer-events-none opacity-60' : ''
                  }`}>
                    {isDocUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
                        <span>Kitaabni/PDFn fe'amaa jira...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-sky-600" />
                        <span>PDF / Kitaaba Haaraa Ol-Fe'i (Upload Book to Server)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleDocumentFileUpload}
                      disabled={isDocUploading}
                      className="hidden"
                    />
                  </label>
                  {docUploadFeedback && (
                    <p className="text-[11px] font-semibold text-sky-700 mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{docUploadFeedback}</span>
                    </p>
                  )}
                </div>

                {/* List of Attached Documents */}
                {lessonDownloadables.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {lessonDownloadables.map((doc, idx) => (
                      <div key={doc.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 truncate block">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize} · {doc.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {doc.downloadUrl && doc.downloadUrl !== '#' && (
                            <a
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-sky-600 hover:text-sky-800 rounded hover:bg-sky-50"
                              title="Bani / Ilaali"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setLessonDownloadables(prev => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Haqi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLessonModal(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Part & Update Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Image Selector Modal for Grade, Subject, Chapter, and Lesson */}
      {imagePicker && (
        <ImageSelectorModal
          isOpen={!!imagePicker}
          onClose={() => setImagePicker(null)}
          onSelectImage={handleImageSelected}
          currentImage={imagePicker.currentUrl}
          title={imagePicker.title}
          targetType={
            imagePicker.type === 'grade'
              ? 'grade'
              : imagePicker.type.startsWith('subject')
              ? 'subject'
              : imagePicker.type.startsWith('chapter')
              ? 'chapter'
              : 'part'
          }
        />
      )}
    </div>
  );
};

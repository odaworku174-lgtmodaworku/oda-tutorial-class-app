import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lesson, Subject, Chapter } from '../../types';
import { useApp } from '../../context/AppContext';
import { QuizExamRunner } from './QuizExamRunner';
import { PaymentModal } from './PaymentModal';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Cloud,
  Maximize2,
  Minimize2,
  Volume2,
  Volume1,
  VolumeX,
  CheckCircle,
  FileText,
  Lightbulb,
  HelpCircle,
  Lock,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Shield,
  ShieldAlert,
  FileCode,
  Presentation,
  BookOpen,
  Eye,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sliders,
  Tv,
  ExternalLink,
  Clock,
  Compass,
  Layers,
  Settings,
  Check,
  DownloadCloud,
  HardDrive,
  WifiOff,
  Crop,
  Smartphone,
  Video,
  Upload,
  X,
  Share2,
  Zap,
  Server,
  ShieldCheck,
} from 'lucide-react';
import {
  isVideoSavedOffline,
  getOfflineVideoBlobUrl,
  downloadVideoForOffline,
  canVideoBeSavedOffline,
  deleteOfflineVideo,
  OfflineVideoMetadata,
  formatBytesToMB,
} from '../../utils/offlineVideoStorage';
import { OfflineFileManagerModal } from './OfflineFileManagerModal';
import { ShareModal } from '../common/ShareModal';
import { parseVideoSource, saveUploadedVideo, uploadVideoToOnlineServer, clearAllLocalDeviceVideos, UploadProgressInfo } from '../../utils/videoHelpers';

interface LessonViewerProps {
  lesson: Lesson;
  subject: Subject;
  chapter: Chapter;
  onBackToCourse: () => void;
}

type MainTab = 'video' | 'written' | 'quiz';
type WrittenFormat = 'text' | 'html' | 'ppt' | 'pdf';

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  subject,
  chapter,
  onBackToCourse,
}) => {
  const { currentStudent, markLessonComplete, checkSubjectAccess, setSelectedLesson, language, userRole, updateLesson } = useApp();
  const isOromo = language === 'om';

  // 1. Horizontal scrolling / primary tabs state
  const [activeTab, setActiveTab] = useState<MainTab>('video');
  const [writtenFormat, setWrittenFormat] = useState<WrittenFormat>('text');

  // Video playback & Control Panel state
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(lesson.durationMinutes ? lesson.durationMinutes * 60 : 0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isPiPActive, setIsPiPActive] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeServer, setActiveServer] = useState<'server1' | 'server2'>('server1');
  const [showOverlayControls, setShowOverlayControls] = useState<boolean>(true);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Admin Lesson & Video Editor state (Only Mr. Oda Worku)
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
  const [editLessonTitle, setEditLessonTitle] = useState(lesson.title);
  const [editLessonDesc, setEditLessonDesc] = useState(lesson.description || '');
  const [editLessonVideoUrl, setEditLessonVideoUrl] = useState(lesson.videoUrl || '');
  const [editUploadFeedback, setEditUploadFeedback] = useState<string | null>(null);
  const [adminUploadProgress, setAdminUploadProgress] = useState<UploadProgressInfo | null>(null);
  const [isAdminUploading, setIsAdminUploading] = useState<boolean>(false);

  // Offline caching & storage state
  const [isSavedOffline, setIsSavedOffline] = useState<boolean>(false);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [offlineBlobUrl, setOfflineBlobUrl] = useState<string | null>(null);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState<boolean>(false);

  // System Media Player features (Aspect fit, gesture feedback)
  const [videoFitMode, setVideoFitMode] = useState<'contain' | 'cover'>('contain');
  const [gestureFeedback, setGestureFeedback] = useState<{ icon: string; text: string } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // In-App Document Viewer state (PPT slides & PDF zoom)
  const [currentPptSlide, setCurrentPptSlide] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [pdfPage, setPdfPage] = useState<number>(1);

  // Security toast notification
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const accessStatus = checkSubjectAccess(subject.id);
  const isFreeLesson = chapter.chapterNumber === 1 || chapter.isFree || lesson.isFreePreview;
  const isLessonAccessible = isFreeLesson || accessStatus.isUnlocked || userRole === 'admin';
  const isCompleted = currentStudent.completedLessonIds.includes(lesson.id);

  // Grade 9 Math Chapter 1 specialized video sources
  const isGrade9MathCh1Part1 =
    subject.id === 'sub-g9-math' &&
    chapter.chapterNumber === 1 &&
    (lesson.partNumber === 1 || lesson.id.includes('p1') || lesson.title.toLowerCase().includes('describing sets'));

  const isGrade9MathCh1Part2 =
    subject.id === 'sub-g9-math' &&
    chapter.chapterNumber === 1 &&
    (lesson.partNumber === 2 || lesson.id.includes('p2') || lesson.title.toLowerCase().includes('subsets'));

  // Multi-source fallback resolution:
  // Strictly ensure only parts uploaded by Mr. Oda (or G9 Math Ch1) have videos - NO auto-taking other parts!
  const hasUploadedVideo = Boolean(lesson.videoUrl && lesson.videoUrl.trim() !== '');

  const primaryVideoUrl = isGrade9MathCh1Part1
    ? '/videos/grade9_math_ch1_part1.mp4'
    : isGrade9MathCh1Part2
    ? '/videos/grade9_math_ch1_part2.mp4'
    : hasUploadedVideo
    ? lesson.videoUrl.trim()
    : '';

  const backupMirrorUrl = isGrade9MathCh1Part1
    ? '/assets/aistudio/XRecorder_20261014_01_28313b60.mp4'
    : isGrade9MathCh1Part2
    ? '/assets/aistudio/Screencast_2026-10-14_083817_2d6a8443.mp4'
    : null;

  const resolvedOnlineUrl = activeServer === 'server2' && backupMirrorUrl ? backupMirrorUrl : primaryVideoUrl;
  // If stored locally on device, offlineBlobUrl provides 100% offline playback with 0 data needed
  const effectiveVideoUrl = offlineBlobUrl || resolvedOnlineUrl;
  const parsedVideo = parseVideoSource(effectiveVideoUrl);
  const hasVideoSource = Boolean(effectiveVideoUrl && effectiveVideoUrl.trim() !== '');

  // Custom Video Chapters with Timestamps for Grade 9 Math Ch 1
  const videoChapters = isGrade9MathCh1Part1
    ? [
        { time: 0, label: isOromo ? '00:00 - Seensa Tuutaalee' : '00:00 - Intro to Sets' },
        { time: 225, label: isOromo ? '03:45 - Mala Ibsa Jechaa' : '03:45 - Verbal Method' },
        { time: 492, label: isOromo ? '08:12 - Mala Tarreessuu' : '08:12 - Listing Method' },
        { time: 750, label: isOromo ? '12:30 - Seera Tuqaa Sadii (...)' : '12:30 - The Ellipsis Rule' },
        { time: 1010, label: isOromo ? '16:50 - Mala Ijaarsa Tuutaa' : '16:50 - Set-Builder Method' },
        { time: 1240, label: isOromo ? '20:40 - Gaaffilee Qormaataa' : '20:40 - Solved Exam MCQs' },
      ]
    : lesson.videoChapters || [
        { time: 0, label: '00:00 - Introduction' },
        { time: 300, label: '05:00 - Core Principles' },
        { time: 600, label: '10:00 - Step-by-Step Proofs' },
        { time: 900, label: '15:00 - Exam Problem Walkthrough' },
      ];

  // Helper to format seconds into MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Playback handlers
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setVideoError(null);
          })
          .catch((err: any) => {
            // AbortError occurs normally when play() is interrupted by pause() or navigation
            if (err?.name === 'AbortError' || err?.message?.includes('interrupted') || err?.message?.includes('pause')) {
              return;
            }
            console.warn('Playback play request was prevented by browser:', err?.message || err);
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    const muted = newVol === 0;
    setIsMuted(muted);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = muted;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (nextMuted) {
      setVolume(0);
    } else {
      setVolume(videoRef.current.volume || 1);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setCurrentTime(0);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleSeekToChapter = (timeInSeconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
    videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleReloadVideo = () => {
    setVideoError(null);
    setIsBuffering(true);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          setIsBuffering(false);
        });
    }
  };

  const handleSwitchServer = (server: 'server1' | 'server2') => {
    setActiveServer(server);
    setVideoError(null);
    setIsBuffering(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        setIsBuffering(false);
      }
    }, 200);
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const togglePiP = () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().then(() => setIsPiPActive(false)).catch(console.error);
    } else if (document.pictureInPictureEnabled) {
      videoRef.current.requestPictureInPicture().then(() => setIsPiPActive(true)).catch(console.error);
    }
  };

  // YouTube-style auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUserActivity = useCallback(() => {
    setShowOverlayControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowOverlayControls(false);
      }, 2800);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowOverlayControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      handleUserActivity();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, handleUserActivity]);

  // Gesture / Action feedback toast (YouTube / VLC style)
  const showFeedback = useCallback((text: string, icon: string = '⚡') => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setGestureFeedback({ text, icon });
    feedbackTimeoutRef.current = setTimeout(() => {
      setGestureFeedback(null);
    }, 1200);
  }, []);

  // Offline persistence checker & loader
  useEffect(() => {
    let isCancelled = false;
    const checkOfflineStatus = async () => {
      try {
        const saved = await isVideoSavedOffline(lesson.id);
        if (!isCancelled) {
          setIsSavedOffline(saved);
          if (saved) {
            const blobUrl = await getOfflineVideoBlobUrl(lesson.id);
            if (!isCancelled && blobUrl) {
              setOfflineBlobUrl(blobUrl);
            }
          } else {
            setOfflineBlobUrl(null);
          }
        }
      } catch (err) {
        console.warn('Offline check error:', err);
      }
    };

    checkOfflineStatus();
    return () => {
      isCancelled = true;
    };
  }, [lesson.id]);

  // Handler to download and cache video locally on device
  const handleSaveOffline = async () => {
    if (isDownloadingOffline || isSavedOffline) return;

    // Check if the video format/host allows offline storage
    const offlineCheck = canVideoBeSavedOffline(resolvedOnlineUrl);
    if (!offlineCheck.canDownload) {
      showFeedback(
        isOromo
          ? "Vidiyoon kun sarara online irraa kallattiin daawwatama malee offline hin bu'u"
          : "This video streams directly online and cannot be cached offline",
        "ℹ️"
      );
      return;
    }

    // Check internet connectivity
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && !navigator.onLine) {
      showFeedback(
        isOromo
          ? "Sarara intarneetii hin qabdan. Maaloo dura intarneetiin walqunnamsiisaa."
          : "No internet connection. Please connect to download.",
        "⚠️"
      );
      return;
    }

    setIsDownloadingOffline(true);
    setDownloadProgress(0);
    showFeedback(isOromo ? 'Buufamaa jira...' : 'Downloading...', '📥');

    try {
      const blobUrl = await downloadVideoForOffline(
        lesson.id,
        resolvedOnlineUrl,
        {
          title: lesson.title,
          subjectTitle: subject.title,
          grade: subject.grade,
          durationMinutes: lesson.durationMinutes || 24,
        },
        (percent) => {
          setDownloadProgress(percent);
        }
      );
      setOfflineBlobUrl(blobUrl);
      setIsSavedOffline(true);
      setIsDownloadingOffline(false);
      showFeedback(isOromo ? 'Offline kuufameera! 100%' : 'Saved offline! 100%', '✅');
    } catch (err: any) {
      console.warn('Offline download notice:', err?.message || err);
      setIsDownloadingOffline(false);
      setDownloadProgress(0);
      const userMessage = err?.message || (isOromo ? "Buusuun hin danda'amne" : "Download failed");
      showFeedback(userMessage, '⚠️');
    }
  };

  // Play a video selected from Offline File Manager Modal
  const handlePlayFromOfflineManager = async (videoMeta: OfflineVideoMetadata) => {
    const foundLesson = chapter.lessons.find((l) => l.id === videoMeta.lessonId);
    if (foundLesson) {
      setSelectedLesson(foundLesson);
    }
    const blobUrl = await getOfflineVideoBlobUrl(videoMeta.lessonId);
    if (blobUrl) {
      setOfflineBlobUrl(blobUrl);
      setIsSavedOffline(true);
      showFeedback(isOromo ? 'Offline Taphachaa Jira' : 'Playing Offline', '📱');
    }
  };

  // OS & Mobile Lock Screen System Media Player integration (MediaSession API)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !videoRef.current) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: lesson.title,
        artist: 'ODA EDUCATIONAL APP',
        album: `${subject.title} · ${chapter.title}`,
        artwork: [
          {
            src: lesson.videoPoster || '/videos/grade9_math_ch1_video_poster.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
        ['play', () => { togglePlay(); }],
        ['pause', () => { togglePlay(); }],
        ['seekbackward', (details) => { skipTime(-(details.seekOffset || 10)); }],
        ['seekforward', (details) => { skipTime(details.seekOffset || 10); }],
        ['seekto', (details) => {
          if (details.seekTime !== undefined && details.seekTime !== null) {
            handleSeek(details.seekTime);
          }
        }],
      ];

      for (const [action, handler] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch {
          // Unsupported actions safely ignored
        }
      }
    } catch (e) {
      console.warn('MediaSession notice:', e);
    }
  }, [lesson, subject, chapter, togglePlay]);

  // Sync MediaSession position state for system lock screens
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: playbackSpeed,
          position: Math.min(Math.max(0, currentTime), duration),
        });
      } catch {
        // Safe guard against edge position states
      }
    }
  }, [currentTime, duration, playbackSpeed]);

  // System Media Player Keyboard Shortcuts (Space, J, K, L, Arrows, M, F, P, C, 0-9)
  useEffect(() => {
    const handleSystemKey = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in notes or text fields
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (activeTab !== 'video') return;

      const key = e.key.toLowerCase();

      // Space or 'k' -> Play / Pause
      if (e.code === 'Space' || key === 'k') {
        e.preventDefault();
        togglePlay();
        showFeedback(isPlaying ? 'Pause' : 'Play', isPlaying ? '⏸️' : '▶️');
      }
      // 'j' or ArrowLeft -> Rewind 10s / 5s
      else if (e.code === 'ArrowLeft' || key === 'j') {
        e.preventDefault();
        const delta = e.code === 'ArrowLeft' ? -5 : -10;
        skipTime(delta);
        showFeedback(`${delta}s`, '⏪');
      }
      // 'l' or ArrowRight -> Forward 10s / 5s
      else if (e.code === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        const delta = e.code === 'ArrowRight' ? 5 : 10;
        skipTime(delta);
        showFeedback(`+${delta}s`, '⏩');
      }
      // ArrowUp -> Volume +10%
      else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const nextVol = Math.min(1, Math.round((volume + 0.1) * 10) / 10);
        handleVolumeChange(nextVol);
        showFeedback(`Vol: ${Math.round(nextVol * 100)}%`, '🔊');
      }
      // ArrowDown -> Volume -10%
      else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const nextVol = Math.max(0, Math.round((volume - 0.1) * 10) / 10);
        handleVolumeChange(nextVol);
        showFeedback(`Vol: ${Math.round(nextVol * 100)}%`, nextVol === 0 ? '🔇' : '🔉');
      }
      // 'm' -> Mute / Unmute
      else if (key === 'm') {
        e.preventDefault();
        toggleMute();
        showFeedback(isMuted ? 'Unmuted' : 'Muted', isMuted ? '🔊' : '🔇');
      }
      // 'f' -> Fullscreen
      else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      // 'p' -> PiP
      else if (key === 'p' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        togglePiP();
      }
      // 'c' -> Video aspect fit toggle (contain vs cover)
      else if (key === 'c') {
        e.preventDefault();
        setVideoFitMode((prev) => {
          const next = prev === 'contain' ? 'cover' : 'contain';
          showFeedback(`Fit: ${next.toUpperCase()}`, '🔲');
          return next;
        });
      }
      // 0 - 9 -> Seek percentage
      else if (/^[0-9]$/.test(e.key) && duration > 0) {
        e.preventDefault();
        const pct = parseInt(e.key, 10) / 10;
        handleSeek(duration * pct);
        showFeedback(`Seek: ${e.key}0%`, '⏩');
      }
    };

    window.addEventListener('keydown', handleSystemKey);
    return () => {
      window.removeEventListener('keydown', handleSystemKey);
    };
  }, [activeTab, isPlaying, volume, isMuted, duration, togglePlay, showFeedback]);

  // Video click & double tap seek handler
  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = videoContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;

    if (e.detail === 2) {
      // Double click left side: rewind 10s
      if (ratio < 0.35) {
        skipTime(-10);
        showFeedback('-10s', '⏪');
        return;
      }
      // Double click right side: forward 10s
      if (ratio > 0.65) {
        skipTime(10);
        showFeedback('+10s', '⏩');
        return;
      }
    } else if (e.detail === 1) {
      togglePlay();
    }
  };

  // -------------------------------------------------------------
  // Anti-Screenshot & Screen Recording Event Listeners
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Catch PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setSecurityToast(isOromo ? 'Iskiriinshoot dhowwaadha!' : 'Screenshot prohibited.');
        setTimeout(() => setSecurityToast(null), 3000);
        return false;
      }

      // Catch Ctrl+P (Print), Ctrl+S (Save), Ctrl+Shift+I / F12 (Inspect)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')
      ) {
        e.preventDefault();
        setSecurityToast(isOromo ? 'Waraabbiin dhowwaadha!' : 'Saving or printing disabled.');
        setTimeout(() => setSecurityToast(null), 3000);
        return false;
      }

      // Catch Mac screenshot shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      if ((e.metaKey && e.shiftKey) && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        setSecurityToast(isOromo ? 'Iskiriinshoot dhowwaadha!' : 'Screenshot prohibited.');
        setTimeout(() => setSecurityToast(null), 3000);
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityToast(isOromo ? 'Mirgi-cuqaasaa dhowwaadha.' : 'Right-click disabled.');
      setTimeout(() => setSecurityToast(null), 2500);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [isOromo]);

  // Next / Previous Lesson calculation
  const currentLessonIndex = chapter.lessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentLessonIndex > 0 ? chapter.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < chapter.lessons.length - 1 ? chapter.lessons[currentLessonIndex + 1] : null;

  // PPT Presentation Slides Mock Content
  const pptSlides = [
    {
      title: `${lesson.title} - Overview`,
      subtitle: 'Key Educational Foundations & Objectives',
      bullets: [
        'Fundamental conceptual frameworks and international curriculum standard notation',
        'Identification of primary variables, core definitions, and operational equations',
        'Real-world context, Ethiopian regional applications, and entrance exam relevance',
        'Overview of procedural derivations to be reviewed in this lesson',
      ],
    },
    {
      title: 'Analytical Derivations & Principles',
      subtitle: 'Step-by-Step Mathematical & Theoretical Walkthrough',
      bullets: [
        'Mathematical formulation: Limiting conditions and continuity boundaries',
        'Simplification of multi-variable expressions and dimensional homogeneity',
        'Verification of edge cases: Asymptotes, critical values, and inflection points',
        'Structured solution algorithm applied to university test models',
      ],
    },
    {
      title: 'Practical Application & Experimental Context',
      subtitle: 'Connecting Abstract Theory to Real-World Case Studies',
      bullets: [
        'Experimental validation in modern laboratory environments',
        'Applied examples in engineering, medicine, economics, and environmental science',
        'Interpretation of visual diagrams, coordinate geometry, and graphs',
        'Comparative matrix of differing scholarly methodologies',
      ],
    },
    {
      title: 'National Entrance Exam (EUEE) Master Strategies',
      subtitle: 'Key Patterns & Shortcuts for High-Scoring Students',
      bullets: [
        'Fast elimination techniques for tricky multiple-choice options',
        'Common traps: Unit mismatches, sign errors, and false premise assumptions',
        'Time management: Recommended 90 seconds per computational question',
        'Review of 5-year trend questions from the Ethiopian Ministry of Education',
      ],
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative select-none space-y-6 pb-12"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Security Toast Notification */}
      {securityToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-rose-500/50 shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{securityToast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOP NAVIGATION & DRM STATUS BAR */}
      {/* ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <button
            onClick={onBackToCourse}
            className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-sky-600 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isOromo ? "Gara Boqonnaatti Deebi'i" : 'Back to Subject'}</span>
          </button>
          <span>/</span>
          <span className="text-slate-600 font-medium">{subject.grade}</span>
          <span>/</span>
          <span className="text-slate-600 font-medium">{subject.title.replace(/\s*\([^)]*\)/g, '').trim() || subject.title}</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">{chapter.title.split(':')[0]}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share Lesson Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs"
            title={isOromo ? 'Barnoota kana barattootaaf qoodaa' : 'Share this lesson with students'}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isOromo ? 'Qoodi' : 'Share Lesson'}</span>
          </button>

          {/* Admin Edit & Video Upload (Only Mr. Oda) */}
          {userRole === 'admin' && (
            <button
              onClick={() => {
                setEditLessonTitle(lesson.title);
                setEditLessonDesc(lesson.description || '');
                setEditLessonVideoUrl(lesson.videoUrl || '');
                setIsAdminEditModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs"
              title="Admin: Edit Lesson & Upload Video"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isOromo ? 'Gulaali / Fe\'i' : 'Edit / Upload'}</span>
            </button>
          )}

          {/* DRM Protected In-App Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 rounded-full border border-sky-200 text-[11px] font-bold">
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>DRM Protected</span>
          </div>

          <button
            onClick={() => markLessonComplete(lesson.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>{isCompleted ? (isOromo ? 'Xumurameera' : 'Completed') : (isOromo ? 'Xumureera' : 'Mark Complete')}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* HORIZONTAL SCROLLING LEARNING MODES BAR */}
      {/* ==================================================================== */}
      <div className="relative">
        <div className="overflow-x-auto pb-1 scrollbar-none flex items-center gap-3">
          {/* Option 1: Video Tutorial */}
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 border ${
              activeTab === 'video'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-sky-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Play className={`w-4 h-4 ${activeTab === 'video' ? 'text-sky-400 fill-sky-400' : 'text-sky-600'}`} />
            <span>{isOromo ? 'Vidiyoo Barnootaa (Video Tutorial)' : 'Video Tutorial'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
              {lesson.durationMinutes || 20} min
            </span>
          </button>

          {/* Option 2: Written Video / In-App Document Reader */}
          <button
            onClick={() => setActiveTab('written')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 border ${
              activeTab === 'written'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'written' ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>{isOromo ? 'Barreeffama Barnootaa (Written Video)' : 'Written Video & In-App Reader'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              PDF · PPT · HTML
            </span>
          </button>

          {/* Option 3: Timed Exam MCQs */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 border ${
              activeTab === 'quiz'
                ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${activeTab === 'quiz' ? 'text-purple-400' : 'text-purple-600'}`} />
            <span>{isOromo ? 'Qormaata Yeroon Daangeffame (Timed Exam)' : 'Timed Exam MCQs'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {lesson.quizQuestions?.length || 5} Qs
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MAIN LEARNING STAGE */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: VIDEO TUTORIAL */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              {!hasVideoSource ? (
                /* Pure zero-video state: Only parts uploaded by user are played - no auto borrowing! */
                <div className="rounded-2xl border-2 border-dashed border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 text-center text-white space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
                    <Video className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {lesson.title} · Part {lesson.partNumber || 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {userRole === 'admin'
                        ? "Vidiyoon Part Kanaaf Hin Fe'amne (Video Pending Upload)"
                        : (isOromo ? "Vidiyoon Part Kanaa Barsiisaadhaan Qophii Irra Jira" : "Video Tutorial in Production")}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {userRole === 'admin'
                        ? "Wanti ati feute qofti akka mul'atuuf systemichi ofumaan vidiyoo biraa akka hin fudhanne taasifameera. Vidiyoo part kanaa kallattiin sarara online (500GB+ Server Disk) irratti fe'uu dandeessu (Kuusaa bilbila keessanii 0 MB qabata)."
                        : (isOromo
                          ? "Vidiyoon barnoota kanaa barsiisaa Mr. Oda Workuutiin qophii irra jira. Hanga sanatti barreeffama barnootaa guutuu (Written Video & Lecture Notes) fi Qormaata Timed Exam amma hojjedhaa."
                          : "This specific lesson video is being prepared by Mr. Oda. In the meantime, study the full written notes and attempt the timed practice exam.")}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    {userRole === 'admin' && (
                      <button
                        onClick={() => setIsAdminEditModalOpen(true)}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Vidiyoo Part Kanaaf Kallattiin Fe'aa (Upload Video - 0 MB Phone)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('written')}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>{isOromo ? "Barreeffama Barnootaa Dubbisi (Read Notes)" : "Read Written Lecture Notes"}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz')}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      <span>{isOromo ? "Qormaata MCQ Hojjedhu (Exam)" : "Attempt Timed Quiz"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Video Player with Native HTML5 Controls (No custom control overlay) */
                <div
                  ref={videoContainerRef}
                  className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-slate-800"
                >
                  {/* YouTube / Google Drive Embed or HTML5 Video */}
                  {parsedVideo.type === 'youtube' || parsedVideo.type === 'googledrive' ? (
                    <iframe
                      key={parsedVideo.embedUrl}
                      src={parsedVideo.embedUrl}
                      title={lesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      key={effectiveVideoUrl}
                      src={effectiveVideoUrl}
                      controls
                      playsInline
                      preload="auto"
                      poster={lesson.videoPoster || '/videos/grade9_math_ch1_video_poster.jpg'}
                      onEnded={() => {
                        markLessonComplete(lesson.id);
                      }}
                      onError={() => {
                        const mediaErr = videoRef.current?.error;
                        if (!mediaErr || mediaErr.code === 1) return;
                        if (backupMirrorUrl && effectiveVideoUrl !== backupMirrorUrl) {
                          setActiveServer('server2');
                        }
                      }}
                      className="w-full h-full object-contain"
                    >
                      <source src={effectiveVideoUrl} type="video/mp4" />
                      {backupMirrorUrl && effectiveVideoUrl !== backupMirrorUrl && (
                        <source src={backupMirrorUrl} type="video/mp4" />
                      )}
                      {isOromo
                        ? 'Biraawuzeriin keessan fiidiyoo kana hin deeggaru.'
                        : 'Your browser does not support HTML5 video.'}
                    </video>
                  )}

                {/* Course Lock Overlay for Premium Chapters */}
                {!isLessonAccessible && (
                  <div
                    className="absolute inset-0 bg-slate-950/95 z-30 flex flex-col items-center justify-center p-6 text-center text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30 shadow-lg">
                      <Lock className="w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-2">
                      ODA EDUCATIONAL APP · PREMIUM LESSON
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold max-w-md">
                      {isOromo ? 'Barnoonni Kuni Cufamaadha' : 'This Chapter Lesson is Locked'}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
                      {isOromo
                        ? `Boqonnaa 1 barnoota tolaa (Free Preview) yoo ta'u, Boqonnaa ${chapter.chapterNumber || 2} fi kutaalee hundumaa banachuuf kaffaltii Telebirr ykn CBE dhaan (${subject.priceETB} ETB) xumuraa.`
                        : `Chapter 1 is free for evaluation. To unlock Chapter ${chapter.chapterNumber || 2} and all lessons for ${subject.title}, complete payment (${subject.priceETB} ETB) via Telebirr or CBE.`}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isOromo ? 'Koorsoo Bani (Telebirr / CBE)' : 'Unlock Course Access'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

              {/* Lesson Overview Description with Offline Toolbar */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                      Part {lesson.partNumber || 1}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {lesson.id}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      1080p Full HD
                    </span>
                  </div>

                  {/* Offline Storage Toolbar (Positioned cleanly outside the video) */}
                  <div className="flex items-center gap-2">
                    {isSavedOffline ? (
                      <button
                        onClick={() => setIsOfflineManagerOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
                        title={isOromo ? 'Fiidiyoon kuni offline kuufameera' : 'Video is cached locally'}
                      >
                        <WifiOff className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isOromo ? 'Offline Qophii' : 'Offline Ready'}</span>
                      </button>
                    ) : isDownloadingOffline ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-300 text-xs font-bold animate-pulse">
                        <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                        <span>{isOromo ? "Buufamaa jira..." : "Downloading..."} {downloadProgress}%</span>
                      </div>
                    ) : parsedVideo.type === 'youtube' || parsedVideo.type === 'googledrive' ? (
                      <button
                        onClick={() => {
                          showFeedback(
                            isOromo
                              ? "Vidiyoon kun sarara online irraa kallattiin taphata"
                              : "This video streams directly online",
                            "ℹ️"
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold transition-all shadow-xs"
                        title={isOromo ? 'Vidiyoon kun sarara irraa kallattiin taphata' : 'Streams online directly'}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                        <span>{parsedVideo.type === 'youtube' ? 'YouTube' : 'Drive'} Stream</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveOffline}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
                        title={isOromo ? 'Bilbila keessatti kuufadhu (Offline Playback)' : 'Download for offline playback'}
                      >
                        <DownloadCloud className="w-3.5 h-3.5 text-sky-600" />
                        <span>{isOromo ? 'Offline Buufadhu' : 'Save Offline'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setIsOfflineManagerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
                      title={isOromo ? 'Kuusaa Faayilii (File Manager)' : 'In-App Offline File Manager'}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isOromo ? 'Kuusaa' : 'Storage'}</span>
                    </button>

                    {/* Admin Edit & Video Upload Button for Mr. Oda */}
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          setEditLessonTitle(lesson.title);
                          setEditLessonDesc(lesson.description || '');
                          setEditLessonVideoUrl(lesson.videoUrl || '');
                          setEditUploadFeedback(null);
                          setIsAdminEditModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                        title={isOromo ? 'Admin: Vidiyoo Jijjiiri ykn Fe\'i (Mr. Oda Worku)' : 'Admin: Upload or Edit Video (Mr. Oda Worku)'}
                      >
                        <Video className="w-3.5 h-3.5 text-amber-200" />
                        <span>{isOromo ? "Gulaali & Fe'i" : 'Edit & Upload Video'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">{lesson.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{lesson.description}</p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: WRITTEN VIDEO (IN-APP READER: TEXT, HTML, PPT, PDF) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'written' && (
            !isLessonAccessible ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                  Z ACADEMY PREMIUM DOCUMENT
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {isOromo ? 'Barreeffamni Koorsoo Kuni Cufamaadha' : 'Written Notes & Documents are Locked'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isOromo
                    ? `Sanadoota, pawaarpooyintii, fi maree qormaataa Boqonnaa ${chapter.chapterNumber || 2} argachuuf Telebirr ykn CBE kaffalaa.`
                    : `To read lecture summaries, slides, and exam formulas for this chapter, unlock via Telebirr or CBE.`}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isOromo ? 'Koorsoo Bani (Telebirr / CBE)' : 'Unlock Course Access'}</span>
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Document Format Switcher Sub-Ribbon */}
              <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {isOromo ? 'Foommatoota Sanadaa (In-App Document Format):' : 'Select In-App Format:'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setWrittenFormat('text')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      writtenFormat === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Text Notes</span>
                  </button>

                  <button
                    onClick={() => setWrittenFormat('html')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      writtenFormat === 'html' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>HTML Lecture</span>
                  </button>

                  <button
                    onClick={() => setWrittenFormat('ppt')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      writtenFormat === 'ppt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>PPT Slides</span>
                  </button>

                  <button
                    onClick={() => setWrittenFormat('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      writtenFormat === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>PDF Reader</span>
                  </button>
                </div>
              </div>

              {/* STRICT IN-APP NOTICE: No Downloads to Device Storage */}
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">
                    {isOromo
                      ? 'Eegumsa IP: Sanadoonni appilikeeshinii keessatti qofa dubbifamu; meeshaa kee (device storage) irratti hin bu\'an.'
                      : 'Security Enforced: Content renders strictly in-app. Direct saving to device storage is disabled to protect proprietary educational material.'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded text-amber-950">
                  DRM Active
                </span>
              </div>

              {/* Sub-Format 1: Structured Text Notes */}
              {writtenFormat === 'text' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-sky-700 uppercase tracking-wider">
                        Curriculum Study Text
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">{lesson.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Part {lesson.partNumber || 1}</span>
                  </div>

                  <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                    {lesson.textNotes ? (
                      <div className="whitespace-pre-line text-slate-800 font-normal leading-relaxed">
                        {lesson.textNotes}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400">
                        Detailed study notes published in-app for this part.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sub-Format 2: HTML Formatted Lecture Document */}
              {writtenFormat === 'html' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        Interactive HTML Lecture Sheet
                      </span>
                      <h3 className="text-base sm:text-lg font-black mt-0.5">{lesson.title}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                      HTML
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <h4 className="font-black text-slate-900 text-sm">1. Core Axioms & Mathematical Definitions</h4>
                      <p>
                        In this section, we formulate the primary laws governing {lesson.title}. Every statement is structured according to national curriculum standards.
                      </p>
                    </div>

                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-2">
                      <h4 className="font-black text-sky-950 text-sm">2. Worked Derivations & Analytical Matrix</h4>
                      <p className="text-sky-900">
                        Let X be the continuous observable variable. The step derivation holds under standard conditions with zero boundary friction.
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-sky-200 font-mono text-xs text-sky-950">
                        ΔY = f'(x) · ΔX + o(ΔX) ⇒ lim (ΔX → 0) [ ΔY / ΔX ] = df/dx
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <h4 className="font-black text-emerald-950 text-sm">3. Practical Takeaway & Summary Checklist</h4>
                      <ul className="list-disc list-inside space-y-1 text-emerald-900 text-xs">
                        <li>Master the base definitions before starting exam problem calculations</li>
                        <li>Verify boundary values and ensure dimensional consistency of units</li>
                        <li>Review the associated video tutorial markers for visual proof</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Format 3: Interactive PPT Slide Deck */}
              {writtenFormat === 'ppt' && (
                <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-purple-400" />
                      <span className="font-bold uppercase tracking-wider text-purple-300">
                        In-App Lecture Slide Deck
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-400">
                      <span>Slide {currentPptSlide} of {pptSlides.length}</span>
                    </div>
                  </div>

                  {/* Active Slide Screen */}
                  <div className="bg-slate-900 rounded-xl p-6 sm:p-8 aspect-[16/9] border border-slate-800 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ODA PRESENTATION SERIES
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {pptSlides[currentPptSlide - 1].title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 font-medium">
                        {pptSlides[currentPptSlide - 1].subtitle}
                      </p>
                    </div>

                    <div className="space-y-3 py-4">
                      {pptSlides[currentPptSlide - 1].bullets.map((b, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                          <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{b}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                      <span>ODA EDUCATIONAL APP · Academic Slide Deck</span>
                      <span className="font-mono text-purple-400">Protected In-App Presentation</span>
                    </div>
                  </div>

                  {/* Slide Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentPptSlide(prev => Math.max(prev - 1, 1))}
                      disabled={currentPptSlide === 1}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Slide</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {pptSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPptSlide(idx + 1)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all ${
                            currentPptSlide === idx + 1
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPptSlide(prev => Math.min(prev + 1, pptSlides.length))}
                      disabled={currentPptSlide === pptSlides.length}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all"
                    >
                      <span>Next Slide</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-Format 4: In-App PDF Reader (Document Sheet) */}
              {writtenFormat === 'pdf' && (
                <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 space-y-4 border border-slate-300 shadow-inner">
                  {/* PDF Reader Toolbar */}
                  <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      <span className="font-bold">{lesson.title} - Official Textbook Page</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPdfZoom(prev => Math.max(prev - 10, 70))}
                          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs text-sky-300 w-12 text-center">{pdfZoom}%</span>
                        <button
                          onClick={() => setPdfZoom(prev => Math.min(prev + 10, 140))}
                          className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="h-4 w-px bg-slate-700" />

                      <div className="flex items-center gap-1 font-mono text-slate-300">
                        <button
                          onClick={() => setPdfPage(prev => Math.max(prev - 1, 1))}
                          disabled={pdfPage === 1}
                          className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span>Page {pdfPage} / 4</span>
                        <button
                          onClick={() => setPdfPage(prev => Math.min(prev + 1, 4))}
                          disabled={pdfPage === 4}
                          className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rendered PDF Page Sheet */}
                  <div className="bg-white rounded-xl shadow-xl p-8 sm:p-12 border border-slate-300 max-w-2xl mx-auto space-y-6 text-slate-900 transition-transform origin-top" style={{ transform: `scale(${pdfZoom / 100})` }}>
                    <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          ODA MINISTRY COMPLIANT CURRICULUM
                        </span>
                        <h2 className="text-xl font-black mt-0.5">{subject.title}</h2>
                      </div>
                      <span className="font-mono text-xs text-slate-500">DOC-REF: {subject.code}-P{pdfPage}</span>
                    </div>

                    <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                      <h3 className="text-sm font-bold text-slate-950 uppercase">
                        Section {pdfPage}.0 · Detailed Examination of {lesson.title}
                      </h3>
                      <p>
                        This textbook leaf contains verified formulas, standardized problem sets, and key theorem derivations. The content is protected under digital educational rights.
                      </p>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded font-mono text-[11px] text-slate-800">
                        // Key Identity:<br />
                        ∀ x ∈ ℝ, &nbsp; Ψ(x, t) = A · e^(i(kx - ωt))
                      </div>
                      <p>
                        Refer to the corresponding video lesson marker for synchronous video explanation. Ensure each practice equation is calculated step-by-step.
                      </p>
                    </div>

                    <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Confidential Copy Licensed to Student</span>
                      <span>Page {pdfPage} of 4</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attached Official Books & Study Material Uploaded by Admin */}
              {lesson.downloadables && lesson.downloadables.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      <span>Kitaabota & Sanadoota Dabalataa (Course Textbooks & Guides)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {lesson.downloadables.length} Available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {lesson.downloadables.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-800 truncate block">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {doc.fileSize} · {doc.type}
                            </span>
                          </div>
                        </div>

                        {doc.downloadUrl && doc.downloadUrl !== '#' ? (
                          <a
                            href={doc.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Bani</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-200 shrink-0">
                            In-App Reader
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: TIMED EXAM MCQS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'quiz' && (
            !isLessonAccessible ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                  Z ACADEMY MODEL EXAM
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {isOromo ? 'Qormaanni Boqonnaa Kuni Cufamaadha' : 'Timed Chapter Exam is Locked'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isOromo
                    ? `Qormaata Boqonnaa ${chapter.chapterNumber || 2} fi deebii isaanii ibsa guutuu wajjin hojjechuuf koorsicha banaa.`
                    : `To attempt the timed diagnostic exam and review full answer explanations, unlock via Telebirr or CBE.`}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isOromo ? 'Koorsoo Bani (Telebirr / CBE)' : 'Unlock Course Access'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <QuizExamRunner
                  lesson={lesson}
                  subject={subject}
                  onFinish={() => {
                    if (nextLesson) setSelectedLesson(nextLesson);
                  }}
                />
              </div>
            )
          )}

          {/* Bottom Next/Prev Lesson Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {prevLesson ? (
              <button
                onClick={() => setSelectedLesson(prevLesson)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-normal">Previous Part</span>
                  <span className="truncate max-w-[150px] inline-block">{prevLesson.title}</span>
                </div>
              </button>
            ) : <div />}

            {nextLesson ? (
              <button
                onClick={() => setSelectedLesson(nextLesson)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-950 rounded-xl hover:bg-slate-800 transition-colors shadow-md ml-auto"
              >
                <div className="text-right">
                  <span className="text-[10px] text-slate-300 block font-normal">Next Part</span>
                  <span className="truncate max-w-[150px] inline-block">{nextLesson.title}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : <div />}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT SIDEBAR: CHAPTER PARTS ROSTER */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
              Chapter Parts
            </h4>
            <p className="text-xs font-semibold text-slate-600 mb-3 truncate">{chapter.title}</p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {chapter.lessons.map((item, idx) => {
                const isSelected = item.id === lesson.id;
                const isDone = currentStudent.completedLessonIds.includes(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLesson(item)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-950 font-bold shadow-xs'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs">{item.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{item.durationMinutes || 20} min</span>
                        <span>· Video & In-App Reader</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Access Security Status Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Security Mode:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                DRM Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Screenshot prevention and watermarking are active for this student account.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        subject={subject}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* In-App Offline Media & File Manager Modal */}
      <OfflineFileManagerModal
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
        onPlayOfflineVideo={handlePlayFromOfflineManager}
        isOromo={isOromo}
      />

      {/* Admin Quick Video Upload & Lesson Editor Modal (Exclusive to Mr. Oda Worku) */}
      {isAdminEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-500/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isOromo ? 'Vidiyoo Barnootaa Fe\'i / Gulaali' : 'Edit Lesson & Upload Video'}
                  </h3>
                  <span className="text-xs text-amber-700 font-bold">Admin Portal · Mr. Oda Worku</span>
                </div>
              </div>
              <button
                onClick={() => setIsAdminEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateLesson(chapter.id, lesson.id, {
                  title: editLessonTitle.trim(),
                  description: editLessonDesc.trim(),
                  videoUrl: editLessonVideoUrl.trim(),
                });
                setSelectedLesson({
                  ...lesson,
                  title: editLessonTitle.trim(),
                  description: editLessonDesc.trim(),
                  videoUrl: editLessonVideoUrl.trim(),
                });
                setIsAdminEditModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-800 mb-1">Lesson Title:</label>
                <input
                  type="text"
                  required
                  value={editLessonTitle}
                  onChange={(e) => setEditLessonTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description:</label>
                <textarea
                  rows={2}
                  value={editLessonDesc}
                  onChange={(e) => setEditLessonDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Video File Upload */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>{isOromo ? 'Faayilii Vidiyoo Bilbila Irraa Fe\'aa:' : 'Upload Video File from Device:'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">MP4, WebM</span>
                </label>

                {/* Online Server Upload Guarantee */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isOromo
                        ? "Vidiyoon sarara online (Server) irratti ol-kaa'ama, kuusaa bilbilaa hin qabatu."
                        : "Video uploads directly to system cloud server - 0 MB device storage used."}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700 font-mono text-[11px] shrink-0">0 MB Phone</span>
                </div>

                <label className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all ${
                  isAdminUploading
                    ? 'border-amber-400 bg-amber-50/50 pointer-events-none'
                    : 'border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/50 text-amber-800 font-bold'
                }`}>
                  {isAdminUploading ? (
                    <div className="w-full space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>Gara 500 GB+ Server Diskitti Ol-Fe'amaa Jira...</span>
                        </span>
                        {adminUploadProgress && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-600" />
                            {adminUploadProgress.speedMBs} MB/s
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${adminUploadProgress?.percent || 0}%` }}
                        />
                      </div>

                      {adminUploadProgress && (
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Fe'ame: {adminUploadProgress.loadedMB} / {adminUploadProgress.totalMB} MB ({adminUploadProgress.percent}%)</span>
                          <span>Yeroo: {adminUploadProgress.etaSeconds > 0 ? `${adminUploadProgress.etaSeconds}s hafe` : 'Xumura...'}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span>{isOromo ? "Vidiyoo Sarara Online (500GB+ Cloud Disk) Irratti Fe'aa" : 'Upload Video to Online Server'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Kallattiin sarara online irratti kuufama (Bilbila irraa 0 MB)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    disabled={isAdminUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsAdminUploading(true);
                        setAdminUploadProgress(null);
                        setEditUploadFeedback(
                          isOromo
                            ? "Vidiyoon gara server online (500 GB+ storage) ol-fe'amaa jira..."
                            : "Uploading video to online server (500 GB+ disk)..."
                        );
                        try {
                          const uploadRes = await uploadVideoToOnlineServer(file, (prog) => {
                            setAdminUploadProgress(prog);
                          });
                          setEditLessonVideoUrl(uploadRes.videoUrl);
                          setEditUploadFeedback(
                            isOromo
                              ? `Vidiyoon sarara online systemii irratti milkaa'inaan ol-kaa'ameera! (${uploadRes.sizeMB} MB) - Kuusaa bilbila keessanii 0 MB qabate.`
                              : `Video uploaded to system cloud storage (${uploadRes.sizeMB} MB) - 0 MB phone storage used.`
                          );
                        } catch (err: any) {
                          setEditUploadFeedback(
                            isOromo
                              ? `Dogoggora: ${err?.message || 'Fe\'uu hin dandeenye'}`
                              : `Error: ${err?.message || 'Failed to upload'}`
                          );
                        } finally {
                          setIsAdminUploading(false);
                          setAdminUploadProgress(null);
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {editUploadFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{editUploadFeedback}</span>
                  </div>
                )}

                {/* Direct Video URL input & Clear option */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">Liinkii Vidiyoo (Direct URL / Server Path):</label>
                    {editLessonVideoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditLessonVideoUrl('');
                          setEditUploadFeedback("Vidiyoon part kana irraa dhabamsiifameera (Written only).");
                        }}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Vidiyoo Balleessi (Clear Video)
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editLessonVideoUrl}
                    onChange={(e) => {
                      setEditLessonVideoUrl(e.target.value);
                      setEditUploadFeedback(null);
                    }}
                    placeholder="Duwwaa dhiisaa yoo vidiyoo hin qabaanne, ykn URL galchaa..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs bg-white text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500">
                    * Hubachiisa: Yoo vidiyoon hin fe'amne duwwaa dhiisaa. Systemichi ofiin vidiyoo biraa tasa hin fudhatu!
                  </p>
                </div>

                {/* Live Preview */}
                {editLessonVideoUrl && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Preview:
                    </span>
                    <video
                      key={editLessonVideoUrl}
                      src={editLessonVideoUrl}
                      controls
                      playsInline
                      className="w-full max-h-40 rounded-xl bg-black border border-slate-300 object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  {isOromo ? 'Dhiisi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isOromo ? 'Olfayi / Save Video' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        chapterTitle={chapter.title}
        subjectId={subject.id}
        subjectTitle={subject.title}
        grade={subject.grade}
      />
    </div>
  );
};

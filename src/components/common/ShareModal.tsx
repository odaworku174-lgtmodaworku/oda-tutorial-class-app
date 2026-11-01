import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateQRMatrix } from '../../utils/qrCodeGenerator';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  QrCode,
  Smartphone,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId?: string;
  lessonTitle?: string;
  chapterTitle?: string;
  subjectId?: string;
  subjectTitle?: string;
  grade?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  chapterTitle,
  subjectId,
  subjectTitle,
  grade,
}) => {
  const { language } = useApp();
  const isOromo = language === 'om';

  const hasSpecificLesson = Boolean(lessonId && subjectId);
  const [shareTarget, setShareTarget] = useState<'lesson' | 'app'>(
    hasSpecificLesson ? 'lesson' : 'app'
  );
  const [copied, setCopied] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  // The verified Public Website Shared URL that works on ANY other device without Google AI Studio login
  const CANONICAL_PUBLIC_URL = 'https://ais-pre-oqjs24ppi5xggxhuyoyjxh-63446449139.europe-west2.run.app';

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return CANONICAL_PUBLIC_URL;
    const origin = window.location.origin;
    // In Google AI Studio, developer preview URLs begin with 'ais-dev-'.
    // Other devices CANNOT open 'ais-dev-' because it is locked to the developer's Google login.
    // Converting 'ais-dev-' to 'ais-pre-' yields the public website URL that opens on any phone/PC!
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return CANONICAL_PUBLIC_URL;
    }
    return origin;
  }, []);

  const shareUrl = useMemo(() => {
    if (shareTarget === 'lesson' && hasSpecificLesson) {
      const params = new URLSearchParams();
      if (grade) params.set('grade', grade);
      if (subjectId) params.set('subject', subjectId);
      if (lessonId) params.set('lesson', lessonId);
      return `${baseUrl}/?${params.toString()}`;
    }
    return `${baseUrl}/`;
  }, [baseUrl, shareTarget, hasSpecificLesson, grade, subjectId, lessonId]);

  const shareMessage = useMemo(() => {
    if (shareTarget === 'lesson' && lessonTitle) {
      return isOromo
        ? `📚 ODA EDUCATIONAL APP - Barnoota Haaraa!\n\nBarnoota: "${lessonTitle}"\nKutaa: ${grade || ''} | ${subjectTitle || ''}\nBarsiisaa: Mr. Oda Worku\n\nKallattiin asirraa eegalaa:\n${shareUrl}`
        : `📚 ODA EDUCATIONAL APP - New Lesson Published!\n\nLesson: "${lessonTitle}"\nGrade: ${grade || ''} | ${subjectTitle || ''}\nInstructor: Mr. Oda Worku\n\nWatch and learn now:\n${shareUrl}`;
    }

    return isOromo
      ? `🎓 ODA EDUCATIONAL APP (Mr. Oda Worku)\n\nBarnoota Kutaa 9–12 fi Yuunivarsitii (STEM & Social Science), fiidiyoowwan, qormaata qophii EUEE fi nootiiwwan guutuu asirraa argattu.\n\nAmma itti dabalamaa:\n${shareUrl}`
      : `🎓 ODA EDUCATIONAL APP (Mr. Oda Worku)\n\nComprehensive Ethiopian Curriculum for Grades 9–12 & Freshman University. Video lessons, notes, and entrance exam preparation.\n\nOpen app now:\n${shareUrl}`;
  }, [shareTarget, lessonTitle, grade, subjectTitle, shareUrl, isOromo]);

  const qrData = useMemo(() => {
    try {
      return generateQRMatrix(shareUrl);
    } catch (e) {
      return null;
    }
  }, [shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ODA EDUCATIONAL APP',
          text: shareMessage,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const shareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  const shareSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(shareMessage)}`;
    window.location.href = smsUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Share2 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isOromo ? 'Appii & Barnoota Qoodaa' : 'Share App & Lessons'}
              </h3>
              <p className="text-xs text-sky-200/80 mt-0.5">
                {isOromo
                  ? 'Barattootaaf Telegram, WhatsApp fi Liinkiin qoodaa'
                  : 'Share with students via Telegram, WhatsApp, or Link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-800">
          {/* Target Toggle if from specific lesson */}
          {hasSpecificLesson && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setShareTarget('lesson')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  shareTarget === 'lesson'
                    ? 'bg-white text-sky-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOromo ? 'Fiidiyoo Barnootaa Kana Qoodi' : 'Share This Video Lesson'}
              </button>
              <button
                onClick={() => setShareTarget('app')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  shareTarget === 'app'
                    ? 'bg-white text-sky-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isOromo ? 'Appii Guutuu Qoodi' : 'Share Entire App'}
              </button>
            </div>
          )}

          {/* Lesson Banner Card if sharing lesson */}
          {shareTarget === 'lesson' && lessonTitle && (
            <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ▶
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                  {grade} · {subjectTitle}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {lessonTitle}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {chapterTitle}
                </p>
              </div>
            </div>
          )}

          {/* Public Website Mode Explainer */}
          <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-300 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-700" />
                <span className="text-xs font-black text-sky-950 uppercase tracking-wide">
                  {isOromo ? "Liinkii Websaayitii Qulqulluu (Public Website Link)" : "Public Educational Website Link"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {isOromo ? "Bilbila Biraaf Banaa" : "All Devices Ready"}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isOromo
                ? "Liinkiin kun bilbila kamiyyuu fi kompiitara kamiyyuu irratti akka website guutuutti kallattiin banaa ta'ee hojjata. Barattoonni login malee kutaalee 9–12 fi barnoota tolaa (Chapter 1 Free Preview) hundumaa daawwatu!"
                : "This link works directly as a full educational website on any smartphone, tablet, or PC without Google authentication. Students can instantly explore grades 9-12 and watch free preview lectures!"}
            </p>
          </div>

          {/* Student-only guarantee note */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {isOromo ? "Qoodiinsa Barattootaa Qulqulluu (Student Safe Link)" : "Student-Protected Share Link"}
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                {isOromo
                  ? "Liinkiin qoodamu kun barattoota qofaaf kan qophaa'eedha. Buttooni bulchiinsaa (admin) barattootaaf gonkumaa hin mul'atu; wanti adminiin upload godhe hundi garuu guutummaatti barattoota biraan gaha."
                  : "This link is designed strictly for students. Administrative buttons remain invisible to them, while all videos, notes, and study materials uploaded by admin are delivered completely."}
              </p>
            </div>
          </div>

          {/* One-Tap Share Action Grid (Popular Ethiopian Channels) */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {isOromo ? 'Karaa Kallattiin Qoodaa:' : 'Instant Share Channels:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Telegram */}
              <button
                onClick={shareTelegram}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#24A1DE] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Send className="w-4 h-4 translate-x-[-1px] translate-y-[-1px]" />
                </div>
                <span className="text-xs font-bold">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareWhatsApp}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareFacebook}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                  f
                </div>
                <span className="text-xs font-bold">Facebook</span>
              </button>

              {/* SMS / Mobile */}
              <button
                onClick={shareSMS}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">SMS Bilbilaa</span>
              </button>
            </div>
          </div>

          {/* Direct Link Copy Field */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              {isOromo ? 'Liinkii Kallattii (Direct Link):' : 'Direct Link:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isOromo ? 'Koppii Ta\'eera!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isOromo ? 'Koppii Godhi' : 'Copy Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code Section for In-Person Student Scanning */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-700" />
                <span className="text-xs font-bold text-slate-900">
                  {isOromo ? 'QR Code Kaameeraan Iskaan Godhaa' : 'Scan QR Code with Phone Camera'}
                </span>
              </div>
              <button
                onClick={() => setShowQrExpanded(!showQrExpanded)}
                className="text-xs text-sky-700 font-semibold hover:underline"
              >
                {showQrExpanded ? (isOromo ? 'Xiqqeessi' : 'Collapse') : (isOromo ? 'Guddisi' : 'Expand')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {qrData && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <svg
                    viewBox={`0 0 ${qrData.size} ${qrData.size}`}
                    className={showQrExpanded ? 'w-48 h-48 sm:w-56 sm:h-56' : 'w-24 h-24'}
                    shapeRendering="crispEdges"
                  >
                    <rect width="100%" height="100%" fill="#ffffff" />
                    {qrData.matrix.map((row, r) =>
                      row.map((cell, c) =>
                        cell ? (
                          <rect
                            key={`${r}-${c}`}
                            x={c}
                            y={r}
                            width="1"
                            height="1"
                            fill="#0f172a"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                </div>
              )}

              <div className="text-xs text-slate-600 space-y-1 text-center sm:text-left">
                <p className="font-semibold text-slate-800">
                  {isOromo
                    ? 'Barattoonni bilbila isaaniitiin kaameeraa bananii koodii kana yoo scan godhan, kallattiin appii fi fiidiyoo kana argatu.'
                    : 'Students can point their mobile phone camera at this QR code to instantly open this lesson or app without typing.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isOromo ? 'Kutaa keessatti yookaan fakkii print godhame irratti fayyadamaa.' : 'Great for displaying on projector or sharing in class.'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Native Share Sheet Button if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{isOromo ? 'Karaa Biroo Qoodi (Share Sheet)' : 'More Share Options'}</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            ODA EDUCATIONAL APP · Mr. Oda Worku Educational Platform
          </span>
        </div>
      </div>
    </div>
  );
};

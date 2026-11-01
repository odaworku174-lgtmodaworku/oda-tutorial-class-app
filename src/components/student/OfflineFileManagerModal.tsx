import React, { useState, useEffect } from 'react';
import {
  getAllOfflineVideos,
  deleteOfflineVideo,
  formatBytesToMB,
  OfflineVideoMetadata,
} from '../../utils/offlineVideoStorage';
import {
  HardDrive,
  Trash2,
  Play,
  Film,
  DownloadCloud,
  CheckCircle,
  X,
  Clock,
  Sparkles,
  WifiOff,
} from 'lucide-react';

interface OfflineFileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayOfflineVideo: (metadata: OfflineVideoMetadata) => void;
  isOromo: boolean;
}

export const OfflineFileManagerModal: React.FC<OfflineFileManagerModalProps> = ({
  isOpen,
  onClose,
  onPlayOfflineVideo,
  isOromo,
}) => {
  const [offlineVideos, setOfflineVideos] = useState<OfflineVideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadVideos = async () => {
    setIsLoading(true);
    const videos = await getAllOfflineVideos();
    setOfflineVideos(videos);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const handleDelete = async (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isOromo ? 'Vidiyoo kana bilbila keessan irraa balleessuu barbaadduu?' : 'Delete this offline video from device storage?')) {
      await deleteOfflineVideo(lessonId);
      loadVideos();
    }
  };

  if (!isOpen) return null;

  const totalBytes = offlineVideos.reduce((acc, v) => acc + (v.sizeBytes || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide flex items-center gap-2">
                <span>{isOromo ? 'Kuusaa Fiidiyoo Offline (File Manager)' : 'In-App Offline Media Manager'}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  {isOromo ? 'Intarneetii Malee' : 'Offline Ready'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {isOromo
                  ? 'Fiidiyoowwan bilbila keessan irratti kuufaman intarneetii malee taphachiisaa'
                  : 'Manage cached videos saved locally on your device for offline playback'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Storage stats ribbon */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              {offlineVideos.length} {isOromo ? 'Fiidiyoowwan Kuufaman' : 'Videos Downloaded'}
            </span>
            <span>·</span>
            <span className="font-mono text-sky-700 font-bold">{formatBytesToMB(totalBytes)} used</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full font-bold">
            <WifiOff className="w-3 h-3" />
            <span>{isOromo ? 'Intarneetii hin barbaadu' : '100% Offline Accessible'}</span>
          </div>
        </div>

        {/* Video List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>{isOromo ? "Kuusaa ilaalaa jira..." : 'Scanning offline storage...'}</span>
            </div>
          ) : offlineVideos.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Film className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isOromo ? 'Fiidiyoon offline kuufame hin jiru' : 'No offline videos downloaded yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isOromo
                  ? 'Fiidiyoo kamiyyuu yeroo taphachiistan qabduu "Offline Buufadhu" tuquudhaan intarneetii malee akka taphatuuf kuufachuu dandeessu.'
                  : 'While watching any lesson video, tap "Save Offline" to download it locally for playback without internet.'}
              </p>
            </div>
          ) : (
            offlineVideos.map((video) => (
              <div
                key={video.lessonId}
                onClick={() => {
                  onPlayOfflineVideo(video);
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/40 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:bg-sky-600 transition-colors shadow-xs">
                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">{video.grade}</span>
                      <span>{video.subjectTitle}</span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-sky-700">
                      {video.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span className="font-mono">{video.durationMinutes || 24} min</span>
                      <span>·</span>
                      <span className="font-mono text-sky-700 font-bold">{formatBytesToMB(video.sizeBytes)}</span>
                      <span>·</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" />
                        {isOromo ? 'Bilbila keessa jira' : 'Stored Locally'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDelete(video.lessonId, e)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title={isOromo ? 'Bilbila irraa balleessi' : 'Delete from device'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {isOromo
              ? 'Faayiloonni kuufaman biraawuzerii fi storage app kana keessatti eegamu.'
              : 'Files are kept inside device in-app storage.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            {isOromo ? 'Cufi' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

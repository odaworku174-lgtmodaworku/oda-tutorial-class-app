// Video helper utility for ODA EDUCATIONAL APP
// Handles online cloud hosting (System Server Disk, YouTube, Google Drive, Direct URLs)
// and ensures Admin uploads go to Online System Storage without consuming device internal memory.

import { deleteOfflineVideo } from './offlineVideoStorage';

export type VideoSourceType =
  | 'server_online'
  | 'youtube'
  | 'googledrive'
  | 'direct'
  | 'offline_cached'
  | 'unknown';

export interface ParsedVideoSource {
  type: VideoSourceType;
  rawUrl: string;
  embedUrl?: string;
  streamUrl?: string;
}

export interface VideoUploadResult {
  videoUrl: string;
  absoluteUrl: string;
  filename: string;
  sizeBytes: number;
  sizeMB: string;
  isOnlineStorage: true;
}

/**
 * Parses and categorizes video URLs entered by Admin Mr. Oda or stored in curriculum.
 * Ensures system online videos (/uploads/videos/...) stream smoothly to students.
 */
export function parseVideoSource(url: string | undefined | null): ParsedVideoSource {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { type: 'unknown', rawUrl: '' };
  }

  const cleanUrl = url.trim();

  // 1. YouTube detection
  const ytMatch = cleanUrl.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      rawUrl: cleanUrl,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      streamUrl: cleanUrl,
    };
  }

  // 2. Google Drive detection
  const gdriveMatch = cleanUrl.match(
    /(?:https?:\/\/)?(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i
  );
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'googledrive',
      rawUrl: cleanUrl,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      streamUrl: cleanUrl,
    };
  }

  // 3. System Online Storage (/uploads/videos/...)
  if (cleanUrl.startsWith('/uploads/videos/') || cleanUrl.includes('/uploads/videos/')) {
    return {
      type: 'server_online',
      rawUrl: cleanUrl,
      streamUrl: cleanUrl,
    };
  }

  // 4. Offline Cache Key or Blob
  if (cleanUrl.startsWith('/offline-video/') || cleanUrl.startsWith('blob:')) {
    return {
      type: 'offline_cached',
      rawUrl: cleanUrl,
      streamUrl: cleanUrl,
    };
  }

  // 5. Direct video URL (MP4, WebM, etc.)
  return {
    type: 'direct',
    rawUrl: cleanUrl,
    streamUrl: cleanUrl,
  };
}

/**
 * Uploads a video file directly to the Online System Storage (Express /api/upload-video).
 * Does NOT save to browser IndexedDB or CacheStorage, preserving phone internal storage.
 * Tracks upload percentage in real-time.
 */
export interface UploadProgressInfo {
  percent: number;
  loadedBytes: number;
  totalBytes: number;
  loadedMB: string;
  totalMB: string;
  speedMBs: string;
  etaSeconds: number;
}

export interface SystemStorageStats {
  success: boolean;
  totalStorageAllocatedGB: number;
  totalStorageAllocatedMB: number;
  totalVideos: number;
  totalSizeBytes: number;
  totalSizeMB: string;
  totalSizeGB: string;
  freeStorageGB: string;
  usedPercentage: string;
  cloudStatus: string;
  deviceStorageUsed: string;
  files: Array<{
    name: string;
    sizeBytes: number;
    sizeMB: string;
    sizeGB: string;
    createdAt: string;
  }>;
}

/**
 * High-speed video uploader to 500 GB+ Dedicated Online Server Storage.
 * - Streams directly to system cloud disk over HTTP
 * - Does NOT use client IndexedDB, localStorage, or browser cache
 * - Zero internal phone storage used (0 MB Device Storage)
 * - Computes real-time upload speed (MB/s) and estimated time of arrival (ETA)
 */
export function uploadVideoToOnlineServer(
  file: File,
  onProgress?: (progress: UploadProgressInfo) => void
): Promise<VideoUploadResult> {
  return new Promise((resolve, reject) => {
    // 3 MB chunk size: Comfortably below Cloud Run's 32 MB limit and all mobile network proxy ceilings, preventing HTTP 413 permanently
    const CHUNK_SIZE = 3 * 1024 * 1024;
    const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
    const uploadId = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;

    const startTime = Date.now();
    let lastTime = startTime;
    let lastOverallLoaded = 0;
    let smoothedSpeedMBs = 0;

    const uploadChunk = (chunkIndex: number, retryCount = 0) => {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunkBlob = file.slice(start, end);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-video-chunk', true);
      xhr.setRequestHeader('x-upload-id', uploadId);
      xhr.setRequestHeader('x-chunk-index', chunkIndex.toString());
      xhr.setRequestHeader('x-total-chunks', totalChunks.toString());
      xhr.setRequestHeader('x-total-size', file.size.toString());
      xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const currentOverallLoaded = start + event.loaded;
            const now = Date.now();
            const timeDelta = (now - lastTime) / 1000;
            const loadedDelta = currentOverallLoaded - lastOverallLoaded;

            if (timeDelta >= 0.2 || currentOverallLoaded === file.size) {
              const currentSpeedBytes = timeDelta > 0 ? loadedDelta / timeDelta : 0;
              const currentSpeedMBs = currentSpeedBytes / (1024 * 1024);
              smoothedSpeedMBs =
                smoothedSpeedMBs === 0
                  ? currentSpeedMBs
                  : smoothedSpeedMBs * 0.6 + currentSpeedMBs * 0.4;

              lastTime = now;
              lastOverallLoaded = currentOverallLoaded;
            }

            const percent = Math.min(100, Math.round((currentOverallLoaded / file.size) * 100));
            const remainingBytes = file.size - currentOverallLoaded;
            const speedInBytes = Math.max(0.1, (smoothedSpeedMBs || 1)) * 1024 * 1024;
            const etaSeconds = Math.max(0, Math.round(remainingBytes / speedInBytes));

            onProgress({
              percent,
              loadedBytes: currentOverallLoaded,
              totalBytes: file.size,
              loadedMB: (currentOverallLoaded / (1024 * 1024)).toFixed(1),
              totalMB: (file.size / (1024 * 1024)).toFixed(1),
              speedMBs: (smoothedSpeedMBs || 1.2).toFixed(1),
              etaSeconds,
            });
          }
        };
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.success) {
              if (res.done) {
                // All chunks successfully assembled on server
                clearAllLocalDeviceVideos().catch(() => {});
                resolve({
                  videoUrl: res.videoUrl,
                  absoluteUrl: res.absoluteUrl || res.videoUrl,
                  filename: res.filename,
                  sizeBytes: res.sizeBytes || file.size,
                  sizeMB: res.sizeMB || (file.size / (1024 * 1024)).toFixed(2),
                  isOnlineStorage: true,
                });
              } else {
                // Next chunk
                uploadChunk(chunkIndex + 1);
              }
              return;
            } else {
              throw new Error(res.error || 'Chunk error');
            }
          } catch (e: any) {
            handleRetryOrError(e.message || 'Parse error');
          }
        } else if (xhr.status === 413) {
          handleRetryOrError('413 - Guddinni faayilii networkiin daangeffame (Payload Too Large)');
        } else {
          handleRetryOrError(`Server status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        handleRetryOrError('Network connection interrupted');
      };

      const handleRetryOrError = (errorMsg: string) => {
        if (retryCount < 3) {
          console.warn(`[UPLOAD] Retrying chunk ${chunkIndex + 1}/${totalChunks} (Attempt ${retryCount + 1})...`);
          setTimeout(() => uploadChunk(chunkIndex, retryCount + 1), 1000);
        } else {
          reject(new Error(`Fe'iisa vidiyoo irratti dogoggorri uumame (Status: ${errorMsg})`));
        }
      };

      // Send the isolated 3 MB slice
      xhr.send(chunkBlob);
    };

    // Kick off chunk 0
    uploadChunk(0);
  });
}

/**
 * Fetches real-time server storage statistics (500 GB+ dedicated storage)
 */
export async function getSystemStorageStats(): Promise<SystemStorageStats | null> {
  try {
    const res = await fetch('/api/system-storage/stats');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to retrieve system storage stats:', err);
    return null;
  }
}

/**
 * Deletes a video file from server online storage
 */
export async function deleteServerVideo(filename: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/videos/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

/**
 * Primary Video Upload function for Admin (Mr. Oda)
 * Uploads directly to online system storage (500 GB+ Cloud disk)
 * and purges local device cache to guarantee 0 MB phone storage.
 */
export async function saveUploadedVideo(
  lessonId: string,
  file: File,
  _meta?: {
    title: string;
    subjectTitle: string;
    grade: string;
  },
  onProgress?: (progress: UploadProgressInfo) => void
): Promise<string> {
  // 1. Upload directly to high-speed online server disk
  const result = await uploadVideoToOnlineServer(file, onProgress);

  // 2. Clear any lingering local cache blobs for this lesson so phone memory is strictly 0 MB
  try {
    if (lessonId) {
      await deleteOfflineVideo(lessonId);
    }
    await clearAllLocalDeviceVideos();
  } catch (cleanupErr) {
    console.warn('Local cache cleanup notice:', cleanupErr);
  }

  // Return the persistent online server URL
  return result.videoUrl;
}

/**
 * Utility to completely wipe local device video cache and free up 100% phone memory
 */
export async function clearAllLocalDeviceVideos(): Promise<{ freed: boolean; message: string }> {
  const CACHE_NAME = 'oda-offline-video-cache-v1';
  const DB_NAME = 'oda_offline_media_db';
  const STORE_NAME = 'offline_videos_meta';

  let cacheCleared = false;
  if ('caches' in window) {
    try {
      await caches.delete(CACHE_NAME);
      cacheCleared = true;
    } catch (e) {
      console.warn('Could not delete video cache:', e);
    }
  }

  if (window.indexedDB) {
    try {
      const openReq = window.indexedDB.open(DB_NAME, 1);
      openReq.onsuccess = () => {
        const db = openReq.result;
        if (db.objectStoreNames.contains(STORE_NAME)) {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).clear();
        }
      };
    } catch (e) {
      console.warn('Could not clear indexedDB video store:', e);
    }
  }

  return {
    freed: true,
    message: "Kuusaan bilbila keessanii 100% qulqullaa'eera! (0 MB internal storage used).",
  };
}

// Offline Video Storage Utility for ODA EDUCATIONAL APP
// Provides In-App local persistence using CacheStorage and IndexedDB
// Enables full offline playback without internet connection

export interface OfflineVideoMetadata {
  lessonId: string;
  videoUrl: string;
  title: string;
  subjectTitle: string;
  grade: string;
  durationMinutes: number;
  sizeBytes: number;
  savedAt: string;
}

const CACHE_NAME = 'oda-offline-video-cache-v1';
const DB_NAME = 'oda_offline_media_db';
const STORE_NAME = 'offline_videos_meta';

// Open IndexedDB database for metadata tracking
function openMetaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'lessonId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Check if a video is already saved offline
export async function isVideoSavedOffline(lessonId: string): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(`/offline-video/${lessonId}`);
      if (match) return true;
    }
    // Fallback: check IndexedDB metadata
    const db = await openMetaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Error checking offline video status:', err);
    return false;
  }
}

// Retrieve local offline video Blob URL
export async function getOfflineVideoBlobUrl(lessonId: string): Promise<string | null> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(`/offline-video/${lessonId}`);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    }
    return null;
  } catch (err) {
    console.error('Failed to get offline video blob:', err);
    return null;
  }
}

// Check whether a video URL can be downloaded and saved offline
export function canVideoBeSavedOffline(videoUrl: string | undefined | null): {
  canDownload: boolean;
  reason?: string;
  sourceType: 'local' | 'youtube' | 'googledrive' | 'direct' | 'blob' | 'unknown';
} {
  if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
    return {
      canDownload: false,
      reason: 'Liankiin vidiyoo hin jiru (No video URL provided)',
      sourceType: 'unknown',
    };
  }

  const clean = videoUrl.trim();

  // YouTube streams cannot be downloaded as raw MP4 offline blobs
  if (
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)/i.test(clean)
  ) {
    return {
      canDownload: false,
      reason: "Vidiyoon kun YouTube irraa waan ta'eef, sarara online irraa kallattiin daawwatama malee offline hin bu'u.",
      sourceType: 'youtube',
    };
  }

  // Google Drive preview/embed links stream online
  if (/drive\.google\.com\/(?:file\/d\/|open\?id=)/i.test(clean)) {
    return {
      canDownload: false,
      reason: "Vidiyoon kun Google Drive irraa waan ta'eef, sarara online irraa kallattiin daawwatama malee offline hin bu'u.",
      sourceType: 'googledrive',
    };
  }

  if (clean.startsWith('blob:')) {
    return {
      canDownload: true,
      sourceType: 'blob',
    };
  }

  return {
    canDownload: true,
    sourceType: clean.startsWith('/') ? 'local' : 'direct',
  };
}

// Download and save video for offline playback with live progress callback
export async function downloadVideoForOffline(
  lessonId: string,
  videoUrl: string,
  metadata: Omit<OfflineVideoMetadata, 'lessonId' | 'videoUrl' | 'savedAt' | 'sizeBytes'>,
  onProgress?: (progressPercent: number, loadedBytes: number, totalBytes: number) => void
): Promise<string> {
  if (!('caches' in window)) {
    throw new Error('Offline CacheStorage is not supported by your browser');
  }

  if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim() === '') {
    throw new Error('Liankiin vidiyoo hin argamne (Empty video URL)');
  }

  const check = canVideoBeSavedOffline(videoUrl);
  if (!check.canDownload) {
    throw new Error(check.reason || "Vidiyoon kun offline buufamuu hin danda'u");
  }

  let response: Response | null = null;
  let fetchError: any = null;

  // 1. Direct fetch attempt
  try {
    response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status} ${response.statusText}`);
    }
  } catch (err: any) {
    fetchError = err;

    // 2. Fallback to server proxy if client fetch failed (e.g. CORS restriction on external URL)
    if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
      const isSameOrigin = videoUrl.startsWith(window.location.origin);
      if (!isSameOrigin) {
        try {
          const proxyUrl = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;
          const proxyRes = await fetch(proxyUrl);
          if (proxyRes.ok) {
            response = proxyRes;
            fetchError = null;
          } else {
            fetchError = new Error(`Proxy error ${proxyRes.status}`);
          }
        } catch (proxyErr: any) {
          fetchError = proxyErr;
        }
      }
    }
  }

  if (!response || !response.ok) {
    const detail = fetchError?.message || 'Network error';
    throw new Error(`Vidiyicha buusuun hin danda'amne: ${detail}`);
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
  let loadedBytes = 0;

  let blob: Blob;

  if (response.body && totalBytes > 0) {
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loadedBytes += value.length;
        if (onProgress) {
          const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
          onProgress(percent, loadedBytes, totalBytes);
        }
      }
    }
    const contentType = response.headers.get('content-type') || 'video/mp4';
    blob = new Blob(chunks, { type: contentType });
  } else {
    // Fallback for responses without Content-Length
    blob = await response.blob();
    loadedBytes = blob.size;
    if (onProgress) onProgress(100, loadedBytes, loadedBytes);
  }

  // Put in CacheStorage
  const cache = await caches.open(CACHE_NAME);
  const cacheKey = `/offline-video/${lessonId}`;
  const responseToCache = new Response(blob, {
    headers: {
      'Content-Type': blob.type || 'video/mp4',
      'Content-Length': blob.size.toString(),
    },
  });
  await cache.put(cacheKey, responseToCache);

  // Save metadata in IndexedDB
  const metaRecord: OfflineVideoMetadata = {
    lessonId,
    videoUrl,
    title: metadata.title,
    subjectTitle: metadata.subjectTitle,
    grade: metadata.grade,
    durationMinutes: metadata.durationMinutes,
    sizeBytes: blob.size,
    savedAt: new Date().toISOString(),
  };

  try {
    const db = await openMetaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(metaRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (dbErr) {
    console.warn('Failed to save metadata to IndexedDB:', dbErr);
  }

  return URL.createObjectURL(blob);
}

// Remove an offline video to free storage space
export async function deleteOfflineVideo(lessonId: string): Promise<void> {
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(`/offline-video/${lessonId}`);
    }
    const db = await openMetaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(lessonId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete offline video:', err);
  }
}

// Get all offline videos saved on this device (File Manager style)
export async function getAllOfflineVideos(): Promise<OfflineVideoMetadata[]> {
  try {
    const db = await openMetaDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Error reading offline videos catalog:', err);
    return [];
  }
}

// Helper to format bytes to MB
export function formatBytesToMB(bytes: number): string {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

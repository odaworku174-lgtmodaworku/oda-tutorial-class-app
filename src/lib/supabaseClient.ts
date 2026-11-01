import { createClient } from '@supabase/supabase-js';

// Supabase client instance
// If environment variables are configured in .env, connects directly to Supabase Cloud;
// In all environments, the central Express Cloud Database serves as the unified authoritative store.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://oda-tutorial-class.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const isSupabaseConfigured = Boolean(
  (import.meta as any).env?.VITE_SUPABASE_URL && 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface CloudSyncStatus {
  isSupabaseConnected: boolean;
  isServerConnected: boolean;
  isRealtimeActive: boolean;
  lastSyncedAt: string | null;
  serverVersion: number;
}

/**
 * Subscribes to live database changes:
 * 1. Checks Supabase Realtime channel if configured
 * 2. Uses Server-Sent Events (SSE) `/api/curriculum/events` connected to the central database
 * 3. Binds window focus & visibility listeners for instant revalidation
 */
export function setupRealtimeSync(options: {
  onCurriculumUpdate: () => void;
  onPricingUpdate: () => void;
  onStudentAccessUpdate?: (payload: any) => void;
  onStatusChange?: (status: { sseConnected: boolean; supabaseConnected: boolean }) => void;
}): () => void {
  let sseSource: EventSource | null = null;
  let sseConnected = false;
  let supabaseChannel: any = null;

  // 1. Supabase Realtime Channel
  if (isSupabaseConfigured) {
    try {
      supabaseChannel = supabase
        .channel('oda_realtime_curriculum')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, () => {
          options.onCurriculumUpdate();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters' }, () => {
          options.onCurriculumUpdate();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
          options.onCurriculumUpdate();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_settings' }, () => {
          options.onPricingUpdate();
        })
        .subscribe((status) => {
          if (options.onStatusChange) {
            options.onStatusChange({ sseConnected, supabaseConnected: status === 'SUBSCRIBED' });
          }
        });
    } catch (e) {
      console.warn('[ODA SYNC] Supabase Realtime notice:', e);
    }
  }

  // 2. Central Cloud Server-Sent Events (SSE) Stream
  try {
    sseSource = new EventSource('/api/curriculum/events');

    sseSource.addEventListener('connected', () => {
      sseConnected = true;
      if (options.onStatusChange) {
        options.onStatusChange({ sseConnected: true, supabaseConnected: isSupabaseConfigured });
      }
    });

    sseSource.addEventListener('curriculum_updated', () => {
      console.log('[ODA SYNC] Realtime curriculum update received via SSE');
      options.onCurriculumUpdate();
    });

    sseSource.addEventListener('payment_settings_updated', () => {
      console.log('[ODA SYNC] Realtime payment settings update received via SSE');
      options.onPricingUpdate();
    });

    sseSource.addEventListener('payment_status_changed', (evt: MessageEvent) => {
      try {
        const parsed = JSON.parse(evt.data);
        if (options.onStudentAccessUpdate) options.onStudentAccessUpdate(parsed.payload);
      } catch {}
    });

    sseSource.onerror = () => {
      sseConnected = false;
      if (options.onStatusChange) {
        options.onStatusChange({ sseConnected: false, supabaseConnected: isSupabaseConfigured });
      }
    };
  } catch (err) {
    console.warn('[ODA SYNC] SSE connection notice:', err);
  }

  // 3. Tab Visibility & Window Focus Auto-Revalidation
  const handleFocusOrVisible = () => {
    if (document.visibilityState === 'visible') {
      options.onCurriculumUpdate();
      options.onPricingUpdate();
    }
  };

  window.addEventListener('focus', handleFocusOrVisible);
  document.addEventListener('visibilitychange', handleFocusOrVisible);

  // Return cleanup function
  return () => {
    if (sseSource) {
      sseSource.close();
      sseSource = null;
    }
    if (supabaseChannel && isSupabaseConfigured) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch {}
    }
    window.removeEventListener('focus', handleFocusOrVisible);
    document.removeEventListener('visibilitychange', handleFocusOrVisible);
  };
}

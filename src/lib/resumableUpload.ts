import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type ResumableHandle = {
  upload: tus.Upload;
  pause: () => void;
  resume: () => void;
  abort: () => Promise<void>;
};

export type UploadCallbacks = {
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess?: (publicUrl: string) => void;
  onError?: (error: Error) => void;
};

async function getFreshToken(forceRefresh = false): Promise<string> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session || forceRefresh) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (!session?.access_token) {
    throw new Error("You must be signed in to upload files. Please sign in again.");
  }
  return session.access_token;
}

/**
 * Uploads a file to Supabase Storage via the resumable (tus) endpoint.
 * - Empty creation request (no uploadDataDuringCreation) so chunks are pure PATCH and truly resumable.
 * - On 401/403, refresh the JWT in-place and let tus auto-retry from the last server offset.
 */
export async function startResumableUpload(
  bucket: string,
  objectPath: string,
  file: File,
  cbs: UploadCallbacks
): Promise<ResumableHandle> {
  let token = await getFreshToken();
  let refreshing: Promise<void> | null = null;

  const uploadRef = { upload: null as unknown as tus.Upload };

  const refreshAuth = async () => {
    if (refreshing) return refreshing;
    refreshing = (async () => {
      try {
        token = await getFreshToken(true);
        const opts: any = (uploadRef.upload as any).options;
        if (opts?.headers) opts.headers.authorization = `Bearer ${token}`;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  };

  uploadRef.upload = new tus.Upload(file, {
    endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
    retryDelays: [0, 1000, 3000, 5000, 10000, 20000, 30000],
    headers: {
      authorization: `Bearer ${token}`,
      apikey: SUPABASE_KEY,
      "x-upsert": "true",
    },
    // IMPORTANT: leave this false so the create POST is empty and data is sent in PATCH chunks.
    // This is what makes the upload truly resumable across token refreshes / network blips.
    uploadDataDuringCreation: false,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: bucket,
      objectName: objectPath,
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
    },
    chunkSize: 6 * 1024 * 1024, // Supabase requires 6MB chunks
    onShouldRetry: (err: any) => {
      const status = err?.originalResponse?.getStatus?.();
      if (status === 401 || status === 403) {
        // refresh token then let tus retry — don't restart manually
        refreshAuth();
        return true;
      }
      if (!status || status >= 500) return true;
      if (status === 409 || status === 423) return true;
      return false;
    },
    onError: (err: any) => {
      cbs.onError?.(err as Error);
    },
    onProgress: (bytesUploaded, bytesTotal) => cbs.onProgress?.(bytesUploaded, bytesTotal),
    onSuccess: () => {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      cbs.onSuccess?.(publicUrl);
    },
  });

  // Resume previous upload if any (same fingerprint = same file+path)
  const prev = await uploadRef.upload.findPreviousUploads();
  if (prev.length > 0) uploadRef.upload.resumeFromPreviousUpload(prev[0]);
  uploadRef.upload.start();

  return {
    upload: uploadRef.upload,
    pause: () => uploadRef.upload.abort(),
    resume: () => uploadRef.upload.start(),
    abort: async () => {
      try { await uploadRef.upload.abort(true); } catch { /* noop */ }
    },
  };
}

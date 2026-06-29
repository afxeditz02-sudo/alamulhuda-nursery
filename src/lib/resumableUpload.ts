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

/**
 * Uploads a file to Supabase Storage via the resumable (tus) endpoint.
 * Returns a handle so the caller can pause / resume / abort.
 */
export async function startResumableUpload(
  bucket: string,
  objectPath: string,
  file: File,
  cbs: UploadCallbacks
): Promise<ResumableHandle> {
  let { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const refreshed = await supabase.auth.refreshSession();
    session = refreshed.data.session;
  }
  if (!session?.access_token) {
    throw new Error("You must be signed in to upload files. Please sign in again.");
  }
  const token = session.access_token;

  const upload = new tus.Upload(file, {
    endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
    retryDelays: [0, 1000, 3000, 5000, 10000],
    headers: {
      authorization: `Bearer ${token}`,
      apikey: SUPABASE_KEY,
      "x-upsert": "true",
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: bucket,
      objectName: objectPath,
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
    },
    chunkSize: 6 * 1024 * 1024, // Supabase requires 6MB chunks
    onError: (err) => cbs.onError?.(err as Error),
    onProgress: (bytesUploaded, bytesTotal) => cbs.onProgress?.(bytesUploaded, bytesTotal),
    onSuccess: () => {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(objectPath);
      cbs.onSuccess?.(publicUrl);
    },
  });

  // Resume previous upload if any
  const prev = await upload.findPreviousUploads();
  if (prev.length > 0) upload.resumeFromPreviousUpload(prev[0]);
  upload.start();

  return {
    upload,
    pause: () => upload.abort(),
    resume: () => upload.start(),
    abort: async () => {
      try { await upload.abort(true); } catch { /* noop */ }
    },
  };
}

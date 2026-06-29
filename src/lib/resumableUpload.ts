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
  let token = session.access_token;

  let retriedAuth = false;

  const buildUpload = (authToken: string) =>
    new tus.Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 1000, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${authToken}`,
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
      onShouldRetry: (err: any) => {
        const status = err?.originalResponse?.getStatus?.();
        // Retry on network / 5xx / 401-403 (after refresh)
        if (status === 401 || status === 403) return !retriedAuth;
        if (!status || status >= 500) return true;
        if (status === 409 || status === 423) return true;
        return false;
      },
      onError: async (err: any) => {
        const status = err?.originalResponse?.getStatus?.();
        if ((status === 401 || status === 403) && !retriedAuth) {
          retriedAuth = true;
          try {
            const refreshed = await supabase.auth.refreshSession();
            const newToken = refreshed.data.session?.access_token;
            if (newToken) {
              token = newToken;
              (uploadRef.upload as any).options.headers.authorization = `Bearer ${newToken}`;
              uploadRef.upload.start();
              return;
            }
          } catch { /* fallthrough */ }
        }
        cbs.onError?.(err as Error);
      },
      onProgress: (bytesUploaded, bytesTotal) => cbs.onProgress?.(bytesUploaded, bytesTotal),
      onSuccess: () => {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(objectPath);
        cbs.onSuccess?.(publicUrl);
      },
    });

  const uploadRef = { upload: null as unknown as tus.Upload };
  uploadRef.upload = buildUpload(token);

  // Resume previous upload if any
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


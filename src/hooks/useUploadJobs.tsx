import { useCallback, useEffect, useRef, useState } from "react";
import { startResumableUpload, type ResumableHandle } from "@/lib/resumableUpload";
import { toast } from "sonner";

export type JobFileType = "image" | "video" | "file";

export type JobFile = {
  file: File;
  name: string;
  size: number;
  uploaded: number;
  status: "queued" | "uploading" | "paused" | "saving" | "done" | "error";
  url?: string;
  type: JobFileType;
  handle?: ResumableHandle;
  error?: string;
};

export type UploadJob = {
  id: string;
  label: string;
  files: JobFile[];
  startedAt: number;
  endedAt?: number;
  elapsedMs: number;
  status: "uploading" | "paused" | "done" | "error";
  onFileDone?: (file: JobFile) => Promise<void> | void;
  onAllDone?: () => Promise<void> | void;
};

const detectType = (file: File): JobFileType => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "heic"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm", "3gp", "m4v", "wmv"].includes(ext)) return "video";
  return "file";
};

export const useUploadJobs = (bucket: string, pathPrefix: string) => {
  const [jobs, setJobs] = useState<Record<string, UploadJob>>({});
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;

  // tick elapsed time
  useEffect(() => {
    const id = setInterval(() => {
      setJobs((prev) => {
        let changed = false;
        const next: Record<string, UploadJob> = {};
        for (const [k, j] of Object.entries(prev)) {
          if (j.status === "uploading") {
            next[k] = { ...j, elapsedMs: Date.now() - j.startedAt };
            changed = true;
          } else {
            next[k] = j;
          }
        }
        return changed ? next : prev;
      });
    }, 500);
    return () => clearInterval(id);
  }, []);

  const patchJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    const current = jobsRef.current;
    if (!current[id]) return;
    const next = { ...current, [id]: { ...current[id], ...patch } };
    jobsRef.current = next;
    setJobs(next);
  }, []);

  const patchFile = useCallback((id: string, idx: number, patch: Partial<JobFile>) => {
    const current = jobsRef.current;
    const j = current[id];
    if (!j) return;
    const files = j.files.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    const next = { ...current, [id]: { ...j, files } };
    jobsRef.current = next;
    setJobs(next);
  }, []);

  const removeJob = useCallback((id: string) => {
    const next = { ...jobsRef.current };
    delete next[id];
    jobsRef.current = next;
    setJobs(next);
  }, []);

  const uploadOne = useCallback(
    (jobId: string, idx: number) =>
      new Promise<void>(async (resolve) => {
        const job = jobsRef.current[jobId];
        if (!job) return resolve();
        const f = job.files[idx];
        if (!f || f.status === "done") return resolve();

        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${pathPrefix}/${Date.now()}-${idx}-${safeName}`;

        try {
          let lastProgressAt = 0;
          let lastProgressBytes = f.uploaded;
          const handle = await startResumableUpload(bucket, path, f.file, {
            onProgress: (bytes, total) => {
              const now = Date.now();
              const percentMoved = total > 0 ? ((bytes - lastProgressBytes) / total) * 100 : 0;
              const shouldUpdate =
                now - lastProgressAt > 500 ||
                percentMoved >= 1 ||
                bytes >= total;

              if (!shouldUpdate) return;

              lastProgressAt = now;
              lastProgressBytes = bytes;
              patchFile(jobId, idx, { uploaded: bytes, status: "uploading" });
            },
            onError: (err) => {
              patchFile(jobId, idx, { status: "error", error: err.message });
              toast.error(`Upload failed: ${f.name} — ${err.message}`);
              resolve();
            },
            onSuccess: async (publicUrl) => {
              patchFile(jobId, idx, { status: "saving", uploaded: f.size, url: publicUrl });
              const cb = jobsRef.current[jobId]?.onFileDone;
              if (cb) await cb({ ...f, status: "done", uploaded: f.size, url: publicUrl });
              patchFile(jobId, idx, { status: "done", uploaded: f.size, url: publicUrl });
              resolve();
            },
          });
          const latest = jobsRef.current[jobId]?.files[idx];
          if (latest && latest.status !== "saving" && latest.status !== "done") {
            patchFile(jobId, idx, { handle, status: "uploading" });
          }
        } catch (e: any) {
          patchFile(jobId, idx, { status: "error", error: e?.message || "error" });
          resolve();
        }
      }),
    [bucket, pathPrefix, patchFile]
  );

  const runQueue = useCallback(
    async (jobId: string) => {
      const job = jobsRef.current[jobId];
      if (!job) return;
      for (let i = 0; i < job.files.length; i++) {
        // Stop if job was paused or removed
        const current = jobsRef.current[jobId];
        if (!current || current.status === "paused") return;
        if (current.files[i].status === "done") continue;
        await uploadOne(jobId, i);
      }
      const final = jobsRef.current[jobId];
      if (final && final.files.every((f) => f.status === "done")) {
        patchJob(jobId, { status: "done", endedAt: Date.now() });
        const cb = final.onAllDone;
        if (cb) await cb();
        // auto-remove after delay
        setTimeout(() => removeJob(jobId), 2500);
      }
    },
    [uploadOne, patchJob, removeJob]
  );

  const startJob = useCallback(
    (opts: {
      id: string;
      label: string;
      files: File[];
      onFileDone?: UploadJob["onFileDone"];
      onAllDone?: UploadJob["onAllDone"];
    }) => {
      const job: UploadJob = {
        id: opts.id,
        label: opts.label,
        files: opts.files.map((file) => ({
          file,
          name: file.name,
          size: file.size,
          uploaded: 0,
          status: "queued",
          type: detectType(file),
        })),
        startedAt: Date.now(),
        elapsedMs: 0,
        status: "uploading",
        onFileDone: opts.onFileDone,
        onAllDone: opts.onAllDone,
      };
      const next = { ...jobsRef.current, [opts.id]: job };
      jobsRef.current = next;
      setJobs(next);
      // start after state set
      setTimeout(() => runQueue(opts.id), 0);
    },
    [runQueue]
  );

  const pauseJob = useCallback((id: string) => {
    const j = jobsRef.current[id];
    if (!j) return;
    j.files.forEach((f, i) => {
      if (f.status === "uploading" && f.handle) {
        f.handle.pause();
        patchFile(id, i, { status: "paused" });
      }
    });
    patchJob(id, { status: "paused" });
  }, [patchFile, patchJob]);

  const resumeJob = useCallback((id: string) => {
    const j = jobsRef.current[id];
    if (!j) return;
    patchJob(id, { status: "uploading", startedAt: Date.now() - j.elapsedMs });
    // resume any paused file; then continue queue
    let resumed = false;
    j.files.forEach((f, i) => {
      if (f.status === "paused" && f.handle) {
        f.handle.resume();
        patchFile(id, i, { status: "uploading" });
        resumed = true;
      }
    });
    if (!resumed) runQueue(id);
    else {
      // also continue with subsequent queued files after current resumes
      const watcher = setInterval(() => {
        const cur = jobsRef.current[id];
        if (!cur || cur.status !== "uploading") { clearInterval(watcher); return; }
        const idx = cur.files.findIndex((f) => f.status === "uploading" || f.status === "paused");
        if (idx === -1) { clearInterval(watcher); runQueue(id); }
      }, 500);
    }
  }, [patchFile, patchJob, runQueue]);

  const cancelJob = useCallback(async (id: string) => {
    const j = jobsRef.current[id];
    if (!j) return;
    for (const f of j.files) {
      if (f.handle) await f.handle.abort();
    }
    removeJob(id);
  }, [removeJob]);

  return { jobs, startJob, pauseJob, resumeJob, cancelJob };
};

export const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const formatDuration = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

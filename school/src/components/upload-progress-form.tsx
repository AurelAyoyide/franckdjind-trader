"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { type BuilderActionState } from "@/app/trainer/courses/[courseId]/actions";

type UploadProgressFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  state: BuilderActionState;
  children: React.ReactNode;
  className?: string;
};

type UploadResponse = {
  error?: string;
  fileName?: string;
};

function parseUploadResponse(xhr: XMLHttpRequest) {
  try {
    return JSON.parse(xhr.responseText) as UploadResponse;
  } catch {
    return null;
  }
}

export function UploadProgressForm({ action, pending, state, children, className }: UploadProgressFormProps) {
  const [progress, setProgress] = useState(-1);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || progress > 0) return;

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const file = formData.get("asset") as File | null;

    if (!file || file.size === 0) {
      action(formData);
      return;
    }

    setProgress(0);
    setUploadError("");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      }
    };

    xhr.onload = () => {
      const payload = parseUploadResponse(xhr);

      if (xhr.status >= 200 && xhr.status < 300) {
        if (!payload?.fileName) {
          setProgress(-1);
          setUploadError("Erreur lors de la lecture du fichier uploadé.");
          return;
        }

        setProgress(100);
        formData.delete("asset");
        formData.set("uploadedFileName", payload.fileName);
        action(formData);
        window.setTimeout(() => setProgress(-1), 750);
        return;
      }

      setProgress(-1);
      setUploadError(payload?.error ?? "Une erreur est survenue pendant l'upload.");
    };

    xhr.onerror = () => {
      setProgress(-1);
      setUploadError("Connexion perdue pendant l'upload.");
    };

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("type", String(formData.get("type") ?? ""));
    xhr.send(uploadData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className} data-action-state={state.message ? (state.ok ? "ok" : "error") : "idle"} encType="multipart/form-data">
      {children}

      {progress >= 0 && progress < 100 ? (
        <div className="mt-4 overflow-hidden rounded-full bg-foreground/[0.05] p-1">
          <div className="flex h-2 items-center justify-center rounded-full bg-market text-[10px] font-black text-on-market transition-all duration-300" style={{ width: `${progress}%` }} />
          <p className="mt-2 text-center text-xs font-semibold text-muted">Upload en cours : {progress}%</p>
        </div>
      ) : progress === 100 && pending ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-market">
          <CheckCircle2 className="h-4 w-4" /> Fichier envoyé, finalisation...
        </div>
      ) : null}

      {uploadError ? (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-danger">
          <XCircle className="h-4 w-4" /> {uploadError}
        </div>
      ) : null}
    </form>
  );
}

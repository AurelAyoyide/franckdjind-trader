"use client";

import { CheckCircle2, UploadCloud, XCircle } from "lucide-react";
import { useState, useRef } from "react";
import { type BuilderActionState } from "@/app/trainer/courses/[courseId]/actions";

type UploadProgressFormProps = {
    action: (formData: FormData) => void;
    pending: boolean;
    state: BuilderActionState;
    children: React.ReactNode;
    className?: string;
};

export function UploadProgressForm({ action, pending, state, children, className }: UploadProgressFormProps) {
    const [progress, setProgress] = useState(-1);
    const [uploadError, setUploadError] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pending || progress > 0) return;

        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const file = formData.get("asset") as File | null;

        if (!file || file.size === 0) {
            // No file to upload, proceed standard Action
            action(formData);
            return;
        }

        setProgress(0);
        setUploadError("");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload", true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const res = JSON.parse(xhr.responseText);
                    setProgress(100);

                    // Substitute the file field with the server filename
                    formData.delete("asset");
                    formData.set("uploadedFileName", res.fileName);

                    // Proceed with the Server Action
                    action(formData);
                } catch (err) {
                    setProgress(-1);
                    setUploadError("Erreur lors de la lecture du fichier uploadé.");
                }
            } else {
                setProgress(-1);
                setUploadError("Une erreur est survenue pendant l'upload.");
            }
        };

        xhr.onerror = () => {
            setProgress(-1);
            setUploadError("Connexion perdue pendant l'upload.");
        };

        const uploadData = new FormData();
        uploadData.append("file", file);
        xhr.send(uploadData);
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className={className} encType="multipart/form-data">
            {children}

            {progress >= 0 && progress < 100 ? (
                <div className="mt-4 overflow-hidden rounded-full bg-foreground/[0.05] p-1">
                    <div className="flex h-2 items-center justify-center rounded-full bg-market text-[10px] font-black text-on-market transition-all duration-300" style={{ width: `${progress}%` }}>
                    </div>
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

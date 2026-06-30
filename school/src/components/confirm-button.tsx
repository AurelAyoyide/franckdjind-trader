"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function ConfirmButton({
    children,
    className,
    confirmMessage = "Voulez-vous vraiment supprimer cet element ?",
}: {
    children: React.ReactNode;
    className?: string;
    confirmMessage?: string;
}) {
    const { pending } = useFormStatus();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className={className}
                disabled={pending}
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
            >
                {pending ? "..." : children}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-2xl">
                        <button
                            type="button"
                            className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground disabled:opacity-50"
                            disabled={pending}
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <h2 className="mb-2 text-xl font-black text-foreground">Confirmation</h2>
                            <p className="mb-6 text-sm leading-6 text-muted">{confirmMessage}</p>
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    className="flex flex-1 items-center justify-center rounded-lg border border-line bg-background py-3 text-sm font-black transition-colors hover:bg-foreground/[0.04] disabled:opacity-50"
                                    disabled={pending}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-danger py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                    disabled={pending}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {pending ? (
                                        "..."
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4" />
                                            Confirmer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

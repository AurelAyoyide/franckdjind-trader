"use client";

import { useFormStatus } from "react-dom";

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

    return (
        <button
            type="submit"
            className={className}
            disabled={pending}
            onClick={(event) => {
                if (!window.confirm(confirmMessage)) {
                    event.preventDefault();
                }
            }}
        >
            {pending ? "..." : children}
        </button>
    );
}

"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteResourceAction } from "@/app/admin/resource-actions";
import { PendingSubmitButton } from "@/components/pending-submit-button";

type DeleteConfirmationProps = {
  resource: string;
  id: string;
  title: string;
};

export function DeleteConfirmation({ resource, id, title }: DeleteConfirmationProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 text-sm font-semibold text-danger"
        type="button"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Supprimer
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div aria-labelledby="delete-dialog-title" aria-modal="true" className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-2xl" role="dialog">
            <div className="border-b border-line bg-danger/5 p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-danger/30 bg-danger/10 text-danger">
                  <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-danger">Action irréversible</p>
                  <h2 className="mt-2 text-xl font-black" id="delete-dialog-title">Supprimer cet élément ?</h2>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    <span className="font-black text-foreground">{title}</span> sera supprimé définitivement. Cette action ne peut pas être annulée.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
              <button
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-4 text-sm font-semibold text-foreground"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Annuler
              </button>
              <form action={deleteResourceAction} className="sm:min-w-48">
                <input name="resource" type="hidden" value={resource} />
                <input name="id" type="hidden" value={id} />
                <PendingSubmitButton className="w-full bg-danger text-white" pendingLabel="Suppression...">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Oui, supprimer
                </PendingSubmitButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

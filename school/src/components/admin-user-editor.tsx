import type { UserRole } from "@prisma/client";
import { Pencil } from "lucide-react";
import { updateUserAction } from "@/app/admin/users/actions";

type AdminUserEditorProps = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: UserRole;
  };
};

export function AdminUserEditor({ user }: AdminUserEditorProps) {
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <details className="mt-4 rounded-lg border border-line bg-foreground/[0.03] p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-black text-foreground">
        <Pencil className="h-4 w-4 text-cyan" aria-hidden="true" />
        Modifier le compte
      </summary>
      <form action={updateUserAction} className="mt-4 grid gap-3 md:grid-cols-2">
        <input name="userId" type="hidden" value={user.id} />
        <label className="text-xs font-black">Prenom<input className="mt-1 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={user.firstName} name="firstName" /></label>
        <label className="text-xs font-black">Nom<input className="mt-1 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={user.lastName} name="lastName" /></label>
        <label className="text-xs font-black">Email<input className="mt-1 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={user.email} name="email" type="email" /></label>
        <label className="text-xs font-black">WhatsApp<input className="mt-1 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={user.phone ?? ""} name="phone" /></label>
        <label className="text-xs font-black">Role
          <select className="mt-1 min-h-10 w-full rounded-lg border border-line bg-background px-3 text-sm disabled:opacity-60" defaultValue={isSuperAdmin ? "MAIN_TRAINER" : user.role} disabled={isSuperAdmin} name="role">
            <option value="STUDENT">Apprenant</option>
            <option value="MAIN_TRAINER">Formateur principal</option>
            <option value="ASSISTANT_TRAINER">Assistant formateur</option>
          </select>
        </label>
        <button className="inline-flex min-h-10 items-center justify-center self-end rounded-lg bg-market px-3 text-sm font-black text-on-market" type="submit">Enregistrer les modifications</button>
      </form>
    </details>
  );
}

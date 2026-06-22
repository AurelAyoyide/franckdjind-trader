import { redirect } from "next/navigation";
import { CheckCircle2, CircleAlert, Database, Mail, ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { readData } from "@/lib/data-store";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Paramètres de déploiement",
  path: "/admin/settings",
  noIndex: true
});

function Status({ configured, label, detail }: { configured: boolean; label: string; detail: string }) {
  const Icon = configured ? CheckCircle2 : CircleAlert;
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 ${configured ? "text-market" : "text-amber"}`} aria-hidden="true" />
        <div>
          <h2 className="font-black">{label}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") redirect("/admin");

  const data = await readData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const sender = process.env.CONTACT_FROM_EMAIL?.trim();
  const recipient = process.env.CONTACT_TO_EMAIL?.trim();
  const resetReady = Boolean(process.env.RESEND_API_KEY && sender && siteUrl);

  return (
    <section>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-market">Administration</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">Paramètres de déploiement</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
        Les éléments sensibles et les réglages techniques sont pilotés par les variables d&apos;environnement du serveur.
        Cette page confirme leur état sans exposer de clé, de mot de passe ou d&apos;URL de base de données.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Status configured={Boolean(siteUrl)} label="Domaine public" detail={siteUrl ? `URL configurée : ${siteUrl}` : "NEXT_PUBLIC_SITE_URL est absent. Configure l’URL HTTPS finale avant le déploiement."} />
        <Status configured={Boolean(process.env.DATABASE_URL)} label="Base PostgreSQL" detail={process.env.DATABASE_URL ? "Connexion définie. Exécute les migrations et le seed sur une base neuve avant la mise en ligne." : "DATABASE_URL est absent : le site ne peut pas charger son contenu."} />
        <Status configured={Boolean(sender && recipient && process.env.RESEND_API_KEY)} label="Emails de contact" detail={sender && recipient && process.env.RESEND_API_KEY ? `Expéditeur : ${sender} · destinataire : ${recipient}` : "Configure RESEND_API_KEY, CONTACT_FROM_EMAIL et CONTACT_TO_EMAIL pour activer les notifications."} />
        <Status configured={resetReady} label="Mot de passe oublié" detail={resetReady ? "Le service d’email et l’URL publique sont définis. Teste le lien avec le compte listé dans Utilisateurs." : "La réinitialisation exige RESEND_API_KEY, CONTACT_FROM_EMAIL et NEXT_PUBLIC_SITE_URL."} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Info icon={ShieldCheck} label="Secret de session" value={process.env.AUTH_SECRET ? "Configuré" : "À configurer"} />
        <Info icon={Mail} label="Contenu éditorial" value={`${data.posts.length} articles · ${data.services.length} services`} />
        <Info icon={Database} label="Base de référence" value={`${data.categories.length} catégories · ${data.tags.length} tags`} />
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface p-6 text-sm leading-7 text-muted">
        <h2 className="text-lg font-black text-foreground">Comment modifier une configuration ?</h2>
        <p className="mt-3">
          Modifie le fichier <code>.env</code> sur le VPS, redémarre le service, puis reviens ici pour vérifier l&apos;état.
          Les contenus se gèrent dans leurs rubriques dédiées ; les redirections ne sont à créer que lorsqu&apos;une ancienne URL doit être conservée pour éviter une erreur 404.
        </p>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return <div className="rounded-lg border border-line bg-surface p-5"><Icon className="h-5 w-5 text-market" aria-hidden="true" /><p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-muted">{label}</p><p className="mt-2 text-sm font-semibold text-foreground">{value}</p></div>;
}

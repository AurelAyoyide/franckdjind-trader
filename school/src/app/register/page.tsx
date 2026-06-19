import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { RegisterForm } from "@/components/register-form";

const requirements = [
  "Valide ton email apres inscription",
  "Demande ensuite l'acces a une formation",
  "Garde ton WhatsApp a jour pour le suivi",
  "Connecte-toi avec le meme email",
];

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Inscription"
        title="Creer ton compte apprenant."
        description="L'inscription publique est reservee aux apprenants. Les comptes formateur et admin sont crees depuis l'espace administrateur."
      />
      <section className="site-shell grid gap-8 py-12 md:py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-2xl font-black">Etapes apres creation</h2>
          <div className="mt-5 grid gap-3">
            {requirements.map((item) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-foreground/[0.04] p-3" key={item}>
                <CheckCircle2 className="h-4 w-4 text-market" aria-hidden="true" />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <RegisterForm />
      </section>
    </>
  );
}

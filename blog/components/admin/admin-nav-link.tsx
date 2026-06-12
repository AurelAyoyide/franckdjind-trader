"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderTree,
  Image,
  Inbox,
  LayoutDashboard,
  Link2,
  Mail,
  MessageSquareQuote,
  PanelsTopLeft,
  Route,
  Settings,
  Tags,
  UserRound,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  posts: FileText,
  categories: FolderTree,
  tags: Tags,
  pages: PanelsTopLeft,
  media: Image,
  testimonials: MessageSquareQuote,
  services: Wrench,
  links: Link2,
  messages: Inbox,
  redirects: Route,
  settings: Settings,
  users: UserRound,
  subscribers: Mail
};

type AdminNavLinkProps = {
  href: string;
  icon: keyof typeof icons;
  label: string;
};

export function AdminNavLink({ href, icon, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  const Icon = icons[icon];
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      className={cn(
        "inline-flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/[0.06] hover:text-foreground",
        active && "border border-market/30 bg-market/10 text-foreground shadow-[inset_3px_0_0_var(--market)]"
      )}
      aria-current={active ? "page" : undefined}
      href={href}
    >
      <Icon className="h-4 w-4 shrink-0 text-market" aria-hidden="true" />
      {label}
    </Link>
  );
}

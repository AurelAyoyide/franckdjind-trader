import Link from "next/link";
import { saveResourceAction } from "@/app/admin/resource-actions";
import { RichEditor } from "@/components/admin/rich-editor";
import type { AdminResourceConfig } from "@/lib/admin-resources";

type ResourceFormProps = {
  config: AdminResourceConfig;
  item?: Record<string, unknown>;
};

function fieldValue(item: Record<string, unknown> | undefined, name: string) {
  if (!item) {
    return "";
  }

  if (name === "tagSlugs" && Array.isArray(item.tags)) {
    return item.tags
      .map((tag) => (typeof tag === "object" && tag && "slug" in tag ? String(tag.slug) : ""))
      .filter(Boolean)
      .join(", ");
  }

  if (name === "categorySlug" && typeof item.category === "object" && item.category && "slug" in item.category) {
    return String(item.category.slug);
  }

  const value = item[name];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function defaultChecked(item: Record<string, unknown> | undefined, name: string) {
  if (item && typeof item[name] === "boolean") {
    return Boolean(item[name]);
  }

  return ["robotsIndex", "robotsFollow", "published", "active", "permanent", "noFollow"].includes(name);
}

export function ResourceForm({ config, item }: ResourceFormProps) {
  return (
    <form action={saveResourceAction} className="grid gap-5 rounded-lg border border-line bg-surface p-5">
      <input name="resource" type="hidden" value={config.slug} />
      <input name="id" type="hidden" value={typeof item?.id === "string" ? item.id : ""} />

      {config.fields.map((field) => {
        const id = `${config.slug}-${field.name}`;

        if (field.type === "checkbox") {
          return (
            <label className="flex items-center gap-3 rounded-md border border-line bg-background px-4 py-3 text-sm font-semibold text-muted" htmlFor={id} key={field.name}>
              <input
                className="h-4 w-4 accent-market"
                defaultChecked={defaultChecked(item, field.name)}
                id={id}
                name={field.name}
                type="checkbox"
              />
              {field.label}
            </label>
          );
        }

        return (
          <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor={id} key={field.name}>
            {field.label}
            {field.name === "content" ? (
              <RichEditor
                initialValue={fieldValue(item, field.name)}
                name={field.name}
                placeholder={`Redige le contenu de ce ${config.singular}...`}
              />
            ) : null}
            {field.type === "textarea" && field.name !== "content" ? (
              <textarea
                className="min-h-32 rounded-md border border-line bg-background px-4 py-3 text-foreground outline-none transition focus:border-market"
                defaultValue={fieldValue(item, field.name)}
                id={id}
                name={field.name}
                required={field.required}
              />
            ) : null}
            {field.type === "select" ? (
              <select
                className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market"
                defaultValue={fieldValue(item, field.name)}
                id={id}
                name={field.name}
                required={field.required}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
            {!["textarea", "select"].includes(field.type) ? (
              <input
                className="min-h-12 rounded-md border border-line bg-background px-4 text-foreground outline-none transition focus:border-market"
                defaultValue={fieldValue(item, field.name)}
                id={id}
                name={field.name}
                required={field.required}
                type={field.type}
              />
            ) : null}
            {field.help ? <span className="text-xs font-normal leading-5 text-muted-strong">{field.help}</span> : null}
          </label>
        );
      })}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button className="min-h-11 rounded-lg bg-market px-5 text-sm font-black text-on-market transition hover:bg-market-strong" type="submit">
          Enregistrer
        </button>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-foreground/[0.06] px-5 text-sm font-semibold text-foreground" href={`/admin/${config.slug}`}>
          Annuler
        </Link>
      </div>
    </form>
  );
}

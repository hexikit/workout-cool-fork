import { getI18n } from "../../../../../locales/server";

export default async function AdminSettings() {
  const t = await getI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("admin.settings.title")}</h1>
        <p className="text-muted-foreground">{t("admin.settings.description")}</p>
      </div>
    </div>
  );
}

import { Suspense } from "react";

import { ProgramsList } from "@/features/admin/programs/ui/programs-list";
import { CreateProgramButton } from "@/features/admin/programs/ui/create-program-button";
import { getI18n } from "../../../../../locales/server";

export default async function AdminPrograms() {
  const t = await getI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.programs.title")}</h1>
          <p className="text-muted-foreground">{t("admin.programs.description")}</p>
        </div>
        <CreateProgramButton />
      </div>

      <Suspense fallback={<div>{t("admin.programs.loading")}</div>}>
        <ProgramsList />
      </Suspense>
    </div>
  );
}

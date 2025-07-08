import Link from "next/link";
import Image from "next/image";
import { Eye, Edit, Users, Dumbbell } from "lucide-react";

import { getI18n } from "../../../../../locales/server";
import { getPrograms } from "../actions/get-programs.action";
import { VisibilityBadge } from "./visibility-badge";
import { DeleteProgramButton } from "./delete-program-button";

export async function ProgramsList() {
  const t = await getI18n();
  const programs = await getPrograms();

  if (programs.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body flex flex-col items-center justify-center py-12">
          <Dumbbell className="h-12 w-12 text-base-content/60 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("admin.programs.programs_list.no_programs_title")}</h3>
          <p className="text-base-content/60 text-center max-w-md">
            {t("admin.programs.programs_list.no_programs_description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>{t("admin.programs.programs_list.table_header_program")}</th>
            <th>{t("admin.programs.programs_list.table_header_status")}</th>
            <th>{t("admin.programs.programs_list.table_header_duration")}</th>
            <th>{t("admin.programs.programs_list.table_header_content")}</th>
            <th>{t("admin.programs.programs_list.table_header_enrollments")}</th>
            <th>{t("admin.programs.programs_list.table_header_actions")}</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => (
            <tr key={program.id}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <Image alt={program.titleEn} height={48} src={program.image} width={48} />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">{program.titleEn}</div>
                    <div className="text-sm opacity-50 line-clamp-2 max-w-xs">{program.descriptionEn}</div>
                    <div className="flex gap-1 mt-1">
                      <div className={`badge badge-xs ${program.isPremium ? "badge-primary" : "badge-secondary"}`}>
                        {program.isPremium
                          ? t("admin.programs.programs_list.premium")
                          : t("admin.programs.programs_list.free")}
                      </div>
                      <div className="badge badge-xs badge-outline">{program.level}</div>
                      <div className="badge badge-xs badge-ghost">{program.category}</div>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <VisibilityBadge currentVisibility={program.visibility} programId={program.id} />
              </td>
              <td>
                <div className="text-sm">
                  <div className="font-semibold">
                    {t("admin.programs.programs_list.duration_weeks", { count: program.durationWeeks })}
                  </div>
                  <div className="text-xs opacity-50">
                    {t("admin.programs.programs_list.sessions_per_week", { count: program.sessionsPerWeek })}
                  </div>
                </div>
              </td>
              <td>
                <div className="text-sm">
                  <div>
                    {t("admin.programs.programs_list.content_summary", {
                      weeks: program.totalWeeks,
                      sessions: program.totalSessions,
                    })}
                  </div>
                  <div className="text-xs opacity-50">
                    {t("admin.programs.programs_list.total_exercises", { count: program.totalExercises })}
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 opacity-50" />
                  <span className="font-semibold">{program.totalEnrollments}</span>
                </div>
              </td>
              <td>
                <div className="flex gap-1">
                  <Link
                    className="btn btn-ghost btn-xs"
                    href={`/programs/${program.slug}`}
                    target="_blank"
                    title={t("admin.programs.programs_list.view_program_tooltip")}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    className="btn btn-ghost btn-xs"
                    href={`/admin/programs/${program.id}/edit`}
                    title={t("admin.programs.programs_list.manage_program_tooltip")}
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <DeleteProgramButton programId={program.id} programTitle={program.titleEn} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Clock, ChevronDown, ChevronRight, Edit } from "lucide-react";

import { useI18n } from "../../../../../locales/client";
import { WeekWithSessions } from "../types/program.types";
import { SessionCard } from "./session-card";
import { EditWeekModal } from "./edit-week-modal";
import { AddSessionModal } from "./add-session-modal";

interface WeekCardProps {
  week: WeekWithSessions;
}

export function WeekCard({ week }: WeekCardProps) {
  const t = useI18n();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isEditWeekModalOpen, setIsEditWeekModalOpen] = useState(false);

  return (
    <div className="card bg-base-100 shadow-xl">
      {/* Header avec boutons séparés du collapse */}
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-sm p-1" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div>
              <h3 className="text-lg font-bold">
                {t("admin.programs.week_card.week_title", { number: week.weekNumber, title: week.titleEn })}
              </h3>
              <p className="text-sm text-base-content/60 mt-1">{week.descriptionEn}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="badge badge-outline">
              {week.sessions.length}{" "}
              {week.sessions.length === 1
                ? t("admin.programs.week_card.session")
                : t("admin.programs.week_card.sessions")}
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setIsEditWeekModalOpen(true)}
              title={t("admin.programs.week_card.edit_week_tooltip")}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setIsAddSessionModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              {t("admin.programs.week_card.add_session_button")}
            </button>
          </div>
        </div>
      </div>

      {/* Contenu collapsible */}
      {isExpanded && (
        <div className="card-body pt-0">
          <div className="divider my-2"></div>
          {week.sessions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-base-300 rounded-lg">
              <Clock className="h-8 w-8 text-base-content/60 mx-auto mb-2" />
              <p className="text-base-content/60 mb-3">{t("admin.programs.week_card.no_sessions_title")}</p>
              <button className="btn btn-sm btn-primary" onClick={() => setIsAddSessionModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {t("admin.programs.week_card.add_first_session_button")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {week.sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      )}

      <AddSessionModal
        nextSessionNumber={week.sessions.length + 1}
        onOpenChange={setIsAddSessionModalOpen}
        open={isAddSessionModalOpen}
        weekId={week.id}
      />

      <EditWeekModal onOpenChange={setIsEditWeekModalOpen} open={isEditWeekModalOpen} week={week} />
    </div>
  );
}

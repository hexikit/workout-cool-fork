"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { useI18n } from "../../../../../locales/client";
import { updateWeek } from "../actions/update-week.action";

interface EditWeekModalProps {
  week: {
    id: string;
    weekNumber: number;
    title: string;
    titleEn: string;
    titleEs: string;
    titlePt: string;
    titleRu: string;
    titleZhCn: string;
    description: string;
    descriptionEn: string;
    descriptionEs: string;
    descriptionPt: string;
    descriptionRu: string;
    descriptionZhCn: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWeekModal({ week, open, onOpenChange }: EditWeekModalProps) {
  const t = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: week.title,
    description: week.description,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateWeek(week.id, {
        title: formData.title,
        titleEn: "",
        titleEs: "",
        titlePt: "",
        titleRu: "",
        titleZhCn: "",
        description: formData.description,
        descriptionEn: "",
        descriptionEs: "",
        descriptionPt: "",
        descriptionRu: "",
        descriptionZhCn: "",
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving week:", error);
      alert(error instanceof Error ? error.message : t("admin.programs.edit_week_modal.error_saving"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="modal modal-open modal-middle !mt-0">
      <div className="modal-box max-w-4xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">
            {t("admin.programs.edit_week_modal.title", { weekNumber: week.weekNumber })}
          </h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_week_modal.labels.title")}</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("admin.programs.edit_week_modal.placeholders.title")}
                  required
                  type="text"
                  value={formData.title}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_week_modal.labels.description")}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("admin.programs.edit_week_modal.placeholders.description")}
                  value={formData.description}
                />
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" disabled={isSaving} onClick={handleClose} type="button">
              {t("admin.programs.edit_week_modal.buttons.cancel")}
            </button>
            <button className="btn btn-primary" disabled={isSaving} type="submit">
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {t("admin.programs.edit_week_modal.buttons.saving")}
                </>
              ) : (
                t("admin.programs.edit_week_modal.buttons.save")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

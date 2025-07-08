"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useI18n } from "../../../../../locales/client";

import { addWeekToProgram } from "../actions/add-week.action";

const getWeekSchema = (t: any) =>
  z.object({
    title: z.string().min(1, t("admin.programs.add_week_modal.validation.title_required")),
    description: z.string().optional(),
  });

type WeekFormData = z.infer<ReturnType<typeof getWeekSchema>>;

interface AddWeekModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  nextWeekNumber: number;
}

export function AddWeekModal({ open, onOpenChange, programId, nextWeekNumber }: AddWeekModalProps) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("en");
  const [formData, setFormData] = useState<WeekFormData>({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: t("admin.programs.add_week_modal.title_fr_placeholder", { number: nextWeekNumber }),
        description: "",
      });
    }
  }, [open, nextWeekNumber, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addWeekToProgram({
        programId,
        weekNumber: nextWeekNumber,
        ...formData,
        titleEn: "",
        titleEs: "",
        titlePt: "",
        titleRu: "",
        titleZhCn: "",
        descriptionEn: "",
        descriptionEs: "",
        descriptionPt: "",
        descriptionRu: "",
        descriptionZhCn: "",
      });

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding week:", error);
      alert(t("admin.programs.add_week_modal.add_week_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setActiveTab("fr");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="modal modal-open modal-middle !mt-0">
      <div className="modal-box max-w-4xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{t("admin.programs.add_week_modal.title")}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.add_week_modal.title_en_label")}</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  disabled={isLoading}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("admin.programs.add_week_modal.title_en_placeholder", { number: nextWeekNumber })}
                  required
                  type="text"
                  value={formData.title}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.add_week_modal.description_en_label")}</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  disabled={isLoading}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("admin.programs.add_week_modal.description_en_placeholder")}
                  value={formData.description}
                />
              </div>
            </div>
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" disabled={isLoading} onClick={handleClose} type="button">
              {t("admin.programs.add_week_modal.cancel")}
            </button>
            <button className="btn btn-primary" disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  {t("admin.programs.add_week_modal.adding_week")}
                </>
              ) : (
                t("admin.programs.add_week_modal.add_week")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

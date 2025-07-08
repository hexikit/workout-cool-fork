"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus, Trash2 } from "lucide-react";
import { ProgramLevel, ExerciseAttributeValueEnum } from "@prisma/client";

import { useI18n } from "locales/client";
import { allEquipmentValues, getEquipmentTranslation } from "@/shared/lib/workout-session/equipments";

import { updateProgram } from "../actions/update-program.action";

interface EditProgramModalProps {
  program: {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    category: string;
    image: string;
    level: ProgramLevel;
    type: ExerciseAttributeValueEnum;
    durationWeeks: number;
    sessionsPerWeek: number;
    sessionDurationMin: number;
    equipment: ExerciseAttributeValueEnum[];
    isPremium: boolean;
    coaches: Array<{
      id: string;
      name: string;
      image: string;
      order: number;
    }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProgramModal({ program, open, onOpenChange }: EditProgramModalProps) {
  const router = useRouter();
  const t = useI18n();
  const [activeTab, setActiveTab] = useState("fr");
  const [formData, setFormData] = useState({
    title: program.title,
    titleEn: program.titleEn,
    description: program.description,
    descriptionEn: program.descriptionEn,
    category: program.category,
    image: program.image,
    level: program.level,
    type: program.type,
    durationWeeks: program.durationWeeks,
    sessionsPerWeek: program.sessionsPerWeek,
    sessionDurationMin: program.sessionDurationMin,
    equipment: program.equipment,
    isPremium: program.isPremium,
    coaches: program.coaches,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProgram(program.id, {
        ...formData,
        titleEs: "",
        titlePt: "",
        titleRu: "",
        titleZhCn: "",
        descriptionEs: "",
        descriptionPt: "",
        descriptionRu: "",
        descriptionZhCn: "",
      });
      setActiveTab("fr");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving program:", error);
      alert(error instanceof Error ? error.message : t("admin.programs.edit_program_modal.error_message"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setActiveTab("fr");
    onOpenChange(false);
  };

  const handleEquipmentChange = (equipment: ExerciseAttributeValueEnum) => {
    const newEquipment = formData.equipment.includes(equipment)
      ? formData.equipment.filter((e) => e !== equipment)
      : [...formData.equipment, equipment];
    setFormData({ ...formData, equipment: newEquipment });
  };

  const addCoach = () => {
    const newCoaches = [...formData.coaches, { id: `new-${Date.now()}`, name: "", image: "", order: formData.coaches.length }];
    setFormData({ ...formData, coaches: newCoaches });
  };

  const removeCoach = (index: number) => {
    const newCoaches = formData.coaches.filter((_, i) => i !== index);
    setFormData({ ...formData, coaches: newCoaches });
  };

  const updateCoach = (index: number, field: string, value: string) => {
    const newCoaches = [...formData.coaches];
    newCoaches[index] = { ...newCoaches[index], [field]: value };
    setFormData({ ...formData, coaches: newCoaches });
  };

  if (!open) return null;

  const TYPE_OPTIONS = [
    { value: ExerciseAttributeValueEnum.STRENGTH, label: t("admin.programs.edit_program_modal.options.types.strength") },
    { value: ExerciseAttributeValueEnum.CARDIO, label: t("admin.programs.edit_program_modal.options.types.cardio") },
    { value: ExerciseAttributeValueEnum.BODYWEIGHT, label: t("admin.programs.edit_program_modal.options.types.bodyweight") },
    { value: ExerciseAttributeValueEnum.STRETCHING, label: t("admin.programs.edit_program_modal.options.types.stretching") },
    { value: ExerciseAttributeValueEnum.CALISTHENIC, label: t("admin.programs.edit_program_modal.options.types.calisthenic") },
  ];

  return (
    <div className="modal modal-open modal-middle !mt-0">
      <div className="modal-box max-w-4xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">{t("admin.programs.edit_program_modal.title")}</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Language Tabs */}
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${activeTab === "fr" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("fr")}
              type="button"
            >
              {t("admin.programs.edit_program_modal.tabs.fr")}
            </button>
            <button
              className={`tab ${activeTab === "en" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("en")}
              type="button"
            >
              {t("admin.programs.edit_program_modal.tabs.en")}
            </button>
          </div>

          {/* French Fields */}
          {activeTab === "fr" && (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_program_modal.labels.title")} (Français)</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  type="text"
                  value={formData.title}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_program_modal.labels.description")} (Français)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  value={formData.description}
                />
              </div>
            </div>
          )}

          {/* English Fields */}
          {activeTab === "en" && (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_program_modal.labels.title")} (English)</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  type="text"
                  value={formData.titleEn}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">{t("admin.programs.edit_program_modal.labels.description")} (English)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  disabled={isSaving}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  value={formData.descriptionEn}
                />
              </div>
            </div>
          )}

          {/* Image et emoji */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.image_url")}</span>
              </label>
              <input
                className="input input-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                type="url"
                value={formData.image}
              />
            </div>
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.category")}</span>
              </label>
              <input
                className="input input-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                type="text"
                value={formData.category}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.level")}</span>
              </label>
              <select
                className="select select-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as ProgramLevel })}
                value={formData.level}
              >
                <option value="BEGINNER">{t("admin.programs.edit_program_modal.options.levels.beginner")}</option>
                <option value="INTERMEDIATE">{t("admin.programs.edit_program_modal.options.levels.intermediate")}</option>
                <option value="ADVANCED">{t("admin.programs.edit_program_modal.options.levels.advanced")}</option>
                <option value="EXPERT">{t("admin.programs.edit_program_modal.options.levels.expert")}</option>
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.type")}</span>
              </label>
              <select
                className="select select-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ExerciseAttributeValueEnum })}
                value={formData.type}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paramètres du programme */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.duration_weeks")}</span>
              </label>
              <input
                className="input input-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, durationWeeks: Number(e.target.value) })}
                type="number"
                value={formData.durationWeeks}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.sessions_per_week")}</span>
              </label>
              <input
                className="input input-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, sessionsPerWeek: Number(e.target.value) })}
                type="number"
                value={formData.sessionsPerWeek}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">{t("admin.programs.edit_program_modal.labels.session_duration")}</span>
              </label>
              <input
                className="input input-bordered w-full"
                disabled={isSaving}
                onChange={(e) => setFormData({ ...formData, sessionDurationMin: Number(e.target.value) })}
                type="number"
                value={formData.sessionDurationMin}
              />
            </div>
          </div>

          {/* Équipement requis */}
          <div>
            <label className="label">
              <span className="label-text">{t("admin.programs.edit_program_modal.labels.required_equipment")}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allEquipmentValues.map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  className={`btn text-xs ${formData.equipment.includes(equipment) ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleEquipmentChange(equipment)}
                >
                  {getEquipmentTranslation(equipment, t, true) as string}
                </button>
              ))}
            </div>
          </div>

          {/* Programme premium */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{t("admin.programs.edit_program_modal.labels.premium_program")}</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              />
            </label>
          </div>

          {/* Coaches */}
          <div>
            <h4 className="font-bold mb-4">{t("admin.programs.edit_program_modal.labels.coaches")}</h4>
            <div className="space-y-4">
              {formData.coaches.map((coach, index) => (
                <div key={coach.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input
                      className="input input-bordered"
                      disabled={isSaving}
                      onChange={(e) => updateCoach(index, "name", e.target.value)}
                      placeholder={t("admin.programs.edit_program_modal.placeholders.coach_name")}
                      type="text"
                      value={coach.name}
                    />
                    <input
                      className="input input-bordered"
                      disabled={isSaving}
                      onChange={(e) => updateCoach(index, "image", e.target.value)}
                      placeholder={t("admin.programs.edit_program_modal.placeholders.image_url")}
                      type="url"
                      value={coach.image}
                    />
                  </div>
                  <button type="button" className="btn btn-error btn-square" onClick={() => removeCoach(index)}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline mt-4" onClick={addCoach}>
              <Plus className="h-4 w-4 mr-2" />
              {t("admin.programs.edit_program_modal.buttons.add_coach")}
            </button>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" disabled={isSaving} onClick={handleClose}>
            {t("admin.programs.edit_program_modal.cancel_button")}
          </button>
          <button className="btn btn-primary" disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
              <>
                <span className="loading loading-spinner"></span>
                {t("admin.programs.edit_program_modal.save_button_loading")}
              </>
            ) : (
              t("admin.programs.edit_program_modal.save_button")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { z } from "zod";
import { useForm, FieldErrors } from "react-hook-form";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ProgramLevel, ExerciseAttributeValueEnum } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "../../../../../locales/client";

import { createProgram } from "../actions/create-program.action";

interface CreateProgramFormProps {
  currentStep: number;
  onStepComplete: (step: number) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateProgramForm({ currentStep, onStepComplete, onSuccess, onCancel }: CreateProgramFormProps) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<ExerciseAttributeValueEnum[]>([]);
  const [activeTab, setActiveTab] = useState("en");

  const programSchema = z.object({
    title: z.string().min(1, t("admin.programs.create_program_form.validation.title_required")),
    description: z.string().min(1, t("admin.programs.create_program_form.validation.description_required")),
    category: z.string().min(1, t("admin.programs.create_program_form.validation.category_required")),
    image: z.string().url(t("admin.programs.create_program_form.validation.invalid_url")),
    level: z.nativeEnum(ProgramLevel),
    type: z.nativeEnum(ExerciseAttributeValueEnum),
    durationWeeks: z.number().min(1, t("admin.programs.create_program_form.validation.duration_min")),
    sessionsPerWeek: z.number().min(1, t("admin.programs.create_program_form.validation.sessions_min")),
    sessionDurationMin: z.number().min(5, t("admin.programs.create_program_form.validation.session_duration_min")),
    equipment: z.array(z.nativeEnum(ExerciseAttributeValueEnum)),
    isPremium: z.boolean(),
    coaches: z.array(
      z.object({
        name: z.string().min(1, t("admin.programs.create_program_form.validation.coach_name_required")),
        image: z.string().url(t("admin.programs.create_program_form.validation.invalid_url")),
        order: z.number(),
      }),
    ),
  });

  type ProgramFormData = z.infer<typeof programSchema>;

  const EQUIPMENT_OPTIONS = [
    { value: ExerciseAttributeValueEnum.BODY_ONLY, label: t("admin.programs.create_program_form.options.equipment.body_only") },
    { value: ExerciseAttributeValueEnum.DUMBBELL, label: t("admin.programs.create_program_form.options.equipment.dumbbell") },
    { value: ExerciseAttributeValueEnum.BARBELL, label: t("admin.programs.create_program_form.options.equipment.barbell") },
    { value: ExerciseAttributeValueEnum.KETTLEBELLS, label: t("admin.programs.create_program_form.options.equipment.kettlebells") },
    { value: ExerciseAttributeValueEnum.BANDS, label: t("admin.programs.create_program_form.options.equipment.bands") },
    { value: ExerciseAttributeValueEnum.MACHINE, label: t("admin.programs.create_program_form.options.equipment.machine") },
    { value: ExerciseAttributeValueEnum.CABLE, label: t("admin.programs.create_program_form.options.equipment.cable") },
  ];

  const TYPE_OPTIONS = [
    { value: ExerciseAttributeValueEnum.STRENGTH, label: t("admin.programs.create_program_form.options.types.strength") },
    { value: ExerciseAttributeValueEnum.CARDIO, label: t("admin.programs.create_program_form.options.types.cardio") },
    { value: ExerciseAttributeValueEnum.BODYWEIGHT, label: t("admin.programs.create_program_form.options.types.bodyweight") },
    { value: ExerciseAttributeValueEnum.STRETCHING, label: t("admin.programs.create_program_form.options.types.stretching") },
    { value: ExerciseAttributeValueEnum.CALISTHENIC, label: t("admin.programs.create_program_form.options.types.calisthenic") },
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Partial<ProgramFormData>>({
    resolver: zodResolver(programSchema.partial()),
    defaultValues: {
      level: ProgramLevel.BEGINNER,
      type: ExerciseAttributeValueEnum.STRENGTH,
      durationWeeks: 4,
      sessionsPerWeek: 3,
      sessionDurationMin: 30,
      isPremium: true,
      equipment: [],
      coaches: [],
      title: "",
      description: "",
    },
  });

  const coaches = watch("coaches") || [];

  const addCoach = () => {
    const newCoaches = [...coaches, { name: "", image: "", order: coaches.length }];
    setValue("coaches", newCoaches);
  };

  const removeCoach = (index: number) => {
    const newCoaches = coaches.filter((_, i) => i !== index);
    setValue("coaches", newCoaches);
  };

  const toggleEquipment = (equipment: ExerciseAttributeValueEnum) => {
    const newEquipment = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter((e) => e !== equipment)
      : [...selectedEquipment, equipment];

    setSelectedEquipment(newEquipment);
    setValue("equipment", newEquipment);
  };

  const onSubmit = async (data: Partial<ProgramFormData>) => {
    console.log("Current step:", currentStep);
    if (currentStep < 3) {
      onStepComplete(currentStep);
      return;
    }

    setIsLoading(true);
    try {
      const finalValidation = programSchema.safeParse(data);

      if (!finalValidation.success) {
        console.error("Final form validation failed:", finalValidation.error.flatten().fieldErrors);
        alert(t("admin.programs.create_program_form.validation.submission_error"));
        setIsLoading(false);
        return;
      }
      const validatedData = finalValidation.data;

      await createProgram({
        ...validatedData,
        titleEn: validatedData.title,
        titleEs: validatedData.title,
        titlePt: validatedData.title,
        titleRu: validatedData.title,
        titleZhCn: validatedData.title,
        descriptionEn: validatedData.description,
        descriptionEs: validatedData.description,
        descriptionPt: validatedData.description,
        descriptionRu: validatedData.description,
        descriptionZhCn: validatedData.description,
      });
      // await createProgram(data);
      onSuccess();
    } catch (error) {
      console.error("Error creating program:", error);
      alert(t("admin.programs.create_program_form.error_message"));
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: FieldErrors<Partial<ProgramFormData>>) => {
    console.error("Validation failed", errors);
  };
  
  const renderStep1 = () => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{t("admin.programs.create_program_form.steps.step_1_title")}</h2>
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="title">
                <span className="label-text">{t("admin.programs.create_program_form.labels.title")}</span>
              </label>
              <input className="input input-bordered" id="title" {...register("title")} />
              {errors.title && <div className="text-sm text-error mt-1">{errors.title.message}</div>}
            </div>
            <div className="form-control">
              <label className="label" htmlFor="description">
                <span className="label-text">
                  {t("admin.programs.create_program_form.labels.description")}
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24"
                id="description"
                {...register("description")}
              />
              {errors.description && <div className="text-sm text-error mt-1">{errors.description.message}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label" htmlFor="category">
                <span className="label-text">{t("admin.programs.create_program_form.labels.category")}</span>
              </label>
              <input
                className="input input-bordered"
                id="category"
                {...register("category")}
                placeholder={t("admin.programs.create_program_form.placeholders.category")}
              />
              {errors.category && <div className="text-sm text-error mt-1">{errors.category.message}</div>}
            </div>
            <div className="form-control">
              <label className="label" htmlFor="image">
                <span className="label-text">{t("admin.programs.create_program_form.labels.image_url")}</span>
              </label>
              <input
                className="input input-bordered"
                id="image"
                {...register("image")}
                placeholder={t("admin.programs.create_program_form.placeholders.image_url")}
              />
              {errors.image && <div className="text-sm text-error mt-1">{errors.image.message}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label" htmlFor="level">
                <span className="label-text">{t("admin.programs.create_program_form.labels.level")}</span>
              </label>
              <select
                className="select select-bordered"
                defaultValue={ProgramLevel.BEGINNER}
                {...register("level")}
              >
                <option value={ProgramLevel.BEGINNER}>
                  {t("admin.programs.create_program_form.options.levels.beginner")}
                </option>
                <option value={ProgramLevel.INTERMEDIATE}>
                  {t("admin.programs.create_program_form.options.levels.intermediate")}
                </option>
                <option value={ProgramLevel.ADVANCED}>
                  {t("admin.programs.create_program_form.options.levels.advanced")}
                </option>
                <option value={ProgramLevel.EXPERT}>{t("admin.programs.create_program_form.options.levels.expert")}</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label" htmlFor="type">
                <span className="label-text">{t("admin.programs.create_program_form.labels.type")}</span>
              </label>
              <select
                className="select select-bordered"
                defaultValue={ExerciseAttributeValueEnum.STRENGTH}
                {...register("type")}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{t("admin.programs.create_program_form.steps.step_2_title")}</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label" htmlFor="durationWeeks">
                <span className="label-text">{t("admin.programs.create_program_form.labels.duration_weeks")}</span>
              </label>
              <input
                className="input input-bordered"
                id="durationWeeks"
                min="1"
                type="number"
                {...register("durationWeeks", { valueAsNumber: true })}
              />
              {errors.durationWeeks && <div className="text-sm text-error mt-1">{errors.durationWeeks.message}</div>}
            </div>
            <div className="form-control">
              <label className="label" htmlFor="sessionsPerWeek">
                <span className="label-text">{t("admin.programs.create_program_form.labels.sessions_per_week")}</span>
              </label>
              <input
                className="input input-bordered"
                id="sessionsPerWeek"
                min="1"
                type="number"
                {...register("sessionsPerWeek", { valueAsNumber: true })}
              />
              {errors.sessionsPerWeek && <div className="text-sm text-error mt-1">{errors.sessionsPerWeek.message}</div>}
            </div>
            <div className="form-control">
              <label className="label" htmlFor="sessionDurationMin">
                <span className="label-text">{t("admin.programs.create_program_form.labels.session_duration")}</span>
              </label>
              <input
                className="input input-bordered"
                id="sessionDurationMin"
                min="5"
                type="number"
                {...register("sessionDurationMin", { valueAsNumber: true })}
              />
              {errors.sessionDurationMin && <div className="text-sm text-error mt-1">{errors.sessionDurationMin.message}</div>}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">{t("admin.programs.create_program_form.labels.required_equipment")}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`btn text-xs ${selectedEquipment.includes(option.value) ? "btn-primary" : "btn-outline"}`}
                  onClick={() => toggleEquipment(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">{t("admin.programs.create_program_form.labels.premium_program")}</span>
              <input type="checkbox" className="toggle toggle-primary" {...register("isPremium")} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{t("admin.programs.create_program_form.steps.step_3_title")}</h2>
        <div className="space-y-4">
          {coaches.map((coach, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor={`coaches[${index}].name`}>
                    <span className="label-text">{t("admin.programs.create_program_form.labels.coach_name")}</span>
                  </label>
                  <input
                    className="input input-bordered"
                    id={`coaches[${index}].name`}
                    {...register(`coaches.${index}.name`)}
                    placeholder={t("admin.programs.create_program_form.placeholders.coach_name")}
                  />
                  {errors.coaches?.[index]?.name && (
                    <div className="text-sm text-error mt-1">{errors.coaches[index]?.name?.message}</div>
                  )}
                </div>
                <div className="form-control">
                  <label className="label" htmlFor={`coaches[${index}].image`}>
                    <span className="label-text">{t("admin.programs.create_program_form.labels.coach_image_url")}</span>
                  </label>
                  <input
                    className="input input-bordered"
                    id={`coaches[${index}].image`}
                    {...register(`coaches.${index}.image`)}
                    placeholder={t("admin.programs.create_program_form.placeholders.image_url")}
                  />
                  {errors.coaches?.[index]?.image && (
                    <div className="text-sm text-error mt-1">{errors.coaches[index]?.image?.message}</div>
                  )}
                </div>
              </div>
              <button type="button" className="btn btn-error btn-square" onClick={() => removeCoach(index)}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-outline mt-4" onClick={addCoach}>
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.programs.create_program_form.buttons.add_coach")}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="h-full flex flex-col">
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          {t("admin.programs.create_program_form.buttons.cancel")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading
            ? `${t("commons.loading")}...`
            : currentStep < 3
            ? t("admin.programs.create_program_form.buttons.next")
            : t("admin.programs.create_program_form.buttons.finish")}
        </button>
      </div>
    </form>
  );
}

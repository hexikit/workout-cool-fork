"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { WorkoutSetType, WorkoutSetUnit } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "../../../../../locales/client";

import { CreateSuggestedSetData, SUGGESTED_SET_TEMPLATES } from "@/features/programs/lib/suggested-sets-helpers";

import { ExerciseWithAttributes } from "../types/program.types";
import { addExerciseToSession, getExercises } from "../actions/add-exercise.action";

const getExerciseSchema = (t: any) =>
  z.object({
    exerciseId: z.string().min(1, t("admin.programs.add_exercise_modal.validation.exercise_required")),
    instructions: z.string().min(1, t("admin.programs.add_exercise_modal.validation.instructions_fr_required")),
    // instructionsEn: z.string().min(1, t("admin.programs.add_exercise_modal.validation.instructions_en_required")),
    suggestedSets: z.array(
      z.object({
        setIndex: z.number(),
        types: z.array(z.nativeEnum(WorkoutSetType)),
        valuesInt: z.array(z.number()).optional(),
        valuesSec: z.array(z.number()).optional(),
        units: z.array(z.nativeEnum(WorkoutSetUnit)).optional(),
      }),
    ),
  });

type ExerciseFormData = z.infer<ReturnType<typeof getExerciseSchema>>;

interface AddExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  nextOrder: number;
}

export function AddExerciseModal({ open, onOpenChange, sessionId, nextOrder }: AddExerciseModalProps) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseWithAttributes[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithAttributes | null>(null);
  const [suggestedSets, setSuggestedSets] = useState<any[]>([]);

  const exerciseSchema = getExerciseSchema(t);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      suggestedSets: [],
    },
  });

  useEffect(() => {
    if (open) {
      loadExercises();
    }
  }, [open, searchTerm]);

  const loadExercises = async () => {
    try {
      const data = await getExercises(searchTerm);
      setExercises(data);
    } catch (error) {
      console.error("Error loading exercises:", error);
    }
  };

  const selectExercise = (exercise: ExerciseWithAttributes) => {
    setSelectedExercise(exercise);
    setValue("exerciseId", exercise.id);

    const defaultSets = SUGGESTED_SET_TEMPLATES.strengthTraining();
    setSuggestedSets(defaultSets);
    setValue("suggestedSets", defaultSets);
  };

  const addSet = () => {
    const newSet = {
      setIndex: suggestedSets.length,
      types: [WorkoutSetType.WEIGHT, WorkoutSetType.REPS],
      valuesInt: [20, 10],
      units: [WorkoutSetUnit.kg],
    };
    const newSets = [...suggestedSets, newSet];
    setSuggestedSets(newSets);
    setValue("suggestedSets", newSets);
  };

  const removeSet = (index: number) => {
    const newSets = suggestedSets.filter((_, i) => i !== index);
    const reindexedSets = newSets.map((set, i) => ({ ...set, setIndex: i }));
    setSuggestedSets(reindexedSets);
    setValue("suggestedSets", reindexedSets);
  };

  const updateSet = (index: number, field: string, value: any) => {
    const newSets = [...suggestedSets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSuggestedSets(newSets);
    setValue("suggestedSets", newSets);
  };

  const getTemplate = (template: string) => {
    let sets: CreateSuggestedSetData[] = [];
    switch (template) {
      case "strength":
        sets = SUGGESTED_SET_TEMPLATES.strengthTraining();
        break;
      case "bodyweight":
        sets = SUGGESTED_SET_TEMPLATES.bodyweight();
        break;
      case "timed":
        sets = SUGGESTED_SET_TEMPLATES.timed();
        break;
    }
    setSuggestedSets(sets);
    setValue("suggestedSets", sets);
  };

  const onSubmit = async (data: ExerciseFormData) => {
    setIsLoading(true);
    try {
      await addExerciseToSession({
        sessionId,
        exerciseId: data.exerciseId,
        order: nextOrder,
        instructions: data.instructions,
        instructionsEn: data.instructions,
        suggestedSets: data.suggestedSets,
      });

      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding exercise:", error);
      alert(t("admin.programs.add_exercise_modal.add_exercise_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedExercise(null);
    setSuggestedSets([]);
    setSearchTerm("");
    onOpenChange(false);
  };

  const strengthTemplate = () => getTemplate("strength");
  const bodyweightTemplate = () => getTemplate("bodyweight");
  const timedTemplate = () => getTemplate("timed");

  return (
    <>
      {open && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl h-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t("admin.programs.add_exercise_modal.title")}</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={handleClose}>
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 h-full">
              {!selectedExercise && (
                <div className="card bg-base-100 h-full">
                  <div className="card-body">
                    <h2 className="card-title">{t("admin.programs.add_exercise_modal.select_exercise_title")}</h2>
                    <div className="space-y-4 h-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-base-content/60" />
                        <input
                          className="input input-bordered w-full pl-10"
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={t("admin.programs.add_exercise_modal.search_placeholder")}
                          value={searchTerm}
                        />
                      </div>

                      <div className="grid gap-2  overflow-y-auto">
                        {exercises.map((exercise) => (
                          <div
                            className="flex items-center justify-between p-3 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200"
                            key={exercise.id}
                            onClick={() => selectExercise(exercise)}
                          >
                            <div>
                              <h4 className="font-medium">{exercise.nameEn}</h4>
                              <p className="text-sm text-base-content/60">{exercise.nameEn}</p>
                            </div>
                            <button className="btn btn-sm btn-primary">{t("admin.programs.add_exercise_modal.select_button")}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedExercise && (
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="card bg-base-100 shadow-xl h-full">
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="card-title">{selectedExercise.nameEn}</h2>
                          <p className="text-sm text-base-content/60">{selectedExercise.nameEn}</p>
                        </div>
                        <button className="btn btn-outline" onClick={() => setSelectedExercise(null)} type="button">
                          {t("admin.programs.add_exercise_modal.change_button")}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body h-full">
                      <h2 className="card-title">{t("admin.programs.add_exercise_modal.instructions_title")}</h2>
                      <div className="space-y-4">
                        <div className="form-control">
                          <label className="label" htmlFor="instructionsEn">
                            <span className="label-text">{t("admin.programs.add_exercise_modal.instructions_en_label")}</span>
                          </label>
                          <textarea
                            className="textarea textarea-bordered"
                            id="instructionsEn"
                            {...register("instructions")}
                            placeholder={t("admin.programs.add_exercise_modal.instructions_en_placeholder")}
                            rows={3}
                          />
                          {errors.instructions && <div className="text-sm text-error mt-1">{errors.instructions.message}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="card-title">{t("admin.programs.add_exercise_modal.suggested_sets_title")}</h2>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-outline" onClick={strengthTemplate} type="button">
                            {t("admin.programs.add_exercise_modal.strength_template")}
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={bodyweightTemplate} type="button">
                            {t("admin.programs.add_exercise_modal.bodyweight_template")}
                          </button>
                          <button className="btn btn-sm btn-outline" onClick={timedTemplate} type="button">
                            {t("admin.programs.add_exercise_modal.timed_template")}
                          </button>
                          <button className="btn btn-sm btn-primary" onClick={addSet} type="button">
                            <Plus className="h-4 w-4 mr-1" />
                            {t("admin.programs.add_exercise_modal.add_set_button")}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {suggestedSets.map((set, index) => (
                          <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg" key={index}>
                            <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-5 gap-2">
                              <div className="form-control">
                                <label className="label">
                                  <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.set_type_label")}</span>
                                </label>
                                <select
                                  className="select select-bordered select-sm"
                                  onChange={(e) => {
                                    const type = e.target.value;
                                    if (type === WorkoutSetType.WEIGHT) {
                                      updateSet(index, "types", [WorkoutSetType.WEIGHT, WorkoutSetType.REPS]);
                                    } else {
                                      updateSet(index, "types", [type]);
                                    }
                                  }}
                                  value={set.types?.[0] || ""}
                                >
                                  <option value="">{t("admin.programs.add_exercise_modal.select_option")}</option>
                                  <option value={WorkoutSetType.WEIGHT}>{t("admin.programs.add_exercise_modal.weight_reps_option")}</option>
                                  <option value={WorkoutSetType.REPS}>{t("admin.programs.add_exercise_modal.reps_only_option")}</option>
                                  <option value={WorkoutSetType.TIME}>{t("admin.programs.add_exercise_modal.time_option")}</option>
                                  <option value={WorkoutSetType.BODYWEIGHT}>{t("admin.programs.add_exercise_modal.bodyweight_option")}</option>
                                </select>
                              </div>

                              {set.types?.includes(WorkoutSetType.WEIGHT) && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.weight_label")}</span>
                                  </label>
                                  <input
                                    className="input input-bordered input-sm"
                                    onChange={(e) => {
                                      const weightValue = parseInt(e.target.value) || 0;
                                      const repsValue = set.valuesInt?.[1] || 10;
                                      updateSet(index, "valuesInt", [weightValue, repsValue]);
                                    }}
                                    placeholder={t("admin.programs.add_exercise_modal.kg_placeholder")}
                                    type="number"
                                    value={set.valuesInt?.[0] || ""}
                                  />
                                </div>
                              )}

                              {(set.types?.includes(WorkoutSetType.REPS) || set.types?.includes(WorkoutSetType.WEIGHT)) && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.reps_label")}</span>
                                  </label>
                                  <input
                                    className="input input-bordered input-sm"
                                    onChange={(e) => {
                                      const repsValue = parseInt(e.target.value) || 0;
                                      if (set.types?.includes(WorkoutSetType.WEIGHT)) {
                                        const weightValue = set.valuesInt?.[0] || 20;
                                        updateSet(index, "valuesInt", [weightValue, repsValue]);
                                      } else {
                                        updateSet(index, "valuesInt", [repsValue]);
                                      }
                                    }}
                                    placeholder={t("admin.programs.add_exercise_modal.reps_placeholder")}
                                    type="number"
                                    value={set.types?.includes(WorkoutSetType.WEIGHT) ? set.valuesInt?.[1] || "" : set.valuesInt?.[0] || ""}
                                  />
                                </div>
                              )}

                              {set.types?.includes(WorkoutSetType.BODYWEIGHT) && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.bodyweight_label")}</span>
                                  </label>
                                  <input className="input input-bordered input-sm" placeholder="✔" readOnly value="✔" />
                                </div>
                              )}

                              {set.types?.includes(WorkoutSetType.TIME) && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.time_label")}</span>
                                  </label>
                                  <input
                                    className="input input-bordered input-sm"
                                    onChange={(e) => updateSet(index, "valuesSec", [parseInt(e.target.value) || 0])}
                                    placeholder={t("admin.programs.add_exercise_modal.seconds_placeholder")}
                                    type="number"
                                    value={set.valuesSec?.[0] || ""}
                                  />
                                </div>
                              )}

                              {set.types?.includes(WorkoutSetType.WEIGHT) && (
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text text-xs">{t("admin.programs.add_exercise_modal.unit_label")}</span>
                                  </label>
                                  <select
                                    className="select select-bordered select-sm"
                                    onChange={(e) => updateSet(index, "units", [e.target.value])}
                                    value={set.units?.[0] || ""}
                                  >
                                    <option value="">{t("admin.programs.add_exercise_modal.select_option")}</option>
                                    <option value={WorkoutSetUnit.kg}>kg</option>
                                    <option value={WorkoutSetUnit.lbs}>lbs</option>
                                  </select>
                                </div>
                              )}
                            </div>
                            <button className="btn btn-sm btn-outline" onClick={() => removeSet(index)} type="button">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}

                        {suggestedSets.length === 0 && (
                          <div className="text-center py-8 border-2 border-dashed border-base-300 rounded-lg">
                            <p className="text-base-content/60 mb-3">{t("admin.programs.add_exercise_modal.no_sets_configured")}</p>
                            <button className="btn btn-sm btn-primary" onClick={addSet} type="button">
                              <Plus className="h-4 w-4 mr-1" />
                              {t("admin.programs.add_exercise_modal.add_first_set")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button className="btn btn-outline" onClick={handleClose} type="button">
                      {t("admin.programs.add_exercise_modal.cancel")}
                    </button>
                    <button className="btn btn-primary" disabled={isLoading} type="submit">
                      {isLoading ? t("admin.programs.add_exercise_modal.adding_exercise") : t("admin.programs.add_exercise_modal.add_exercise")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

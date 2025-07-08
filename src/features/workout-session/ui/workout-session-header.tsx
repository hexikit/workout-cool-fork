"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Target, Weight } from "lucide-react";

import { useCurrentLocale, useI18n } from "locales/client";
import { type WeightUnit } from "@/shared/lib/weight-conversion";
import { cn } from "@/shared/lib/utils";
import { useWorkoutSession } from "@/features/workout-session/model/use-workout-session";
import { Button } from "@/components/ui/button";

import { QuitWorkoutDialog } from "../../workout-builder/ui/quit-workout-dialog";

interface WorkoutSessionHeaderProps {
  onQuitWorkout: VoidFunction;
}

export function WorkoutSessionHeader({ onQuitWorkout }: WorkoutSessionHeaderProps) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [volumeUnit, setVolumeUnit] = useState<WeightUnit>("kg");
  const {
    getExercisesCompleted, 
    getTotalExercises,
    session,
    getTotalVolumeInUnit,
    currentExercise,
    currentExerciseIndex,
    currentSetIndex,
  } = useWorkoutSession();
  const exercisesCompleted = getExercisesCompleted();
  const totalExercises = getTotalExercises();
  
  const { totalSetsInWorkout, progressPercentage, currentExerciseName, setProgressText } = useMemo(() => {
    // Guard against missing session or exercise data
    if (!session || !currentExercise) {
      return { totalSetsInWorkout: 0, progressPercentage: 0, currentExerciseName: "", setProgressText: "" };
    }

    // 1. Calculate the total number of sets in the entire workout
    const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    if (totalSets === 0) return { totalSetsInWorkout: 0, progressPercentage: 0, currentExerciseName: "", setProgressText: "" };

    // 2. Calculate how many sets have been passed so far
    let setsCompleted = 0;
    // Add sets from all previous exercises
    for (let i = 0; i < currentExerciseIndex; i++) {
      setsCompleted += session.exercises[i]?.sets.length || 0;
    }
    // Add the sets from the current exercise up to the current set
    setsCompleted += currentSetIndex;

    // 3. Calculate the percentage
    const percentage = (setsCompleted / totalSets) * 100;

    // 4. Get display text
    const name = locale === "fr" ? currentExercise.name : currentExercise.nameEn || currentExercise.name;
    const progressText = `${t("programs.set", { count: 1 })} ${currentSetIndex + 1} / ${currentExercise.sets.length}`;

    return {
      totalSetsInWorkout: totalSets,
      progressPercentage: percentage,
      currentExerciseName: name,
      setProgressText: progressText,
    };
    // Update dependencies for the memoized calculation
  }, [session, currentExercise, currentExerciseIndex, currentSetIndex, t, locale]);

  const totalVolume = getTotalVolumeInUnit(volumeUnit);

  // Format time with animated colons
  const formatTimeWithAnimatedColons = (date: Date) => {
    const timeString = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    const parts = timeString.split(":");

    if (parts.length === 2) {
      return (
        <>
          {parts[0]}
          <span className="animate-colon-blink">:</span>
          {parts[1]}
        </>
      );
    }
    return timeString;
  };

  // Load volume unit preference from localStorage
  useEffect(() => {
    const savedUnit = localStorage.getItem("volumeUnit") as WeightUnit;
    if (savedUnit === "kg" || savedUnit === "lbs") {
      setVolumeUnit(savedUnit);
    }
  }, []);

  // Save volume unit preference to localStorage
  const handleVolumeUnitChange = (unit: WeightUnit) => {
    setVolumeUnit(unit);
    localStorage.setItem("volumeUnit", unit);
  };

  const handleQuitClick = () => {
    setShowQuitDialog(true);
  };

  const handleQuitWithoutSave = () => {
    onQuitWorkout();
    setShowQuitDialog(false);
  };

  return (
    <>
      <div className="w-full mt-2 mb-6 px-2 sm:px-6">
        <div className="rounded-lg p-2 sm:p-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-emerald-400 font-medium text-xs tracking-wide">
              {t("workout_builder.session.started_at")} {formatTimeWithAnimatedColons(new Date(session?.startedAt || ""))}
            </span>

            <Button
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500 px-2 py-1 text-xs dark:border-red-700/40 dark:text-red-300 dark:hover:bg-red-700/10"
              onClick={handleQuitClick}
              variant="outline"
            >
              <X className="h-3 w-3 mr-1" />
              {t("workout_builder.session.quit_workout")}
            </Button>
          </div>

          {/* New Interactive Progress Section */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="relative w-full h-1.5 bg-gray-600 rounded-full">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercentage}%` }}
                />
                {/* Segments for each set */}
                <div className="absolute top-0 left-0 w-full h-full flex">
                  {Array.from({ length: totalSetsInWorkout }).map((_, i) => (
                    <div key={i} className="flex-1 border-r border-gray-900 last:border-r-0" />
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-gray-400 mt-1">
                {Math.round(progressPercentage)}% {t("workout_builder.session.complete")}
              </div>
            </div>

            {/* Current Exercise Info */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white truncate">{currentExerciseName}</h3>
              <p className="text-sm font-medium text-gray-400">{setProgressText}</p>
            </div>
          </div>
        </div>
      </div>

      <QuitWorkoutDialog
        exercisesCompleted={exercisesCompleted}
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onQuitWithoutSave={handleQuitWithoutSave}
        totalExercises={totalExercises}
      />
    </>
  );
}

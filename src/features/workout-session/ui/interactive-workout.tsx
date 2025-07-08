// src/features/workout-session/ui/interactive-workout.tsx
"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "locales/client";
import { useWorkoutSession } from "@/features/workout-session/model/use-workout-session";
import { WorkoutSessionSet } from "@/features/workout-session/ui/workout-session-set";
import { Button } from "@/components/ui/button";
import { getYouTubeEmbedUrl } from "@/shared/lib/youtube";

export function InteractiveWorkout() {
  const t = useI18n();
  const {
    session,
    currentExercise,
    currentExerciseIndex,
    currentSetIndex,
    goToNextSet,
    goToPrevSet,
    updateSet,
    removeSet,
    finishSet,
  } = useWorkoutSession();

  // Get the current set directly from the current exercise
  const currentSet = useMemo(() => {
    return currentExercise?.sets[currentSetIndex];
  }, [currentExercise, currentSetIndex]);

  if (!currentExercise || !currentSet) {
    return null; // Or a loading/empty state
  }

  // Navigation bounds checks
  const isFirstSetInWorkout = currentExerciseIndex === 0 && currentSetIndex === 0;
  const isLastSetInWorkout =
    currentExerciseIndex === (session?.exercises.length ?? 0) - 1 &&
    currentSetIndex === currentExercise.sets.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto my-4 p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      {/* Exercise Video */}
      {currentExercise.fullVideoUrl && (
        <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-black">
          <iframe
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full border-0"
            src={getYouTubeEmbedUrl(currentExercise.fullVideoUrl)!}
          />
        </div>
      )}

      {/* Interactive Set Area */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Navigation */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevSet}
          disabled={isFirstSetInWorkout}
          aria-label="Previous Set"
          className="bg-gray-800 border-gray-600 hover:bg-gray-700 disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Current Set Inputs */}
        <div className="flex-grow">
          {/* The key is to pass the correct indices to the handlers */}
          <WorkoutSessionSet
            key={currentSet.id}
            set={currentSet}
            setIndex={currentSetIndex}
            onChange={(setIndex, data) => updateSet(currentExerciseIndex, setIndex, data)}
            onFinish={() => finishSet(currentExerciseIndex, currentSetIndex)}
            onRemove={() => removeSet(currentExerciseIndex, currentSetIndex)}
          />
        </div>

        {/* Right Navigation */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextSet}
          disabled={isLastSetInWorkout}
          aria-label="Next Set"
          className="bg-gray-800 border-gray-600 hover:bg-gray-700 disabled:opacity-30"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
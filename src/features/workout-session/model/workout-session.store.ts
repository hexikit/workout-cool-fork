import { create } from "zustand";

import { workoutSessionLocal } from "@/shared/lib/workout-session/workout-session.local";
import { WorkoutSession } from "@/shared/lib/workout-session/types/workout-session";
import { convertWeight, type WeightUnit } from "@/shared/lib/weight-conversion";
import { WorkoutSessionExercise, WorkoutSet, WorkoutSetType, WorkoutSetUnit } from "@/features/workout-session/types/workout-set";
import { useWorkoutBuilderStore } from "@/features/workout-builder/model/workout-builder.store";

import { ExerciseWithAttributes } from "../../workout-builder/types";

interface WorkoutSessionProgress {
  exerciseId: string;
  sets: {
    reps: number;
    weight?: number;
    duration?: number;
  }[];
  completed: boolean;
}

interface WorkoutSessionState {
  session: WorkoutSession | null;
  progress: Record<string, WorkoutSessionProgress>;
  elapsedTime: number;
  isTimerRunning: boolean;
  isWorkoutActive: boolean;
  currentExerciseIndex: number;
  currentExercise: WorkoutSessionExercise | null;
  currentSetIndex: number;

  // Progression
  exercisesCompleted: number;
  totalExercises: number;
  progressPercent: number;

  // Actions
  startWorkout: (exercises: ExerciseWithAttributes[] | WorkoutSessionExercise[], equipment: any[], muscles: any[]) => void;
  quitWorkout: () => void;
  completeWorkout: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  updateExerciseProgress: (exerciseId: string, progressData: Partial<WorkoutSessionProgress>) => void;
  addSet: () => void;
  updateSet: (exerciseIndex: number, setIndex: number, data: Partial<WorkoutSet>) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  finishSet: (exerciseIndex: number, setIndex: number) => void;
  goToNextExercise: () => void;
  goToPrevExercise: () => void;
  goToExercise: (targetIndex: number) => void;
  goToNextSet: () => void;
  goToPrevSet: () => void;
  formatElapsedTime: () => string;
  getExercisesCompleted: () => number;
  getTotalExercises: () => number;
  getTotalVolume: () => number;
  getTotalVolumeInUnit: (unit: WeightUnit) => number;
  loadSessionFromLocal: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  session: null,
  progress: {},
  elapsedTime: 0,
  isTimerRunning: false,
  isWorkoutActive: false,
  currentExerciseIndex: 0,
  currentExercise: null,
  exercisesCompleted: 0,
  totalExercises: 0,
  progressPercent: 0,
  currentSetIndex: 0,

  startWorkout: (exercises, _equipment, muscles) => {
    const sessionExercises: WorkoutSessionExercise[] = exercises.map((ex, idx) => {
      // Check if exercise already has sets (from program)
      if ("sets" in ex && ex.sets && ex.sets.length > 0) {
        return {
          ...ex,
          order: idx,
        } as WorkoutSessionExercise;
      }

      // Default sets for custom workouts
      return {
        ...ex,
        order: idx,
        sets: [
          {
            id: `${ex.id}-set-1`,
            setIndex: 0,
            types: ["REPS", "WEIGHT"],
            valuesInt: [],
            valuesSec: [],
            units: [],
            completed: false,
          },
        ],
      } as WorkoutSessionExercise;
    });

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      userId: "local",
      startedAt: new Date().toISOString(),
      exercises: sessionExercises,
      status: "active",
      muscles,
    };

    workoutSessionLocal.add(newSession);
    workoutSessionLocal.setCurrent(newSession.id);

    set({
      session: newSession,
      elapsedTime: 0,
      isTimerRunning: false,
      isWorkoutActive: true,
      currentExercise: sessionExercises[0],
      currentSetIndex: 0,
    });
  },

  quitWorkout: () => {
    const { session } = get();
    if (session) {
      workoutSessionLocal.remove(session.id);
    }
    set({
      session: null,
      progress: {},
      elapsedTime: 0,
      isTimerRunning: false,
      isWorkoutActive: false,
      currentExerciseIndex: 0,
      currentExercise: null,
      currentSetIndex: 0,
    });
  },

  completeWorkout: () => {
    const { session } = get();

    if (session) {
      workoutSessionLocal.update(session.id, { status: "completed", endedAt: new Date().toISOString() });
      set({
        session: { ...session, status: "completed", endedAt: new Date().toISOString() },
        progress: {},
        elapsedTime: 0,
        isTimerRunning: false,
        isWorkoutActive: false,
      });
    }

    useWorkoutBuilderStore.getState().setStep(1);
  },

  toggleTimer: () => {
    set((state) => {
      const newIsRunning = !state.isTimerRunning;
      if (state.session) {
        workoutSessionLocal.update(state.session.id, { isActive: newIsRunning });
      }
      return { isTimerRunning: newIsRunning };
    });
  },

  resetTimer: () => {
    set((state) => {
      if (state.session) {
        workoutSessionLocal.update(state.session.id, { duration: 0 });
      }
      return { elapsedTime: 0 };
    });
  },

  updateExerciseProgress: (exerciseId, progressData) => {
    set((state) => ({
      progress: {
        ...state.progress,
        [exerciseId]: {
          ...state.progress[exerciseId],
          exerciseId,
          sets: [],
          completed: false,
          ...progressData,
        },
      },
    }));
  },

  addSet: () => {
    const { session, currentExerciseIndex } = get();
    if (!session) return;

    const exIdx = currentExerciseIndex;
    const currentExercise = session.exercises[exIdx];
    const sets = currentExercise.sets;

    let typesToCopy: WorkoutSetType[] = ["REPS"];
    let unitsToCopy: WorkoutSetUnit[] = [];

    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];

      if (lastSet.types && lastSet.types.length > 0) {
        typesToCopy = [...lastSet.types];
        if (lastSet.units && lastSet.units.length > 0) {
          unitsToCopy = [...lastSet.units];
        }
      }
    }

    const newSet: WorkoutSet = {
      id: `${currentExercise.id}-set-${sets.length + 1}`,
      setIndex: sets.length,
      types: typesToCopy,
      valuesInt: [],
      valuesSec: [],
      units: unitsToCopy,
      completed: false,
    };

    const updatedExercises = session.exercises.map((ex, idx) => (idx === exIdx ? { ...ex, sets: [...ex.sets, newSet] } : ex));

    workoutSessionLocal.update(session.id, { exercises: updatedExercises });

    set({
      session: { ...session, exercises: updatedExercises },
      currentExercise: { ...updatedExercises[exIdx] },
    });
  },

  updateSet: (exerciseIndex, setIndex, data) => {
    const { session } = get();
    if (!session) return;

    const targetExercise = session.exercises[exerciseIndex];
    if (!targetExercise) return;

    const updatedSets = targetExercise.sets.map((set, idx) => (idx === setIndex ? { ...set, ...data } : set));
    const updatedExercises = session.exercises.map((ex, idx) => (idx === exerciseIndex ? { ...ex, sets: updatedSets } : ex));

    workoutSessionLocal.update(session.id, { exercises: updatedExercises });

    set({
      session: { ...session, exercises: updatedExercises },
      currentExercise: { ...updatedExercises[exerciseIndex] },
    });

    // handle exercisesCompleted
  },

  removeSet: (exerciseIndex, setIndex) => {
    const { session } = get();
    if (!session) return;
    const targetExercise = session.exercises[exerciseIndex];
    if (!targetExercise) return;
    const updatedSets = targetExercise.sets.filter((_, idx) => idx !== setIndex);
    const updatedExercises = session.exercises.map((ex, idx) => (idx === exerciseIndex ? { ...ex, sets: updatedSets } : ex));
    workoutSessionLocal.update(session.id, { exercises: updatedExercises });
    set({
      session: { ...session, exercises: updatedExercises },
      currentExercise: { ...updatedExercises[exerciseIndex] },
    });
  },

  finishSet: (exerciseIndex, setIndex) => {
    get().updateSet(exerciseIndex, setIndex, { completed: true });

    // if has completed all sets, go to next exercise
    const { session } = get();
    if (!session) return;

    const exercise = session.exercises[exerciseIndex];
    if (!exercise) return;

    if (exercise.sets.every((set) => set.completed)) {
      // get().goToNextExercise();
      // update exercisesCompleted
      const exercisesCompleted = get().exercisesCompleted;
      set({ exercisesCompleted: exercisesCompleted + 1 });
    }

    get().goToNextSet();
  },

  goToNextExercise: () => {
    const { currentExerciseIndex, session } = get();
    if (session && currentExerciseIndex < session.exercises.length - 1) {
      get().goToExercise(currentExerciseIndex + 1);
    }
  },

  goToPrevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      get().goToExercise(currentExerciseIndex - 1);
    }
  },

  goToExercise: (targetIndex) => {
    const { session } = get();
    if (!session) return;
    
    if (targetIndex >= 0 && targetIndex < session.exercises.length) {
      workoutSessionLocal.update(session.id, { currentExerciseIndex: targetIndex });
      
      set({
        currentExerciseIndex: targetIndex,
        currentExercise: session.exercises[targetIndex],
        currentSetIndex: 0, // ALWAYS start on the first set of a new exercise
      });
    }
  },

  goToNextSet: () => {
    const { session, currentExerciseIndex, currentSetIndex } = get();
    if (!session) return;

    const currentExercise = session.exercises[currentExerciseIndex];
    
    // If there are more sets in the current exercise
    if (currentSetIndex < currentExercise.sets.length - 1) {
      set({ currentSetIndex: currentSetIndex + 1 });
    } 
    // If it's the last set, try to go to the next exercise
    else if (currentExerciseIndex < session.exercises.length - 1) {
      get().goToNextExercise(); // This will also reset the set index
    }
  },

  goToPrevSet: () => {
    const { session, currentExerciseIndex, currentSetIndex } = get();
    if (!session) return;

    // If we are not on the first set of the current exercise
    if (currentSetIndex > 0) {
      set({ currentSetIndex: currentSetIndex - 1 });
    } 
    // If it's the first set, try to go to the previous exercise
    else if (currentExerciseIndex > 0) {
      const prevExerciseIndex = currentExerciseIndex - 1;
      const prevExercise = session.exercises[prevExerciseIndex];
      const lastSetIndexOfPrevExercise = prevExercise.sets.length - 1;
      
      // Go to the previous exercise AND set the index to its last set
      set({
        currentExerciseIndex: prevExerciseIndex,
        currentExercise: prevExercise,
        currentSetIndex: lastSetIndexOfPrevExercise
      });
    }
  },

  getExercisesCompleted: () => {
    const { session } = get();
    if (!session) return 0;

    // only count exercises with at least one set
    return session.exercises
      .filter((exercise) => exercise.sets.length > 0)
      .filter((exercise) => exercise.sets.every((set) => set.completed)).length;
  },

  getTotalExercises: () => {
    const { session } = get();
    if (!session) return 0;
    return session.exercises.length;
  },

  getTotalVolume: () => {
    const { session } = get();
    if (!session) return 0;

    let totalVolume = 0;

    session.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        // Vérifier si le set est complété et contient REPS et WEIGHT
        if (set.completed && set.types.includes("REPS") && set.types.includes("WEIGHT") && set.valuesInt) {
          const repsIndex = set.types.indexOf("REPS");
          const weightIndex = set.types.indexOf("WEIGHT");

          const reps = set.valuesInt[repsIndex] || 0;
          const weight = set.valuesInt[weightIndex] || 0;

          // Convertir les livres en kg si nécessaire
          const weightInKg =
            set.units && set.units[weightIndex] === "lbs"
              ? weight * 0.453592 // 1 lb = 0.453592 kg
              : weight;

          totalVolume += reps * weightInKg;
        }
      });
    });

    return Math.round(totalVolume);
  },

  getTotalVolumeInUnit: (unit: WeightUnit) => {
    const { session } = get();
    if (!session) return 0;

    let totalVolume = 0;

    session.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        // Vérifier si le set est complété et contient REPS et WEIGHT
        if (set.completed && set.types.includes("REPS") && set.types.includes("WEIGHT") && set.valuesInt) {
          const repsIndex = set.types.indexOf("REPS");
          const weightIndex = set.types.indexOf("WEIGHT");

          const reps = set.valuesInt[repsIndex] || 0;
          const weight = set.valuesInt[weightIndex] || 0;

          // Déterminer l'unité de poids originale de la série
          const originalUnit: WeightUnit = set.units && set.units[weightIndex] === "lbs" ? "lbs" : "kg";

          // Convertir vers l'unité demandée
          const convertedWeight = convertWeight(weight, originalUnit, unit);

          totalVolume += reps * convertedWeight;
        }
      });
    });

    return Math.round(totalVolume * 10) / 10; // Arrondir à 1 décimale
  },

  formatElapsedTime: () => {
    const { elapsedTime } = get();
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const secs = elapsedTime % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  },

  loadSessionFromLocal: () => {
    const currentId = workoutSessionLocal.getCurrent();
    if (currentId) {
      const session = workoutSessionLocal.getById(currentId);
      if (session && session.status === "active") {
        const persistedExerciseIndex = session.currentExerciseIndex ?? 0;
        // NOTE: We are not persisting `currentSetIndex` for simplicity.
        // The session will always resume at the first set of the last active exercise.
        set({
          session,
          isWorkoutActive: true,
          currentExerciseIndex: persistedExerciseIndex,
          currentExercise: session.exercises[persistedExerciseIndex],
          currentSetIndex: 0, // Reset set index on load
        });
      }
    }
  },
}));

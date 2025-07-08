import { 
  Program, 
  ProgramWeek, 
  ProgramSession, 
  ProgramSessionExercise, 
  ProgramSuggestedSet,
  ProgramCoach,
  Exercise,
  ExerciseAttribute,
  ExerciseAttributeName,
  ExerciseAttributeValue,
  UserProgramEnrollment
} from "@prisma/client";

// Type for getProgramById with all associations
export type ProgramWithFullDetails = Program & {
  coaches: ProgramCoach[];
  weeks: (ProgramWeek & {
    sessions: (ProgramSession & {
      exercises: (ProgramSessionExercise & {
        exercise: Exercise & {
          attributes: (ExerciseAttribute & {
            attributeName: ExerciseAttributeName;
            attributeValue: ExerciseAttributeValue;
          })[];
        };
        suggestedSets: ProgramSuggestedSet[];
      })[];
    })[];
  })[];
};

// Type for getPrograms with computed properties
export type ProgramWithStats = Program & {
  coaches: ProgramCoach[];
  weeks: (ProgramWeek & {
    sessions: (ProgramSession & {
      exercises: (ProgramSessionExercise & {
        exercise: Exercise;
        suggestedSets: ProgramSuggestedSet[];
      })[];
    })[];
  })[];
  enrollments: Pick<UserProgramEnrollment, "id">[];
  // Computed properties
  totalEnrollments: number;
  totalWeeks: number;
  totalSessions: number;
  totalExercises: number;
};

// Type for a week with its sessions
export type WeekWithSessions = ProgramWeek & {
  sessions: (ProgramSession & {
    exercises: (ProgramSessionExercise & {
      exercise: Exercise;
      suggestedSets: ProgramSuggestedSet[];
    })[];
  })[];
};

// Type for a session with its exercises
export type SessionWithExercises = ProgramSession & {
  exercises: (ProgramSessionExercise & {
    exercise: Exercise;
    suggestedSets: ProgramSuggestedSet[];
  })[];
};

// Type for an exercise with its complete attributes (for the modal)
export type ExerciseWithAttributes = Exercise & {
  attributes: (ExerciseAttribute & {
    attributeName: ExerciseAttributeName;
    attributeValue: ExerciseAttributeValue;
  })[];
};
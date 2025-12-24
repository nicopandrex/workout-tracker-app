import { ExerciseCategory, Equipment, MuscleGroup } from '@/types';
import { exerciseStorage, routineStorage, dataStorage } from './storage';

const SAMPLE_EXERCISES = [
  {
    name: 'Bench Press',
    category: ExerciseCategory.CHEST,
    equipment: Equipment.BARBELL,
    primaryMuscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroup: MuscleGroup.TRICEPS,
  },
  {
    name: 'Squat',
    category: ExerciseCategory.LEGS,
    equipment: Equipment.BARBELL,
    primaryMuscleGroup: MuscleGroup.QUADS,
    secondaryMuscleGroup: MuscleGroup.GLUTES,
  },
  {
    name: 'Deadlift',
    category: ExerciseCategory.BACK,
    equipment: Equipment.BARBELL,
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroup: MuscleGroup.HAMSTRINGS,
  },
  {
    name: 'Overhead Press',
    category: ExerciseCategory.SHOULDERS,
    equipment: Equipment.BARBELL,
    primaryMuscleGroup: MuscleGroup.SHOULDERS,
    secondaryMuscleGroup: MuscleGroup.TRICEPS,
  },
  {
    name: 'Barbell Row',
    category: ExerciseCategory.BACK,
    equipment: Equipment.BARBELL,
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroup: MuscleGroup.BICEPS,
  },
  {
    name: 'Pull-ups',
    category: ExerciseCategory.BACK,
    equipment: Equipment.BODYWEIGHT,
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroup: MuscleGroup.BICEPS,
  },
  {
    name: 'Dips',
    category: ExerciseCategory.CHEST,
    equipment: Equipment.BODYWEIGHT,
    primaryMuscleGroup: MuscleGroup.TRICEPS,
    secondaryMuscleGroup: MuscleGroup.CHEST,
  },
  {
    name: 'Dumbbell Curl',
    category: ExerciseCategory.ARMS,
    equipment: Equipment.DUMBBELL,
    primaryMuscleGroup: MuscleGroup.BICEPS,
  },
  {
    name: 'Tricep Extension',
    category: ExerciseCategory.ARMS,
    equipment: Equipment.DUMBBELL,
    primaryMuscleGroup: MuscleGroup.TRICEPS,
  },
  {
    name: 'Leg Press',
    category: ExerciseCategory.LEGS,
    equipment: Equipment.MACHINE,
    primaryMuscleGroup: MuscleGroup.QUADS,
    secondaryMuscleGroup: MuscleGroup.GLUTES,
  },
  {
    name: 'Lat Pulldown',
    category: ExerciseCategory.BACK,
    equipment: Equipment.CABLE,
    primaryMuscleGroup: MuscleGroup.BACK,
    secondaryMuscleGroup: MuscleGroup.BICEPS,
  },
  {
    name: 'Cable Fly',
    category: ExerciseCategory.CHEST,
    equipment: Equipment.CABLE,
    primaryMuscleGroup: MuscleGroup.CHEST,
  },
  {
    name: 'Plank',
    category: ExerciseCategory.CORE,
    equipment: Equipment.BODYWEIGHT,
    primaryMuscleGroup: MuscleGroup.ABS,
  },
];

export const seedDatabase = (): void => {
  // Check if already initialized
  if (dataStorage.isInitialized()) {
    console.log('Database already initialized');
    return;
  }

  console.log('Seeding database with sample data...');

  // Create exercises
  const createdExercises = SAMPLE_EXERCISES.map((ex) =>
    exerciseStorage.create(ex)
  );

  // Create Push Day routine
  const pushDay = routineStorage.create({
    name: 'Push Day',
    notes: 'Chest, shoulders, and triceps workout',
  });

  // Find exercises by name
  const benchPress = createdExercises.find((ex) => ex.name === 'Bench Press');
  const overheadPress = createdExercises.find((ex) => ex.name === 'Overhead Press');
  const cableFly = createdExercises.find((ex) => ex.name === 'Cable Fly');
  const tricepExt = createdExercises.find((ex) => ex.name === 'Tricep Extension');
  const dips = createdExercises.find((ex) => ex.name === 'Dips');

  if (benchPress) {
    routineStorage.addExercise(pushDay.id, {
      exerciseId: benchPress.id,
      exerciseName: benchPress.name,
      defaultSets: 4,
      defaultRepRangeMin: 6,
      defaultRepRangeMax: 8,
    });
  }

  if (overheadPress) {
    routineStorage.addExercise(pushDay.id, {
      exerciseId: overheadPress.id,
      exerciseName: overheadPress.name,
      defaultSets: 4,
      defaultRepRangeMin: 8,
      defaultRepRangeMax: 10,
    });
  }

  if (cableFly) {
    routineStorage.addExercise(pushDay.id, {
      exerciseId: cableFly.id,
      exerciseName: cableFly.name,
      defaultSets: 3,
      defaultRepRangeMin: 10,
      defaultRepRangeMax: 12,
    });
  }

  if (tricepExt) {
    routineStorage.addExercise(pushDay.id, {
      exerciseId: tricepExt.id,
      exerciseName: tricepExt.name,
      defaultSets: 3,
      defaultRepRangeMin: 10,
      defaultRepRangeMax: 12,
    });
  }

  if (dips) {
    routineStorage.addExercise(pushDay.id, {
      exerciseId: dips.id,
      exerciseName: dips.name,
      defaultSets: 3,
      defaultRepRangeMin: 8,
      defaultRepRangeMax: 12,
      notes: 'To failure',
    });
  }

  // Create Pull Day routine
  const pullDay = routineStorage.create({
    name: 'Pull Day',
    notes: 'Back and biceps workout',
  });

  const deadlift = createdExercises.find((ex) => ex.name === 'Deadlift');
  const barbellRow = createdExercises.find((ex) => ex.name === 'Barbell Row');
  const pullUps = createdExercises.find((ex) => ex.name === 'Pull-ups');
  const latPulldown = createdExercises.find((ex) => ex.name === 'Lat Pulldown');
  const dumbbellCurl = createdExercises.find((ex) => ex.name === 'Dumbbell Curl');

  if (deadlift) {
    routineStorage.addExercise(pullDay.id, {
      exerciseId: deadlift.id,
      exerciseName: deadlift.name,
      defaultSets: 3,
      defaultRepRangeMin: 5,
      defaultRepRangeMax: 8,
    });
  }

  if (barbellRow) {
    routineStorage.addExercise(pullDay.id, {
      exerciseId: barbellRow.id,
      exerciseName: barbellRow.name,
      defaultSets: 4,
      defaultRepRangeMin: 8,
      defaultRepRangeMax: 10,
    });
  }

  if (pullUps) {
    routineStorage.addExercise(pullDay.id, {
      exerciseId: pullUps.id,
      exerciseName: pullUps.name,
      defaultSets: 3,
      defaultRepRangeMin: 6,
      defaultRepRangeMax: 10,
      notes: 'To failure if needed',
    });
  }

  if (latPulldown) {
    routineStorage.addExercise(pullDay.id, {
      exerciseId: latPulldown.id,
      exerciseName: latPulldown.name,
      defaultSets: 3,
      defaultRepRangeMin: 10,
      defaultRepRangeMax: 12,
    });
  }

  if (dumbbellCurl) {
    routineStorage.addExercise(pullDay.id, {
      exerciseId: dumbbellCurl.id,
      exerciseName: dumbbellCurl.name,
      defaultSets: 3,
      defaultRepRangeMin: 10,
      defaultRepRangeMax: 12,
    });
  }

  // Mark as initialized
  dataStorage.markInitialized();

  console.log('Database seeded successfully!');
  console.log(`Created ${createdExercises.length} exercises`);
  console.log(`Created 2 sample routines`);
};

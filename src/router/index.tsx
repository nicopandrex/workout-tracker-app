import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Routines } from "@/pages/Routines";
import { RoutineEdit } from "@/pages/RoutineEdit";
import { StartWorkout } from "@/pages/StartWorkout";
import { WorkoutSession } from "@/pages/WorkoutSession";
import { Exercises } from "@/pages/Exercises";
import { ExerciseHistory } from "@/pages/ExerciseHistory";
import { Analytics } from "@/pages/Analytics";
import { MuscleStats } from "@/pages/MuscleStats";
import { Settings } from "@/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/routines" replace />,
      },
      {
        path: "routines",
        element: <Routines />,
      },
      {
        path: "routines/:id/edit",
        element: <RoutineEdit />,
      },
      {
        path: "start",
        element: <StartWorkout />,
      },
      {
        path: "workout/:id",
        element: <WorkoutSession />,
      },
      {
        path: "exercises",
        element: <Exercises />,
      },
      {
        path: "exercises/:id/history",
        element: <ExerciseHistory />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "muscles",
        element: <MuscleStats />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

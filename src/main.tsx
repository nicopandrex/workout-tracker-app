import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { router } from "@/router";
import { seedDatabase } from "@/lib/seedData";
import "./index.css";

// Initialize database on app load
seedDatabase();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster duration={3000} />
    </QueryProvider>
  </StrictMode>
);

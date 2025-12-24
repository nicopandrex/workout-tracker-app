import { Outlet, useLocation, Link } from "react-router-dom";
import { ListChecks, Play, Dumbbell, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveSession } from "@/hooks/useSessions";

const NAV_ITEMS = [
  {
    name: "Routines",
    path: "/routines",
    icon: ListChecks,
  },
  {
    name: "Start",
    path: "/start",
    icon: Play,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: TrendingUp,
  },
  {
    name: "Exercises",
    path: "/exercises",
    icon: Dumbbell,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export function Layout() {
  const location = useLocation();
  const { data: activeSession } = useActiveSession();

  // Hide navigation during active workout sessions
  const isWorkoutActive = location.pathname.startsWith("/workout/");

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {!isWorkoutActive && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-around h-20">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all min-w-[80px]",
                      isActive
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active workout indicator */}
          {activeSession && !isWorkoutActive && (
            <Link
              to={`/workout/${activeSession.id}`}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
                <span className="text-sm font-medium">Workout in Progress</span>
              </div>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

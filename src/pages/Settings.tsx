import { Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dataStorage } from "@/lib/storage";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function Settings() {
  const queryClient = useQueryClient();
  const counts = dataStorage.getCounts();

  const handleExportData = () => {
    try {
      const data = dataStorage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `workout-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.exercises || !data.routines || !data.sessions) {
          throw new Error("Invalid data format");
        }

        dataStorage.importAll(data);
        queryClient.invalidateQueries();
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Failed to import data. Please check the file format.");
      }
    };
    input.click();
  };

  const handleClearData = () => {
    try {
      dataStorage.clearAll();
      queryClient.invalidateQueries();
      toast.success("All data cleared");
      window.location.reload();
    } catch (error) {
      toast.error("Failed to clear data");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Data Statistics</CardTitle>
          <CardDescription className="text-slate-400">
            Current data in your app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Exercises</span>
            <span className="text-white font-medium">{counts.exercises}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Routines</span>
            <span className="text-white font-medium">{counts.routines}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Workout Sessions</span>
            <span className="text-white font-medium">{counts.sessions}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Data Management</CardTitle>
          <CardDescription className="text-slate-400">
            Export, import, or clear your workout data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportData}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data (JSON)
          </Button>
          <Button
            onClick={handleImportData}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Data (JSON)
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-red-700 text-red-400 hover:bg-red-950/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Clear All Data?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This action cannot be undone. This will permanently delete all
                  your exercises, routines, and workout sessions. Consider
                  exporting your data first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-700 text-slate-300">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearData}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-400">
          <p>Workout Tracker App v1.0.0</p>
          <p className="mt-2">Built with React, TypeScript, and Tailwind CSS</p>
        </CardContent>
      </Card>
    </div>
  );
}

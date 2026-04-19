import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { GardenDesigner } from "./components/GardenDesigner";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import "./styles.css";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [currentView, setCurrentView] = useState<"dashboard" | "designer">("dashboard");
  const [selectedGardenId, setSelectedGardenId] = useState<Id<"gardens"> | null>(null);
  const seedPlants = useMutation(api.plants.seed);

  useEffect(() => {
    if (isAuthenticated) {
      seedPlants();
    }
  }, [isAuthenticated, seedPlants]);

  const handleDesignGarden = (gardenId: Id<"gardens">) => {
    setSelectedGardenId(gardenId);
    setCurrentView("designer");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedGardenId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-sage/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="font-display text-forest text-xl">Growing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="border-b border-sage/20 bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-forest to-sage flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-xl sm:text-2xl">🌱</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl text-forest tracking-tight">
              Bloom<span className="text-terracotta">Bar</span>
            </h1>
          </button>

          <button
            onClick={() => signOut()}
            className="px-3 py-2 sm:px-4 text-sm sm:text-base text-forest/70 hover:text-forest transition-colors font-body"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {currentView === "dashboard" ? (
          <Dashboard onDesignGarden={handleDesignGarden} />
        ) : selectedGardenId ? (
          <GardenDesigner gardenId={selectedGardenId} onBack={handleBackToDashboard} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="py-4 sm:py-6 border-t border-sage/10">
        <p className="text-center text-xs sm:text-sm text-forest/40 font-body">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;

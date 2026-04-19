import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { PlantCatalog } from "./PlantCatalog";
import { CareGuide } from "./CareGuide";

interface GardenDesignerProps {
  gardenId: Id<"gardens">;
  onBack: () => void;
}

interface DragState {
  type: "catalog" | "canvas";
  plantId?: Id<"plants">;
  gardenPlantId?: Id<"gardenPlants">;
  offsetX: number;
  offsetY: number;
}

interface GardenPlantWithDetails {
  _id: Id<"gardenPlants">;
  gardenId: Id<"gardens">;
  plantId: Id<"plants">;
  x: number;
  y: number;
  addedAt: number;
  plant: Doc<"plants"> | null;
}

export function GardenDesigner({ gardenId, onBack }: GardenDesignerProps) {
  const garden = useQuery(api.gardens.getWithPlants, { id: gardenId });
  const plants = useQuery(api.plants.list, {});
  const addPlant = useMutation(api.gardens.addPlant);
  const updatePosition = useMutation(api.gardens.updatePlantPosition);
  const removePlant = useMutation(api.gardens.removePlant);
  const addToCart = useMutation(api.cart.addFromGarden);
  const checkout = useMutation(api.cart.checkout);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [selectedPlant, setSelectedPlant] = useState<Id<"plants"> | null>(null);
  const [showCatalog, setShowCatalog] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const containerSizes: Record<string, { width: string; height: string }> = {
    small: { width: "200px", height: "200px" },
    medium: { width: "280px", height: "280px" },
    large: { width: "360px", height: "360px" },
  };

  const getClientPosition = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    } else if ('clientX' in e) {
      return { clientX: e.clientX, clientY: e.clientY };
    }
    return { clientX: 0, clientY: 0 };
  };

  const handleDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    type: "catalog" | "canvas",
    plantId?: Id<"plants">,
    gardenPlantId?: Id<"gardenPlants">
  ) => {
    e.preventDefault();
    const { clientX, clientY } = getClientPosition(e);
    setDragState({ type, plantId, gardenPlantId, offsetX: 0, offsetY: 0 });
    setDragPosition({ x: clientX, y: clientY });
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState) return;
    const { clientX, clientY } = getClientPosition(e);
    setDragPosition({ x: clientX, y: clientY });
  }, [dragState]);

  const handleDragEnd = useCallback(async (e: MouseEvent | TouchEvent) => {
    if (!dragState || !canvasRef.current) {
      setDragState(null);
      return;
    }

    const { clientX, clientY } = getClientPosition(e);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    // Check if dropped inside canvas
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      if (dragState.type === "catalog" && dragState.plantId) {
        await addPlant({
          gardenId,
          plantId: dragState.plantId,
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
        });
      } else if (dragState.type === "canvas" && dragState.gardenPlantId) {
        await updatePosition({
          id: dragState.gardenPlantId,
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
        });
      }
    } else if (dragState.type === "canvas" && dragState.gardenPlantId) {
      // Dropped outside canvas - remove plant
      await removePlant({ id: dragState.gardenPlantId });
    }

    setDragState(null);
  }, [dragState, gardenId, addPlant, updatePosition, removePlant]);

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove, { passive: false });
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [dragState, handleDragMove, handleDragEnd]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await addToCart({ gardenId });
      await checkout({ gardenId });
      setCheckoutSuccess(true);
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getDraggedPlant = (): Doc<"plants"> | null | undefined => {
    if (!dragState) return null;
    if (dragState.plantId) {
      return plants?.find((p: Doc<"plants">) => p._id === dragState.plantId);
    }
    if (dragState.gardenPlantId) {
      const gp = garden?.plants.find((p: GardenPlantWithDetails) => p._id === dragState.gardenPlantId);
      return gp?.plant;
    }
    return null;
  };

  const calculateTotal = (): number => {
    if (!garden?.plants) return 0;
    return garden.plants.reduce((sum: number, gp: GardenPlantWithDetails) => sum + (gp.plant?.price || 0), 0);
  };

  const selectedPlantData = plants?.find((p: Doc<"plants">) => p._id === selectedPlant);

  if (!garden || !plants) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-forest/50 font-body">Loading garden...</div>
      </div>
    );
  }

  const canvasSize = containerSizes[garden.containerSize] || containerSizes.medium;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
      {/* Mobile Catalog Toggle */}
      <button
        onClick={() => setShowCatalog(!showCatalog)}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-14 h-14 bg-forest text-cream rounded-full shadow-xl flex items-center justify-center text-2xl"
      >
        {showCatalog ? "✕" : "🌱"}
      </button>

      {/* Plant Catalog - Sidebar */}
      <div className={`${showCatalog ? "fixed inset-0 z-40 lg:relative lg:inset-auto" : "hidden"} lg:block lg:w-80 xl:w-96 bg-white border-r border-sage/20 overflow-y-auto`}>
        <div className="lg:hidden bg-cream p-4 border-b border-sage/20 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-display text-xl text-forest">Plant Catalog</h3>
          <button onClick={() => setShowCatalog(false)} className="text-forest/50 text-2xl">&times;</button>
        </div>
        <PlantCatalog
          plants={plants}
          onDragStart={handleDragStart}
          onSelectPlant={(id) => {
            setSelectedPlant(id);
            if (window.innerWidth < 1024) setShowCatalog(false);
          }}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-cream/50">
        {/* Toolbar */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b border-sage/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 hover:bg-sage/10 rounded-xl transition-colors min-w-[44px] flex items-center justify-center"
            >
              <span className="text-lg sm:text-xl">←</span>
            </button>
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-xl lg:text-2xl text-forest truncate">{garden.name}</h2>
              <p className="text-forest/50 text-xs sm:text-sm font-body hidden sm:block">
                {garden.plants.length} plant{garden.plants.length !== 1 ? "s" : ""} • ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={garden.plants.length === 0}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-terracotta text-cream rounded-xl font-body font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
          >
            Ship Garden 📦
          </button>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto">
          <div className="relative">
            {/* Container Shadow */}
            <div
              className="absolute inset-0 bg-soil/30 rounded-full blur-2xl transform translate-y-4"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                maxWidth: "calc(100vw - 2rem)",
                maxHeight: "calc(100vw - 2rem)"
              }}
            />

            {/* Garden Canvas */}
            <div
              ref={canvasRef}
              className="garden-canvas rounded-full shadow-2xl relative overflow-visible"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                maxWidth: "calc(100vw - 2rem)",
                maxHeight: "calc(100vw - 2rem)"
              }}
            >
              {/* Container rim */}
              <div className="absolute inset-0 rounded-full border-8 border-terracotta/40 pointer-events-none" />

              {/* Soil texture center */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-soil to-soil/80 shadow-inner" />

              {/* Plants */}
              {garden.plants.map((gp: GardenPlantWithDetails) => (
                <div
                  key={gp._id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                  style={{
                    left: `${gp.x}%`,
                    top: `${gp.y}%`,
                    opacity: dragState?.gardenPlantId === gp._id ? 0.3 : 1,
                  }}
                  onMouseDown={(e) => handleDragStart(e, "canvas", undefined, gp._id)}
                  onTouchStart={(e) => handleDragStart(e, "canvas", undefined, gp._id)}
                  onClick={() => gp.plant && setSelectedPlant(gp.plant._id)}
                >
                  <div className="animate-bounce-in">
                    <span
                      className="text-3xl sm:text-4xl drop-shadow-lg block"
                      style={{ filter: `drop-shadow(0 2px 4px ${gp.plant?.color}40)` }}
                    >
                      {gp.plant?.emoji}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {garden.plants.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cream/60 px-4">
                  <span className="text-3xl sm:text-4xl mb-2 animate-pulse-soft">🌱</span>
                  <p className="font-body text-xs sm:text-sm text-center">Drag plants here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drop zone indicator */}
        {dragState && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center bg-forest/80 text-cream px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-body text-sm sm:text-base">
              Drop to plant or drag outside to remove
            </div>
          </div>
        )}
      </div>

      {/* Care Guide Panel */}
      {selectedPlantData && (
        <CareGuide
          plant={selectedPlantData}
          onClose={() => setSelectedPlant(null)}
        />
      )}

      {/* Drag Preview */}
      {dragState && getDraggedPlant() && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: dragPosition.x, top: dragPosition.y }}
        >
          <span className="text-5xl sm:text-6xl drop-shadow-2xl animate-wiggle block">
            {getDraggedPlant()?.emoji}
          </span>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-forest/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto">
            {checkoutSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="text-3xl sm:text-4xl">🎉</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-forest mb-3 sm:mb-4">Order Placed!</h3>
                <p className="text-forest/60 font-body mb-6 sm:mb-8 text-sm sm:text-base">
                  Your garden plants are on their way. Get ready to grow!
                </p>
                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutSuccess(false);
                    onBack();
                  }}
                  className="w-full py-3 sm:py-4 bg-forest text-cream rounded-xl font-body hover:bg-forest/90 transition-colors text-base"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-2xl sm:text-3xl text-forest mb-4 sm:mb-6">Ship Your Garden</h3>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex justify-between font-body text-sm sm:text-base">
                    <span className="text-forest/70">Plants ({garden.plants.length})</span>
                    <span className="text-forest">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm sm:text-base">
                    <span className="text-forest/70">Shipping</span>
                    <span className="text-sage">Free</span>
                  </div>
                  <div className="flex justify-between font-body text-sm sm:text-base">
                    <span className="text-forest/70">Care Guide Card</span>
                    <span className="text-sage">Included</span>
                  </div>
                  <hr className="border-sage/20" />
                  <div className="flex justify-between font-display text-lg sm:text-xl">
                    <span className="text-forest">Total</span>
                    <span className="text-forest">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-sage/10 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                  <p className="text-forest/70 text-xs sm:text-sm font-body">
                    🌿 All plants ship ready-to-plant with care instructions and companion planting tips.
                  </p>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-3 sm:py-4 border border-sage/30 text-forest rounded-xl font-body hover:bg-sage/10 transition-colors text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex-1 py-3 sm:py-4 bg-terracotta text-cream rounded-xl font-body font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50 text-base"
                  >
                    {isCheckingOut ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

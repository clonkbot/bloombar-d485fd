import { Doc } from "../../convex/_generated/dataModel";

interface CareGuideProps {
  plant: Doc<"plants">;
  onClose: () => void;
}

const sunLabels: Record<string, { label: string; emoji: string }> = {
  full: { label: "Full Sun (6+ hours)", emoji: "☀️" },
  partial: { label: "Partial Sun (3-6 hours)", emoji: "⛅" },
  shade: { label: "Shade (< 3 hours)", emoji: "🌥️" },
};

const waterLabels: Record<string, { label: string; emoji: string }> = {
  daily: { label: "Daily", emoji: "💧💧💧" },
  weekly: { label: "Weekly", emoji: "💧💧" },
  biweekly: { label: "Every 2 weeks", emoji: "💧" },
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: "Beginner Friendly", color: "text-sage" },
  moderate: { label: "Some Experience", color: "text-yellow-600" },
  expert: { label: "Expert Level", color: "text-terracotta" },
};

export function CareGuide({ plant, onClose }: CareGuideProps) {
  return (
    <div className="fixed inset-0 lg:relative lg:inset-auto lg:w-80 xl:w-96 bg-white border-l border-sage/20 shadow-xl lg:shadow-none overflow-y-auto z-50 lg:z-auto animate-slide-up lg:animate-none">
      {/* Header */}
      <div
        className="p-4 sm:p-6 border-b border-sage/20 sticky top-0 bg-white z-10"
        style={{ backgroundColor: `${plant.color}10` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <span
                className="text-4xl sm:text-5xl"
                style={{ filter: `drop-shadow(0 2px 4px ${plant.color}40)` }}
              >
                {plant.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-xl sm:text-2xl text-forest truncate">{plant.name}</h3>
                <p className="text-forest/50 text-xs sm:text-sm font-body italic truncate">
                  {plant.scientificName}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sage/10 rounded-xl transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-xl sm:text-2xl font-display text-forest">${plant.price.toFixed(2)}</span>
          <span className={`text-xs sm:text-sm font-body ${difficultyLabels[plant.difficulty].color}`}>
            {difficultyLabels[plant.difficulty].label}
          </span>
        </div>
      </div>

      {/* Care Requirements */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h4 className="font-display text-base sm:text-lg text-forest mb-3 sm:mb-4">Care Requirements</h4>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-cream rounded-xl border border-sage/20">
              <span className="text-2xl sm:text-3xl">{sunLabels[plant.sunRequirement]?.emoji}</span>
              <div>
                <p className="font-body text-xs sm:text-sm text-forest/50">Sunlight</p>
                <p className="font-body text-sm sm:text-base text-forest">{sunLabels[plant.sunRequirement]?.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-cream rounded-xl border border-sage/20">
              <span className="text-2xl sm:text-3xl">{waterLabels[plant.waterFrequency]?.emoji}</span>
              <div>
                <p className="font-body text-xs sm:text-sm text-forest/50">Watering</p>
                <p className="font-body text-sm sm:text-base text-forest">{waterLabels[plant.waterFrequency]?.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Care Guide */}
        <div>
          <h4 className="font-display text-base sm:text-lg text-forest mb-2 sm:mb-3">Growing Tips</h4>
          <p className="font-body text-sm sm:text-base text-forest/70 leading-relaxed">
            {plant.careGuide}
          </p>
        </div>

        {/* Companion Plants */}
        <div>
          <h4 className="font-display text-base sm:text-lg text-forest mb-2 sm:mb-3">Good Companions</h4>
          <div className="flex flex-wrap gap-2">
            {plant.companionPlants.map((companion: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1.5 sm:py-2 bg-sage/10 text-forest/70 rounded-lg font-body text-xs sm:text-sm"
              >
                {companion}
              </span>
            ))}
          </div>
        </div>

        {/* Category Tag */}
        <div className="pt-4 border-t border-sage/20">
          <span
            className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-body text-xs sm:text-sm capitalize"
            style={{ backgroundColor: `${plant.color}20`, color: plant.color }}
          >
            {plant.category}
          </span>
        </div>
      </div>
    </div>
  );
}

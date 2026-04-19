import { useState } from "react";
import { Id, Doc } from "../../convex/_generated/dataModel";

interface PlantCatalogProps {
  plants: Doc<"plants">[];
  onDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    type: "catalog",
    plantId: Id<"plants">
  ) => void;
  onSelectPlant: (id: Id<"plants">) => void;
}

const categories = [
  { id: "all", label: "All Plants", emoji: "🌿" },
  { id: "flower", label: "Flowers", emoji: "🌸" },
  { id: "herb", label: "Herbs", emoji: "🌱" },
  { id: "vegetable", label: "Vegetables", emoji: "🥬" },
  { id: "succulent", label: "Succulents", emoji: "🪴" },
  { id: "foliage", label: "Foliage", emoji: "🌲" },
];

const sunLabels: Record<string, { label: string; emoji: string }> = {
  full: { label: "Full Sun", emoji: "☀️" },
  partial: { label: "Partial", emoji: "⛅" },
  shade: { label: "Shade", emoji: "🌥️" },
};

const difficultyColors: Record<string, string> = {
  easy: "bg-sage/20 text-sage",
  moderate: "bg-yellow-100 text-yellow-700",
  expert: "bg-terracotta/20 text-terracotta",
};

export function PlantCatalog({ plants, onDragStart, onSelectPlant }: PlantCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlants = plants.filter((plant) => {
    const matchesCategory = selectedCategory === "all" || plant.category === selectedCategory;
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - hidden on mobile as we have the sticky header */}
      <div className="hidden lg:block p-4 sm:p-6 border-b border-sage/20">
        <h3 className="font-display text-xl sm:text-2xl text-forest mb-3 sm:mb-4">Plant Catalog</h3>
        <input
          type="text"
          placeholder="Search plants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-cream border border-sage/30 text-forest placeholder-forest/40 font-body text-sm sm:text-base"
        />
      </div>

      {/* Search on mobile */}
      <div className="lg:hidden p-4 bg-white border-b border-sage/20">
        <input
          type="text"
          placeholder="Search plants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-cream border border-sage/30 text-forest placeholder-forest/40 font-body text-base"
        />
      </div>

      {/* Categories - Horizontal scroll on mobile */}
      <div className="border-b border-sage/20 overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 p-3 sm:p-4 min-w-max lg:flex-wrap lg:min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-lg font-body text-xs sm:text-sm whitespace-nowrap transition-all min-h-[40px] ${
                selectedCategory === cat.id
                  ? "bg-forest text-cream"
                  : "bg-sage/10 text-forest/70 hover:bg-sage/20"
              }`}
            >
              <span className="mr-1">{cat.emoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plant Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <p className="text-xs text-forest/50 font-body mb-3 sm:mb-4 hidden lg:block">
          Drag plants to add to your garden
        </p>
        <p className="text-xs text-forest/50 font-body mb-3 lg:hidden">
          Tap & hold to drag, or tap to view details
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
          {filteredPlants.map((plant) => (
            <div
              key={plant._id}
              className="plant-item bg-cream rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-sage/20 cursor-grab active:cursor-grabbing hover:border-sage transition-all hover:shadow-md group"
              onMouseDown={(e) => onDragStart(e, "catalog", plant._id)}
              onTouchStart={(e) => onDragStart(e, "catalog", plant._id)}
              onClick={() => onSelectPlant(plant._id)}
            >
              {/* Plant emoji with color glow */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${plant.color}20` }}
              >
                <span className="text-2xl sm:text-3xl">{plant.emoji}</span>
              </div>

              {/* Plant info */}
              <h4 className="font-display text-sm sm:text-base text-forest leading-tight">{plant.name}</h4>
              <p className="text-forest/50 text-xs font-body italic truncate mb-2">
                {plant.scientificName}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white rounded-md border border-sage/20">
                  {sunLabels[plant.sunRequirement]?.emoji}
                </span>
                <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md capitalize ${difficultyColors[plant.difficulty]}`}>
                  {plant.difficulty}
                </span>
              </div>

              {/* Price */}
              <p className="font-body font-medium text-forest text-sm sm:text-base">
                ${plant.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {filteredPlants.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <span className="text-4xl sm:text-5xl mb-3 sm:mb-4 block">🔍</span>
            <p className="text-forest/50 font-body text-sm sm:text-base">No plants found</p>
          </div>
        )}
      </div>
    </div>
  );
}

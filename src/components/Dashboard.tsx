import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface DashboardProps {
  onDesignGarden: (gardenId: Id<"gardens">) => void;
}

export function Dashboard({ onDesignGarden }: DashboardProps) {
  const gardens = useQuery(api.gardens.list);
  const orders = useQuery(api.orders.list);
  const createGarden = useMutation(api.gardens.create);
  const deleteGarden = useMutation(api.gardens.remove);
  const [showNewGardenModal, setShowNewGardenModal] = useState(false);
  const [newGarden, setNewGarden] = useState({
    name: "",
    containerType: "terracotta",
    containerSize: "medium",
  });

  const handleCreateGarden = async (e: React.FormEvent) => {
    e.preventDefault();
    const gardenId = await createGarden(newGarden);
    setShowNewGardenModal(false);
    setNewGarden({ name: "", containerType: "terracotta", containerSize: "medium" });
    onDesignGarden(gardenId);
  };

  const containerEmojis: Record<string, string> = {
    terracotta: "🏺",
    ceramic: "🫖",
    wooden: "🪵",
    metal: "🪣",
  };

  const sizeLabels: Record<string, string> = {
    small: "Small (6\")",
    medium: "Medium (12\")",
    large: "Large (18\")",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Hero Section */}
      <div className="text-center mb-10 sm:mb-16 animate-slide-up">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-forest mb-3 sm:mb-4">
          Your Garden Studio
        </h2>
        <p className="text-forest/60 font-body text-base sm:text-lg max-w-2xl mx-auto px-4">
          Create beautiful container gardens, learn care tips, and get everything delivered to your door.
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16">
        <button
          onClick={() => setShowNewGardenModal(true)}
          className="group p-6 sm:p-8 bg-gradient-to-br from-forest to-sage rounded-2xl sm:rounded-3xl text-left card-hover shadow-lg"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl sm:text-4xl">🌱</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-cream mb-2">Start New Garden</h3>
          <p className="text-cream/70 font-body text-sm sm:text-base">
            Design a fresh container garden from scratch
          </p>
        </button>

        <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-sage/20 shadow-lg">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-sage/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-3xl sm:text-4xl">📦</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-forest mb-2">Recent Orders</h3>
          {orders === undefined ? (
            <p className="text-forest/50 font-body text-sm sm:text-base">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="text-forest/50 font-body text-sm sm:text-base">
              No orders yet. Design a garden and ship it!
            </p>
          ) : (
            <p className="text-forest/70 font-body text-sm sm:text-base">
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </p>
          )}
        </div>
      </div>

      {/* Gardens Grid */}
      <div className="mb-8 sm:mb-12">
        <h3 className="font-display text-2xl sm:text-3xl text-forest mb-4 sm:mb-6">Your Gardens</h3>

        {gardens === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 sm:h-64 bg-white/50 rounded-2xl sm:rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : gardens.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white/50 rounded-2xl sm:rounded-3xl border border-dashed border-sage/30">
            <span className="text-5xl sm:text-6xl mb-4 block">🪴</span>
            <p className="text-forest/60 font-body text-base sm:text-lg mb-4">No gardens yet</p>
            <button
              onClick={() => setShowNewGardenModal(true)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-forest text-cream rounded-xl font-body hover:bg-forest/90 transition-colors text-sm sm:text-base"
            >
              Create Your First Garden
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {gardens.map((garden: typeof gardens[number], index: number) => (
              <div
                key={garden._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-sage/20 overflow-hidden card-hover shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-32 sm:h-40 bg-gradient-to-br from-sage/30 to-forest/20 flex items-center justify-center relative">
                  <span className="text-5xl sm:text-6xl">{containerEmojis[garden.containerType]}</span>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2 sm:px-3 py-1 bg-white/80 rounded-full text-xs sm:text-sm font-body text-forest/70">
                    {sizeLabels[garden.containerSize]}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h4 className="font-display text-lg sm:text-xl text-forest mb-2">{garden.name}</h4>
                  <p className="text-forest/50 text-xs sm:text-sm font-body mb-4">
                    Created {new Date(garden.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <button
                      onClick={() => onDesignGarden(garden._id)}
                      className="flex-1 py-2.5 sm:py-3 bg-forest text-cream rounded-xl font-body text-sm sm:text-base hover:bg-forest/90 transition-colors"
                    >
                      Design
                    </button>
                    <button
                      onClick={() => deleteGarden({ id: garden._id })}
                      className="p-2.5 sm:p-3 border border-terracotta/30 text-terracotta rounded-xl hover:bg-terracotta/10 transition-colors min-w-[44px] flex items-center justify-center"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Garden Modal */}
      {showNewGardenModal && (
        <div className="fixed inset-0 bg-forest/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-cream rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl sm:text-3xl text-forest mb-4 sm:mb-6">New Garden</h3>

            <form onSubmit={handleCreateGarden} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-body text-forest/70 mb-2">
                  Garden Name
                </label>
                <input
                  type="text"
                  required
                  value={newGarden.name}
                  onChange={(e) => setNewGarden({ ...newGarden, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-sage/30 text-forest font-body text-base focus:border-forest transition-colors"
                  placeholder="My Herb Garden"
                />
              </div>

              <div>
                <label className="block text-sm font-body text-forest/70 mb-3">
                  Container Type
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  {["terracotta", "ceramic", "wooden", "metal"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewGarden({ ...newGarden, containerType: type })}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[60px] ${
                        newGarden.containerType === type
                          ? "border-forest bg-forest/10"
                          : "border-sage/20 hover:border-sage"
                      }`}
                    >
                      <span className="text-xl sm:text-2xl block mb-1">{containerEmojis[type]}</span>
                      <span className="text-xs text-forest/70 capitalize block truncate">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-body text-forest/70 mb-3">
                  Container Size
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["small", "medium", "large"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setNewGarden({ ...newGarden, containerSize: size })}
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[60px] ${
                        newGarden.containerSize === size
                          ? "border-forest bg-forest/10"
                          : "border-sage/20 hover:border-sage"
                      }`}
                    >
                      <span className="text-lg sm:text-xl font-display text-forest capitalize">{size}</span>
                      <span className="text-xs text-forest/50 block">{sizeLabels[size].match(/\(.*\)/)?.[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewGardenModal(false)}
                  className="flex-1 py-3 sm:py-4 border border-sage/30 text-forest rounded-xl font-body hover:bg-sage/10 transition-colors text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 sm:py-4 bg-forest text-cream rounded-xl font-body hover:bg-forest/90 transition-colors text-base"
                >
                  Create Garden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

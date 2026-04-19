import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      const plants = await ctx.db.query("plants").collect();
      return plants.filter(p => p.category === args.category);
    }
    return await ctx.db.query("plants").collect();
  },
});

export const get = query({
  args: { id: v.id("plants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("plants").first();
    if (existing) return "Already seeded";

    const plants = [
      {
        name: "Lavender",
        scientificName: "Lavandula angustifolia",
        category: "flower",
        sunRequirement: "full",
        waterFrequency: "weekly",
        difficulty: "easy",
        price: 12.99,
        emoji: "💜",
        color: "#9B7ED9",
        careGuide: "Plant in well-draining soil. Water when top inch is dry. Prune after flowering to maintain shape. Loves full sun and good air circulation.",
        companionPlants: ["Rosemary", "Thyme", "Sage"],
      },
      {
        name: "Cherry Tomato",
        scientificName: "Solanum lycopersicum",
        category: "vegetable",
        sunRequirement: "full",
        waterFrequency: "daily",
        difficulty: "moderate",
        price: 8.99,
        emoji: "🍅",
        color: "#E74C3C",
        careGuide: "Needs 6-8 hours of direct sunlight. Water deeply and consistently. Support with stakes or cages. Feed with tomato fertilizer bi-weekly.",
        companionPlants: ["Basil", "Marigold", "Parsley"],
      },
      {
        name: "Basil",
        scientificName: "Ocimum basilicum",
        category: "herb",
        sunRequirement: "full",
        waterFrequency: "daily",
        difficulty: "easy",
        price: 5.99,
        emoji: "🌿",
        color: "#27AE60",
        careGuide: "Keep soil consistently moist but not waterlogged. Pinch off flower buds to encourage leaf growth. Harvest from the top down.",
        companionPlants: ["Tomato", "Pepper", "Oregano"],
      },
      {
        name: "Echeveria",
        scientificName: "Echeveria elegans",
        category: "succulent",
        sunRequirement: "full",
        waterFrequency: "biweekly",
        difficulty: "easy",
        price: 9.99,
        emoji: "🪴",
        color: "#A8E6CF",
        careGuide: "Use fast-draining succulent soil. Water only when completely dry. Provide bright indirect to direct light. Avoid water on leaves.",
        companionPlants: ["Sedum", "Sempervivum", "Crassula"],
      },
      {
        name: "Mint",
        scientificName: "Mentha spicata",
        category: "herb",
        sunRequirement: "partial",
        waterFrequency: "daily",
        difficulty: "easy",
        price: 4.99,
        emoji: "🌱",
        color: "#2ECC71",
        careGuide: "Keep in its own container - mint spreads aggressively. Keep soil moist. Harvest frequently to encourage bushy growth.",
        companionPlants: ["Tomato", "Cabbage", "Carrot"],
      },
      {
        name: "Marigold",
        scientificName: "Tagetes patula",
        category: "flower",
        sunRequirement: "full",
        waterFrequency: "weekly",
        difficulty: "easy",
        price: 6.99,
        emoji: "🌼",
        color: "#F39C12",
        careGuide: "Deadhead regularly for continuous blooms. Tolerates poor soil. Natural pest deterrent - great companion plant.",
        companionPlants: ["Tomato", "Pepper", "Cucumber"],
      },
      {
        name: "Rosemary",
        scientificName: "Salvia rosmarinus",
        category: "herb",
        sunRequirement: "full",
        waterFrequency: "weekly",
        difficulty: "moderate",
        price: 7.99,
        emoji: "🌲",
        color: "#1ABC9C",
        careGuide: "Prefers dry conditions. Allow soil to dry between waterings. Prune regularly to prevent woody growth. Needs excellent drainage.",
        companionPlants: ["Lavender", "Sage", "Thyme"],
      },
      {
        name: "Fern",
        scientificName: "Nephrolepis exaltata",
        category: "foliage",
        sunRequirement: "shade",
        waterFrequency: "daily",
        difficulty: "moderate",
        price: 14.99,
        emoji: "🌿",
        color: "#16A085",
        careGuide: "Keep soil consistently moist. Mist regularly for humidity. Avoid direct sunlight. Remove yellow fronds promptly.",
        companionPlants: ["Begonia", "Impatiens", "Caladium"],
      },
      {
        name: "Pepper",
        scientificName: "Capsicum annuum",
        category: "vegetable",
        sunRequirement: "full",
        waterFrequency: "daily",
        difficulty: "moderate",
        price: 7.99,
        emoji: "🌶️",
        color: "#E74C3C",
        careGuide: "Needs warm temperatures. Water consistently but avoid waterlogging. Feed with balanced fertilizer. Support heavy branches.",
        companionPlants: ["Basil", "Tomato", "Carrot"],
      },
      {
        name: "Petunia",
        scientificName: "Petunia × atkinsiana",
        category: "flower",
        sunRequirement: "full",
        waterFrequency: "daily",
        difficulty: "easy",
        price: 5.99,
        emoji: "🌸",
        color: "#E91E63",
        careGuide: "Deadhead spent blooms for continuous flowering. Feed weekly with liquid fertilizer. Pinch back leggy stems.",
        companionPlants: ["Marigold", "Salvia", "Geranium"],
      },
      {
        name: "Snake Plant",
        scientificName: "Sansevieria trifasciata",
        category: "foliage",
        sunRequirement: "partial",
        waterFrequency: "biweekly",
        difficulty: "easy",
        price: 18.99,
        emoji: "🌵",
        color: "#2C3E50",
        careGuide: "Extremely drought tolerant. Water sparingly - once every 2-3 weeks. Tolerates low light. Wipe leaves occasionally.",
        companionPlants: ["Pothos", "ZZ Plant", "Philodendron"],
      },
      {
        name: "Strawberry",
        scientificName: "Fragaria × ananassa",
        category: "vegetable",
        sunRequirement: "full",
        waterFrequency: "daily",
        difficulty: "moderate",
        price: 11.99,
        emoji: "🍓",
        color: "#C0392B",
        careGuide: "Keep soil evenly moist. Mulch to keep berries clean. Remove runners for larger fruit. Protect from birds.",
        companionPlants: ["Lettuce", "Spinach", "Thyme"],
      },
    ];

    for (const plant of plants) {
      await ctx.db.insert("plants", plant);
    }

    return "Seeded " + plants.length + " plants";
  },
});

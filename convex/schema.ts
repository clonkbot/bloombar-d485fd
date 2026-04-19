import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Plant catalog - available plants to add to gardens
  plants: defineTable({
    name: v.string(),
    scientificName: v.string(),
    category: v.string(), // "flower", "herb", "vegetable", "succulent", "foliage"
    sunRequirement: v.string(), // "full", "partial", "shade"
    waterFrequency: v.string(), // "daily", "weekly", "biweekly"
    difficulty: v.string(), // "easy", "moderate", "expert"
    price: v.number(),
    emoji: v.string(),
    color: v.string(),
    careGuide: v.string(),
    companionPlants: v.array(v.string()),
  }),

  // User's garden designs
  gardens: defineTable({
    userId: v.id("users"),
    name: v.string(),
    containerType: v.string(), // "terracotta", "ceramic", "wooden", "metal"
    containerSize: v.string(), // "small", "medium", "large"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Plants placed in a garden
  gardenPlants: defineTable({
    gardenId: v.id("gardens"),
    plantId: v.id("plants"),
    x: v.number(), // position 0-100 percentage
    y: v.number(), // position 0-100 percentage
    addedAt: v.number(),
  }).index("by_garden", ["gardenId"]),

  // Shopping cart
  cartItems: defineTable({
    userId: v.id("users"),
    gardenId: v.id("gardens"),
    plantId: v.id("plants"),
    quantity: v.number(),
  }).index("by_user", ["userId"]),

  // Orders
  orders: defineTable({
    userId: v.id("users"),
    gardenId: v.id("gardens"),
    totalPrice: v.number(),
    status: v.string(), // "pending", "processing", "shipped", "delivered"
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});

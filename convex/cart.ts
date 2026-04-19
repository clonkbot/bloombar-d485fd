import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const plant = await ctx.db.get(item.plantId);
        const garden = await ctx.db.get(item.gardenId);
        return { ...item, plant, garden };
      })
    );

    return itemsWithDetails;
  },
});

export const addFromGarden = mutation({
  args: { gardenId: v.id("gardens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const garden = await ctx.db.get(args.gardenId);
    if (!garden || garden.userId !== userId) throw new Error("Garden not found");

    // Get all plants in the garden
    const gardenPlants = await ctx.db
      .query("gardenPlants")
      .withIndex("by_garden", (q) => q.eq("gardenId", args.gardenId))
      .collect();

    // Clear existing cart items for this garden
    const existingItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const itemsForGarden = existingItems.filter(i => i.gardenId === args.gardenId);
    for (const item of itemsForGarden) {
      await ctx.db.delete(item._id);
    }

    // Count plants by type
    const plantCounts: Record<string, number> = {};
    for (const gp of gardenPlants) {
      const plantIdStr = gp.plantId;
      plantCounts[plantIdStr] = (plantCounts[plantIdStr] || 0) + 1;
    }

    // Add to cart
    for (const [plantIdStr, quantity] of Object.entries(plantCounts)) {
      await ctx.db.insert("cartItems", {
        userId,
        gardenId: args.gardenId,
        plantId: plantIdStr as any,
        quantity,
      });
    }
  },
});

export const clear = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
  },
});

export const checkout = mutation({
  args: { gardenId: v.id("gardens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const gardenItems = items.filter(i => i.gardenId === args.gardenId);
    if (gardenItems.length === 0) throw new Error("Cart is empty");

    let total = 0;
    for (const item of gardenItems) {
      const plant = await ctx.db.get(item.plantId);
      if (plant) {
        total += plant.price * item.quantity;
      }
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId,
      gardenId: args.gardenId,
      totalPrice: total,
      status: "pending",
      createdAt: Date.now(),
    });

    // Clear cart items for this garden
    for (const item of gardenItems) {
      await ctx.db.delete(item._id);
    }

    return orderId;
  },
});

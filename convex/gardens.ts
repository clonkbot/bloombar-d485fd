import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("gardens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("gardens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const garden = await ctx.db.get(args.id);
    if (!garden || garden.userId !== userId) return null;
    return garden;
  },
});

export const getWithPlants = query({
  args: { id: v.id("gardens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const garden = await ctx.db.get(args.id);
    if (!garden || garden.userId !== userId) return null;

    const gardenPlants = await ctx.db
      .query("gardenPlants")
      .withIndex("by_garden", (q) => q.eq("gardenId", args.id))
      .collect();

    const plantsWithDetails = await Promise.all(
      gardenPlants.map(async (gp) => {
        const plant = await ctx.db.get(gp.plantId);
        return {
          ...gp,
          plant,
        };
      })
    );

    return {
      ...garden,
      plants: plantsWithDetails,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    containerType: v.string(),
    containerSize: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("gardens", {
      userId,
      name: args.name,
      containerType: args.containerType,
      containerSize: args.containerSize,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("gardens"),
    name: v.optional(v.string()),
    containerType: v.optional(v.string()),
    containerSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const garden = await ctx.db.get(args.id);
    if (!garden || garden.userId !== userId) throw new Error("Garden not found");

    await ctx.db.patch(args.id, {
      ...(args.name && { name: args.name }),
      ...(args.containerType && { containerType: args.containerType }),
      ...(args.containerSize && { containerSize: args.containerSize }),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("gardens") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const garden = await ctx.db.get(args.id);
    if (!garden || garden.userId !== userId) throw new Error("Garden not found");

    // Delete all plants in the garden
    const gardenPlants = await ctx.db
      .query("gardenPlants")
      .withIndex("by_garden", (q) => q.eq("gardenId", args.id))
      .collect();

    for (const gp of gardenPlants) {
      await ctx.db.delete(gp._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const addPlant = mutation({
  args: {
    gardenId: v.id("gardens"),
    plantId: v.id("plants"),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const garden = await ctx.db.get(args.gardenId);
    if (!garden || garden.userId !== userId) throw new Error("Garden not found");

    await ctx.db.insert("gardenPlants", {
      gardenId: args.gardenId,
      plantId: args.plantId,
      x: args.x,
      y: args.y,
      addedAt: Date.now(),
    });

    await ctx.db.patch(args.gardenId, { updatedAt: Date.now() });
  },
});

export const updatePlantPosition = mutation({
  args: {
    id: v.id("gardenPlants"),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const gardenPlant = await ctx.db.get(args.id);
    if (!gardenPlant) throw new Error("Plant not found");

    const garden = await ctx.db.get(gardenPlant.gardenId);
    if (!garden || garden.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { x: args.x, y: args.y });
    await ctx.db.patch(gardenPlant.gardenId, { updatedAt: Date.now() });
  },
});

export const removePlant = mutation({
  args: { id: v.id("gardenPlants") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const gardenPlant = await ctx.db.get(args.id);
    if (!gardenPlant) throw new Error("Plant not found");

    const garden = await ctx.db.get(gardenPlant.gardenId);
    if (!garden || garden.userId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
    await ctx.db.patch(gardenPlant.gardenId, { updatedAt: Date.now() });
  },
});

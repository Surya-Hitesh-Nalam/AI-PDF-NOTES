import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const AddNotes = mutation({
  args: {
    fileId: v.string(),
    notes: v.string(),   // Change if your notes are objects/arrays
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query('notes')
      .filter((q) => q.eq(q.field('fileId'), args.fileId))
      .collect();

    if (record.length === 0) {
      // Insert new note if no record found
      await ctx.db.insert('notes', {
        fileId: args.fileId,
        notes: args.notes,
        createdBy: args.createdBy,
      });
    } else {
      // Update existing note
      await ctx.db.patch(record[0]._id, { notes: args.notes });
    }
  },
});

export const GetNotes = query({
  args: {
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query('notes')
      .filter((q) => q.eq(q.field('fileId'), args.fileId))
      .first();

    return notes?.notes || '';
  }
});
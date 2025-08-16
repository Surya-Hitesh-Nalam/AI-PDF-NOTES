import { mutation,query } from "./_generated/server";
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
    fileId: v.string() // ✅ Correct - expecting fileId, not field
  },
  handler: async (ctx, args) => {
    console.log('GetNotes called with fileId:', args.fileId);
    
    const notes = await ctx.db
      .query('notes') // Make sure this matches your table name
      .filter((q) => q.eq(q.field('fileId'), args.fileId))
      .first(); // Get the first/latest note for this file
    
    console.log('Notes found:', notes);
    
    // Return the notes content or empty string if no notes exist
    return notes?.notes || '';
  }
});
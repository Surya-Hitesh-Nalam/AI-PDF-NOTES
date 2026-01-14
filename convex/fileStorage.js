import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const AddFileEntryToDb = mutation({
  args: {
    fileId: v.string(),
    storageId: v.string(),
    fileUrl: v.string(),
    fileName: v.string(),
    createdBy: v.string()
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('pdfFiles', {
      fileId: args.fileId,
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      storageId: args.storageId,
      createdBy: args.createdBy
    })
    return "Inserted file"
  }
})


export const getFileUrl = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId)
    return url
  }
})

export const GetFileRecord = query({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('pdfFiles')
      .filter((q) => q.eq(q.field('fileId'), args.fileId))
      .collect();

    if (res.length === 0) {
      return null;
    }

    return res[0];
  }
});

export const GetUserFiles = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args?.userEmail) {
      return []; // if no email provided, return empty array
    }

    const result = await ctx.db
      .query('pdfFiles')
      .filter((q) => q.eq(q.field('createdBy'), args.userEmail))
      .collect();

    return result;
  },
});

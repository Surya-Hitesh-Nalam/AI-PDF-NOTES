import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
  args: {
    splitText: v.any(),
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    try {
      await ConvexVectorStore.fromTexts(
        args.splitText,
        { fileId: args.fileId },
        new GoogleGenerativeAIEmbeddings({
          apiKey: 'AIzaSyBgPLLfPv-b1DclZBKQh7Qr_VkpnCGZouA',
          model: "text-embedding-004",
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        }),
        { ctx }
      );

      return 'Completed....';
    } catch (error) {
      console.error("Error ingesting document:", error);
      throw new Error(`Failed to ingest document: ${error.message}`);
    }
  },
});

export const search = action({
  args: {
    query: v.string(),
    fileId: v.string()
  },
  handler: async (ctx, args) => {
    try {

      const vectorStore = new ConvexVectorStore(
        new GoogleGenerativeAIEmbeddings({
          apiKey: 'AIzaSyBgPLLfPv-b1DclZBKQh7Qr_VkpnCGZouA',
          model: "text-embedding-004",
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        }),
        { ctx }
      );

      const resultOne = (await vectorStore.similaritySearch(args.query, 1))
        .filter(q => q.metadata.fileId === args.fileId);

      return JSON.stringify(resultOne);
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});
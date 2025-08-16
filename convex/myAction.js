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
  handler: async (ctx, args) => {  // ← THIS IS THE CRITICAL FIX: Added 'args' parameter
    try {
      console.log("Starting document ingestion for fileId:", args.fileId);
      console.log("Number of text chunks:", args.splitText?.length);
      
      await ConvexVectorStore.fromTexts(
        args.splitText, // array of text chunks
        { fileId: args.fileId }, // metadata object - FIXED FORMAT
        new GoogleGenerativeAIEmbeddings({
          apiKey: 'AIzaSyBgPLLfPv-b1DclZBKQh7Qr_VkpnCGZouA',
          model: "text-embedding-004",
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        }),      
        { ctx }
      );
      
      console.log(`Document ingested successfully for fileId: ${args.fileId}`);
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
      console.log(`Searching for: "${args.query}" in fileId: ${args.fileId}`);
      
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
      
      console.log("Search results:", resultOne);
      return JSON.stringify(resultOne);
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});
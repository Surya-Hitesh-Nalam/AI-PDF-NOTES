import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function GET(req) {
  try {
    const reqUrl = req.url;
    const { searchParams } = new URL(reqUrl);
    const pdfUrl = searchParams.get('pdfUrl');

    if (!pdfUrl) {
      return NextResponse.json({ error: "PDF URL required" }, { status: 400 });
    }

    // Load the pdf file
    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();

    let pdfTextContent = '';
    docs.forEach(doc => {
      pdfTextContent = pdfTextContent + doc.pageContent;
    });

    // Split the text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const output = await splitter.createDocuments([pdfTextContent]);
    const splitterList = output.map(doc => doc.pageContent);

    return NextResponse.json({ result: splitterList });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
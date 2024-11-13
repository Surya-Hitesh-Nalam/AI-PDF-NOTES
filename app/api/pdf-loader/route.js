import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"

//const pdfUrl="https://agile-vulture-237.convex.cloud/api/storage/62037008-7746-48c9-bb56-88010d774146"
export async function GET(req){
    const reqUrl = req.url;
    const {serachParams}=new URL(reqUrl);
    const pdfUrl=serachParams.get('pdfUrl')
    console.log(pdfUrl)
    //load the pdf file
    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader=new WebPDFLoader(data);
    const docs=await loader.load()

    let pdfTextContent='';
    docs.forEach(doc=>{
        pdfTextContent=pdfTextContent+doc.pageContent
    })

    //2.split the text into small chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:100,
        chunkOverlap:20
    })
    const output = await splitter.createDocuments([pdfTextContent]);

    const splitterList = [];
    output.forEach((doc)=>{
        splitterList.push(doc.pageContent)
    })


    return NextResponse.json({result:splitterList})

}
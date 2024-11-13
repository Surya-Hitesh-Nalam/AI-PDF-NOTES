'use client'
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { AddFileEntryToDb } from "@/convex/fileStorage";
import axios from "axios";
import { toast } from "sonner";

function UploadPdfDialog({ children ,isMaxFile}){

    const generateUploadUrl=useMutation(api.fileStorage.generateUploadUrl)
    const AddFileEntry = useMutation(api.fileStorage.AddFileEntryToDb)
    const getFileUrl = useMutation(api.fileStorage.getFileUrl)
    const {user} = useUser()
    const embeddedDocument=useAction(api.myAction.ingest)
    const [file,setFile] = useState()
    const [loading,setLoading]=useState(false)
    const [open,setOpen] = useState(false)
    const [fileName,setFileName] = useState()
    const OnFileSelect = (e)=>{
        setFile(e.target.files[0])
    }
    const OnUpload=async()=>{
        setLoading(true)
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

         // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type },
        body: file,
      });
      const { storageId } = await result.json();
      console.log(storageId)
      const fileId = uuid4()
      const fileUrl = await getFileUrl({storageId:storageId})

      const resp = await AddFileEntry({
        fileId:fileId,
        storageId:storageId,
        fileName:fileName??'untitled File',
        fileUrl:fileUrl,
        createdBy:user?.primaryEmailAddress?.emailAddress
      })
      console.log(resp)

      //api call to fetch PDF process data
      const ApiResp=await axios.get('/api/pdf-loader?pdfUrl='+fileUrl);
      console.log(ApiResp.data.result)
      await embeddedDocument({
        splitText:ApiResp.data.result,
        fileId:fileId
      })
      
      setLoading(false)
      setOpen(false)

      toast('file is ready !')
    }
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={()=>setOpen(true)} disabled={isMaxFile} className="w-full">+ Upload PDF File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload PDF File</DialogTitle>
          <DialogDescription asChild>
            <div className="">
              <h2 className="mt-5">select an file to upload</h2>
              <div className="flex gap-2 p-3 rounded-md border">
                <input type="file" accept="application/pdf" onChange={(e)=>OnFileSelect(e)}/>
              </div>
              <div className="mt-2">
                <label>File Name *</label>
                <Input placeholder="file name" onChange={(e)=>setFileName(e.target.value)}/>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button onClick={OnUpload} disabled={loading}>
            {
                loading?<Loader2Icon className='animate-spin w-4 h-4'/>:'Upload'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UploadPdfDialog;

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

function UploadPdfDialog({ children, isMaxFile }) {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const AddFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const { user } = useUser();
  const embeddedDocument = useAction(api.myAction.ingest);
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState();

  const OnFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const OnUpload = async () => {
    setLoading(true);

    try {
      console.log("Starting upload process...");

      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file?.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();
      console.log("File uploaded, storageId:", storageId);

      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId: storageId });

      console.log("File URL obtained:", fileUrl);

      // Step 3: Save file entry to database
      const resp = await AddFileEntry({
        fileId: fileId,
        storageId: storageId,
        fileName: fileName ?? "untitled File",
        fileUrl: fileUrl,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      console.log("File entry saved:", resp);

      // Step 4: Process PDF
      console.log("Processing PDF...");
      const ApiResp = await axios.get(
        `/api/pdf-loader?pdfUrl=${encodeURIComponent(fileUrl)}`
      );

      if (!ApiResp.data?.result || !Array.isArray(ApiResp.data.result)) {
        throw new Error("Invalid PDF processing response");
      }

      console.log("PDF processed, chunks:", ApiResp.data.result.length);

      // Step 5: Embed document
      console.log("Embedding document...");
      await embeddedDocument({
        splitText: ApiResp.data.result,
        fileId: fileId,
      });

      console.log("Document embedding completed!");
      toast.success("File uploaded and processed successfully!");
      setOpen(false);
      
      // Reset form state after successful upload
      setFile(null);
      setFileName("");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          disabled={isMaxFile}
          className="w-full"
        >
          + Upload PDF File
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload PDF File</DialogTitle>
          <DialogDescription asChild>
            <div className="">
              <h2 className="mt-5">select an file to upload</h2>
              <div className="flex gap-2 p-3 rounded-md border">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => OnFileSelect(e)}
                />
              </div>
              <div className="mt-2">
                <label>File Name *</label>
                <Input
                  placeholder="file name"
                  value={fileName || ""}
                  onChange={(e) => setFileName(e.target.value)}
                />
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
          <Button onClick={OnUpload} disabled={loading || !file}>
            {loading ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UploadPdfDialog;
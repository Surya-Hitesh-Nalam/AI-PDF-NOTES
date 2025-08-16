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
import { Loader2Icon, UploadCloud, FileText, X } from "lucide-react";
import { useState, useRef } from "react";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { AddFileEntryToDb } from "@/convex/fileStorage";
import axios from "axios";
import { toast } from "sonner";

export function UploadPdfDialog({ children, isMaxFile }) {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const AddFileEntry = useMutation(api.fileStorage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const { user } = useUser();
  const embeddedDocument = useAction(api.myAction.ingest);
  const [file, setFile] = useState();
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a valid PDF file');
      }
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };
  
  const OnUpload = async () => {
    setLoading(true);
    const toastId = toast.loading("Uploading and processing your file...");

    try {
      console.log("Starting upload process...");

      // Step 1: Get a short-lived upload URL
      const postUrl = await generateUploadUrl();

      // Step 2: POST the file to the URL
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // Step 3: Save the newly allocated storage id to the database
      const fileId = uuid4();
      const fileUrl = await getFileUrl({ storageId });
      
      await AddFileEntry({
        _id: fileId,
        name: file.name,
        url: fileUrl,
        storageId: storageId,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      });

      // Step 4: Process PDF
      const ApiResp = await axios.get(
        `/api/pdf-loader?pdfUrl=${encodeURIComponent(fileUrl)}`
      );

      if (!ApiResp.data?.result || !Array.isArray(ApiResp.data.result)) {
        throw new Error("Invalid PDF processing response");
      }

      // Step 5: Embed document
      await embeddedDocument({
        splitText: ApiResp.data.result,
        fileId: fileId,
      });

      toast.success("File uploaded and processed successfully!", { id: toastId });
      setOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file. Please try again.", { id: toastId });
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
      <DialogContent className="sm:max-w-[500px] rounded-xl border-0 shadow-xl">
        <DialogHeader className="px-2">
          <DialogTitle className="text-2xl font-bold text-gray-900">Upload PDF</DialogTitle>
          <DialogDescription className="text-gray-500">
            Upload a PDF to extract text and create AI-powered notes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={OnUpload} className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-gray-200 hover:border-blue-300 bg-gray-50/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <UploadCloud className="h-6 w-6 text-blue-600" />
              </div>
              {file ? (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Drag and drop your PDF here
                    </p>
                    <p className="text-xs text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PDF (max. 10MB)
                  </p>
                </>
              )}
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                  {file.name}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
                suppressHydrationWarning
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || loading}
              className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${
                (!file || loading) ? 'opacity-70' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Uploading...
                </>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client'
import { useParams } from 'next/navigation'
import React from 'react'
import WorkspaceHeader from '../_components/WorkspaceHeader';
import { UserButton } from '@clerk/nextjs';
import PdfViewer from '../_components/PdfViewer';
import { useMutation, useQueries, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';
import TextEditor from '../_components/TextEditor';

const workspace = () => {
    const { fileId } = useParams();
  
    // Use conditional to run the query only if fileId is present
    const fileInfo = fileId ? useQuery(api.fileStorage.GetFileRecord, { fileId }) : null;
  
    useEffect(() => {
      if (fileInfo) {
        console.log(fileInfo);
      }
    }, [fileInfo]);
  
    return (
      <div>
        <WorkspaceHeader fileName={fileInfo.fileName}/>
        <div className="grid grid-cols-2 gap-5">
          <div>
            {/* Text editor */}
            <TextEditor fileId={fileId}/>
          </div>
          <div>
            {/* PDF Viewer */}
            <PdfViewer fileUrl={fileInfo?.fileUrl} />
          </div>
        </div>
      </div>
    );
  };
  
export default workspace

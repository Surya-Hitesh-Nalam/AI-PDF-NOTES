'use client'
import { useParams } from 'next/navigation'
import React from 'react'
import WorkspaceHeader from '../_components/WorkspaceHeader';
import PdfViewer from '../_components/PdfViewer';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect } from 'react';
import TextEditor from '../_components/TextEditor';

const workspace = () => {
  const { fileid } = useParams();
  const fileInfo = fileid ? useQuery(api.fileStorage.GetFileRecord, { fileId: fileid }) : null;

  useEffect(() => {
    if (fileInfo) {
      // File loaded
    }
  }, [fileInfo]);

  // Show loading state
  if (fileid && !fileInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show error if no fileId in URL
  if (!fileid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">No file ID provided in URL</p>
        </div>
      </div>
    );
  }

  // Show error if file not found
  if (fileInfo === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">File not found</p>
          <p className="text-gray-600 mt-2">File ID: {fileid}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WorkspaceHeader fileName={fileInfo.fileName || 'Unnamed File'} />
      <div className="grid grid-cols-2 gap-5">
        <div>
          {/* Text editor */}
          <TextEditor fileId={fileid} />
        </div>
        <div>
          {/* PDF Viewer */}
          <PdfViewer fileUrl={fileInfo.fileUrl} />
        </div>
      </div>
    </div>
  );
};

export default workspace;
'use client'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Search, Clock, FileUp } from "lucide-react";
import Link from "next/link";
import { UploadPdfDialog } from "./_components/UploadPdfDialog";
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react';
import Image from 'next/image';
import React from 'react'

function Dashboard() {
  const { user } = useUser();

  const fileList = useQuery(api.fileStorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  })

  const notes = fileList?.map(file => ({
    _id: file.fileId,
    title: file.fileName,
    content: '',
    _creationTime: file.createdAt
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Documents
              </h1>
              <p className="text-gray-500">Access and manage all your PDF documents in one place</p>
            </div>

            {/* Search and Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search documents..."
                  className="pl-10 w-full bg-white/80 backdrop-blur-sm border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  suppressHydrationWarning
                />
              </div>
              <UploadPdfDialog>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20" suppressHydrationWarning>
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </UploadPdfDialog>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <h2 className="font-medium">Recent Documents</h2>
            </div>

            {(!notes || notes.length === 0) ? (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                  <FileUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No documents yet</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Get started by uploading your first PDF document to extract and manage your notes.
                </p>
                <UploadPdfDialog>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300" suppressHydrationWarning>
                    Upload your first document
                  </Button>
                </UploadPdfDialog>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <Link key={note._id} href={`/workspace/${note._id}`} className="group">
                    <Card className="h-full bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 hover:border-blue-100">
                      <div className="p-5">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(note._creationTime).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                          {note.content || "No content available"}
                        </p>
                      </div>
                      <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            PDF
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.ceil((note.content?.length || 0) / 1000)} min read
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard

'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Home, Menu, Plus, Settings, LogOut, File, FileQuestion, HelpCircle, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UploadPdfDialog } from "./UploadPdfDialog";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Layout, Shield } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function SideBar({ isMaxFile }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();
  const {user} = useUser();
  const fileList=useQuery(api.fileStorage.GetUserFiles,{
    userEmail:user?.primaryEmailAddress?.emailAddress
  })

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "My Documents",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      name: "Templates",
      href: "/dashboard/templates",
      icon: File,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: Star,
    },
  ];

  const secondaryNavItems = [
    {
      name: "Help & Support",
      href: "/help",
      icon: HelpCircle,
    },
    {
      name: "FAQ",
      href: "/faq",
      icon: FileQuestion,
    },
  ];

  const handleSignOut = () => {
    signOut(() => router.push("/"));
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-20 px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI PDF Notes
            </span>
          </Link>
        </div>
        
        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main
            </h3>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-colors",
                      pathname === item.href ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
                    )}
                  />
                  {item.name}
                  {item.name === "Favorites" && (
                    <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      3
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Support
            </h3>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  {item.name}
                </a>
              ))}
              
              {/* Sign Out Button */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                suppressHydrationWarning
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </nav>
          </div>
        </div>

        {/* Upload Button */}
        <div className="p-4 border-t border-gray-100">
          <UploadPdfDialog isMaxFile={fileList?.length>=5?true:false}>
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
              suppressHydrationWarning
            >
              <Plus className="mr-2 h-5 w-5" />
              New Document
            </Button>
          </UploadPdfDialog>
          
          {/* Storage Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Storage</span>
              <span>{fileList?.length} out of 5 pdf uploaded</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(fileList?.length/5)*100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar

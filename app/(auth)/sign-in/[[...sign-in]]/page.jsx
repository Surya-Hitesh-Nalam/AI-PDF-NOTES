'use client'
import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the redirect URL from query params
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If user is already signed in, redirect them immediately
      const decodedUrl = decodeURIComponent(redirectUrl);
      router.push(decodedUrl);
    }
  }, [isLoaded, isSignedIn, router, redirectUrl]);

  // Show loading while Clerk determines auth state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // If already signed in, show redirect message
  if (isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Already signed in. Redirecting...</div>
      </div>
    );
  }

  // Show sign-in form only if not signed in
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn 
        fallbackRedirectUrl="/dashboard"
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
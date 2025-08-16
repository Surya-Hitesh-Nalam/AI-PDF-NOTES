'use client'
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.User.createUser);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkUser();
      // Optionally redirect to dashboard
      // router.push('/dashboard');
    }
  }, [user, isLoaded, isSignedIn]);
  
  const checkUser = async() => {
    if (!user) return;
    
    try {
      const result = await createUser({
        email: user?.primaryEmailAddress?.emailAddress,
        imageUrl: user?.imageUrl,
        userName: user?.fullName,
        name: user?.fullName
      });
      console.log(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>
        Hello {user?.firstName}!
        <Button onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
        <UserButton afterSignOutUrl="/" />
      </h1>
    </div>
  );
}
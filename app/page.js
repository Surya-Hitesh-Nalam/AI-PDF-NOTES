'use client'
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const {user} = useUser();
  const createUser = useMutation(api.User.createUser)

  useEffect(()=>{
    user&&checkUser()
  },[user])
  
  const checkUser=async()=>{
    const result = await createUser({
      email:user?.primaryEmailAddress?.emailAddress,
      imageUrl:user?.imageUrl,
      userName:user?.fullName,
      name:user?.fullName
    })

    console.log(result)
  }
  return (
    <div>
      <h1>
        hello
        <Button>hi hello</Button>
        <UserButton/>
      </h1>
    </div>
  );
}

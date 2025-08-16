'use client'
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, MessageSquare, Sparkles } from "lucide-react";

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const createUser = useMutation(api.User.createUser);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkUser();
    }
  }, [user, isLoaded, isSignedIn]);

  const checkUser = async () => {
    if (!user) return;
    try {
      const result = await createUser({
        email: user?.primaryEmailAddress?.emailAddress,
        imageUrl: user?.imageUrl,
        userName: user?.fullName,
        name: user?.fullName,
      });
      console.log(result);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-gray-900 text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center px-6 text-white relative overflow-hidden">
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-3xl z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-yellow-300 drop-shadow-lg">
          {isSignedIn ? `Welcome back, ${user?.firstName}!` : "AI PDF Notes"}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-200">
          Chat with your PDFs, generate customized notes, and summarize documents instantly.  
          Supercharge your productivity with the power of AI.
        </p>

        <div className="mt-10 flex gap-4 justify-center">
          {isSignedIn ? (
            <>
              <Button
                size="lg"
                className="rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform border-white text-white"
                onClick={() => router.push("/sign-out")}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="rounded-2xl px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </Button>
          )}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20 max-w-6xl z-10"
      >
        {[
          {
            icon: <Upload className="w-12 h-12 text-blue-400" />,
            title: "Upload PDFs",
            desc: "Upload textbooks, research papers, or notes instantly.",
          },
          {
            icon: <MessageSquare className="w-12 h-12 text-green-400" />,
            title: "Chat with PDFs",
            desc: "Ask questions and get context-aware AI answers.",
          },
          {
            icon: <FileText className="w-12 h-12 text-yellow-400" />,
            title: "Generate AI Notes",
            desc: "Create structured summaries in seconds.",
          },
          {
            icon: <Sparkles className="w-12 h-12 text-pink-400" />,
            title: "Personalized Summaries",
            desc: "Customize notes by topic, difficulty, or length.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:scale-105 transition transform"
          >
            {item.icon}
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-gray-200">{item.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Decorative gradient blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
}

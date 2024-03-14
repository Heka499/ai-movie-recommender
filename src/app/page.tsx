import Image from "next/image";
import logo from "@/assets/logo.jpg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");


  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="logo" width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          AI movie recommendation system
        </span>
      </div>
      <p className="max-w-prose text-center">
        Welcome to the AI movie recommendation system. This is a simple
        application that uses AI to recommend movies to users based on their
        preferences. Built with OpenAI, Pinecone, Next.js, Shadcn UI and Clerk.
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}

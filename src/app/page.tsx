import Image from "next/image";
import logo from "@/assets/logo.jpg";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import MovieCard from "@/components/MovieCard";

const movies = [
  {
    title: "The Shawshank Redemption",
    overview: "Framed in the 1940s for the",
    posterPath: logo,
    id: 278,
    release_date: "1994-09-23",
    vote_average: 8.7,
    vote_count: 21035,
    popularity: 48.7,
    genre_ids: [18, 80],
  },
  {
    title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a",
    posterPath: logo,
    id: 238,
    release_date: "1972-03-14",
    vote_average: 8.7,
    vote_count: 15898,
    popularity: 48.7,
    genre_ids: [18, 80],
  },
  {
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war",
    posterPath: logo,
    id: 155,
    release_date: "2008-07-16",
    vote_average: 8.5,
    vote_count: 23947,
    popularity: 48.7,
    genre_ids: [18, 80],
  },
];

export default function Home() {
  const { userId } = auth();

  //if (userId) redirect("/notes");

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
      <p className="text-center">Todays recommendations: </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}

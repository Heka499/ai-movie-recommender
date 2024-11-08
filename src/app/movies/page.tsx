import MovieCard from "@/components/MovieCard";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";
import { Metadata } from "next";
import MovieSearch from "@/components/MovieSearch";

export const metadata: Metadata = {
  title: "Movies",
  description: "Movies",
};

export default async function MoviesPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId undefined");

  const allMovies = await prisma.movie.findMany();

  return (
    <>
      <MovieSearch />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allMovies.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
        {allMovies.length === 0 && (
          <div className="col-span-full text-center">{"No movies found."}</div>
        )}
      </div>
    </>
  );
}

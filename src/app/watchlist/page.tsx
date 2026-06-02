import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import MovieCard from "@/components/MovieCard";

const getUserWatchlist = async () => {
  const { userId } = auth();

  if (!userId) {
    return [];
  }

  // Get the user's watchlist by userId
  const watchlist = await prisma.watchlist.findUnique({
    where: { userId: userId },
  });

  // If no watchlist is found, return an empty array
  if (!watchlist || watchlist.movieIds.length === 0) return [];

  // Fetch movie details for each movieId in the watchlist
  const movies = await prisma.movie.findMany({
    where: {
      movieId: { in: watchlist.movieIds },
    },
  });

  return movies;
};

export default async function WatchlistPage() {
  const movies = await getUserWatchlist();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <MovieCard movie={movie} key={movie.id} />
      ))}
      {movies.length === 0 && (
        <div className="col-span-full text-center">
          {"Your watchlist is empty. Add some movies to get started!"}
        </div>
      )}
    </div>
  );
}

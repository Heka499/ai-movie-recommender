import Note from "@/components/Note";
import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";

const getUserWatchlist = async () => {
  const { userId } = auth();

  // Get the user's watchlist by userId
  const watchlist = await prisma.watchlist.findUnique({
    where: { userId: userId },
  });

  // If no watchlist is found, return an empty array
  if (!watchlist || watchlist.movies.length === 0) return [];

  // Fetch movie details for each movieId in the watchlist
  const movies = await prisma.movie.findMany({
    where: {
      id: { in: watchlist.movies },
    },
  });

  return movies;
};

export default async function WatchlistPage() {
  const movies = await getUserWatchlist();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {movies.map((movie) => (
        <Note note={movie} key={movie.id} />
      ))}
      {movies.length === 0 && (
        <div className="col-span-full text-center">
          {"Your watchlist is empty. Add some movies to get started!"}
        </div>
      )}
    </div>
  );
}

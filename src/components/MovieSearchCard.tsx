import Image from "next/image";
import { Movie as MovieModel } from "@prisma/client";
import { Button } from "./ui/button";

interface MovieCardProps {}

async function addMovieToWatchlist(movie: any) {
  console.log(movie);

  const response = await fetch("/api/tmdb/movie", {
    method: "POST",
    body: JSON.stringify({
      title: movie.title,
      id: movie.id,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }),
  });

  if (!response.ok) {
    throw new Error("Status code: " + response.status);
  }
}

export default function MovieCard({ movie }: any) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt="movie"
        className="rounded-lg"
        width={300}
        height={300}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-bold">{movie.title}</span>
        <Button onClick={() => addMovieToWatchlist(movie)}>
          Add to Watchlist
        </Button>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Movie as MovieModel } from "@prisma/client";
import { Button } from "./ui/button";

interface MovieCardProps {
  movie: MovieModel;
}

async function addMovieToWatchlist(movie: MovieModel) {
  console.log(movie);

  const response = await fetch("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({
      title: movie.title,
      id: movie.id,
      movieId: movie.movieId,
      overview: movie.overview,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
    }),
  });

  if (!response.ok) {
    throw new Error("Status code: " + response.status);
  }
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
        alt="movie"
        className="rounded-lg"
        width={500}
        height={500}
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

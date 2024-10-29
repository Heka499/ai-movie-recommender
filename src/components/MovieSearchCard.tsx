import Image from "next/image";
import { Movie as MovieModel } from "@prisma/client";

interface MovieCardProps {}

export default function MovieCard({ movie }: any) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt="movie"
        className="rounded-lg"
        width={500}
        height={500}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-bold">{movie.title}</span>
      </div>
    </div>
  );
}

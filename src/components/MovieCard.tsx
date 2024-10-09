import Image from "next/image";

export default function MovieCard({ movie }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src={movie.poster_path}
        alt="movie"
        className="rounded-lg"
        width={500}
        height={500}
      />
      <div className="flex flex-col items-center gap-2">
        <span className="text-xl font-bold">{movie.title}</span>
        <span className="text-center text-sm">{movie.overview}</span>
      </div>
    </div>
  );
}

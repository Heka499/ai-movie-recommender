import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";

import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const movieData = await req.json();
    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movie = await prisma.movie.upsert({
      where: { movieId: movieData.id },
      update: {},
      create: {
        movieId: movieData.id,
        title: movieData.title,
        releaseDate: new Date(movieData.releaseDate),
        posterPath: movieData.poster,
      },
    });

    await prisma.watchlist.update({
      where: { userId: userId },
      data: {
        movies: { push: movie.id },
      },
      upsert: {
        create: {
          userId: userId,
          movies: [movie.id],
        },
        update: {
          movies: { push: movie.id },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

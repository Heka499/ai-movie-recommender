import prisma from "@/lib/db/prisma";

import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(body.movieId);

    const { movieId } = body;

    const existingMovie = await prisma.movie.findUnique({
      where: { movieId: movieId },
    });

    if (!existingMovie) {
      return Response.json({ error: "Movie does not exist" }, { status: 404 });
    }

    const watchlist = await prisma.watchlist.findUnique({
      where: { userId: userId },
    });

    if (!watchlist) {
      const watchlist = await prisma.watchlist.create({
        data: {
          userId: userId,
          movieIds: [],
          movieTitles: [],
        },
      });

      await prisma.watchlist.update({
        where: { userId: userId },
        data: {
          movieIds: [...watchlist.movieIds, existingMovie.movieId],
          movieTitles: [...watchlist.movieTitles, existingMovie.title],
        },
      });

      return Response.json({ watchlist }, { status: 201 });
    }

    if (watchlist.movieIds.includes(existingMovie.movieId)) {
      return Response.json(
        { error: "Movie already in watchlist" },
        { status: 409 },
      );
    }

    await prisma.watchlist.update({
      where: { userId: userId },
      data: {
        movieIds: [...watchlist.movieIds, existingMovie.movieId],
        movieTitles: [...watchlist.movieTitles, existingMovie.title],
      },
    });

    return Response.json({ watchlist }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

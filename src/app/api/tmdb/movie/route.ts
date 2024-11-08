import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { title, id, overview, releaseDate, posterPath } = body;

    const existingMovie = await prisma.movie.findUnique({
      where: { movieId: id },
    });

    if (existingMovie) {
      return Response.json({ error: "Movie already exists" }, { status: 409 });
    }

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movie = await prisma.movie.create({
      data: {
        title,
        movieId: id,
        releaseDate: new Date(releaseDate),
        posterPath,
        overview,
      },
    });

    return Response.json({ movie }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

import prisma from "@/lib/db/prisma";

import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const movieData = await req.json();
    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movie = await prisma.$transaction(async (tx) => {
      const movie = await tx.movie.create({
        data: {
          ...movieData,
          userId,
        },
      });

      return movie;
    });

    return Response.json({ movie }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

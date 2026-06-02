import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("body:", body);

    const { title } = body;

    const url = `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + process.env.TMDB_AUTH_TOKEN,
      },
    };

    const result = await fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });

    const movieTitleToAdd = result.results[0].title;

    console.log("movieTitleToAdd:", movieTitleToAdd);

    const existingMovie = await prisma.movie.findFirst({
      where: { title: movieTitleToAdd },
    });

    console.log("existingMovie:", existingMovie);

    if (!existingMovie) {
      const { id, title, overview, release_date, poster_path } =
        result.results[0];

      const movie = await prisma.movie.create({
        data: {
          title,
          movieId: id,
          releaseDate: new Date(release_date),
          posterPath: poster_path,
          overview,
        },
      });

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
            movieIds: [...watchlist.movieIds, movie.movieId],
            movieTitles: [...watchlist.movieTitles, movie.title],
          },
        });

        return Response.json({ watchlist }, { status: 201 });
      } else {
        if (watchlist.movieIds.includes(movie.movieId)) {
          return Response.json(
            { error: "Movie already in watchlist" },
            { status: 409 },
          );
        }

        await prisma.watchlist.update({
          where: { userId: userId },
          data: {
            movieIds: [...watchlist.movieIds, movie.movieId],
            movieTitles: [...watchlist.movieTitles, movie.title],
          },
        });

        return Response.json({ watchlist }, { status: 201 });
      }
    } else {
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
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

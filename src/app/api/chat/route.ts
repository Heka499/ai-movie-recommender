import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import {
  ChatCompletionMessage,
  ChatCompletionSystemMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: { userId },
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const watchlist = await prisma.watchlist.findUnique({
      where: { userId: userId },
    });

    if (!watchlist) {
      return Response.json({ error: "Watchlist not found" }, { status: 404 });
    }

    const systemMessage: ChatCompletionSystemMessageParam = {
      role: "system",
      content:
        "You are a movie expert. You can answer user's questions about movies and give recommendations. " +
        "Here is the users watchlist: " +
        watchlist.movieTitles.join(", ") +
        ". " +
        "Here are some notes that might help you answer the user's question: " +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
          .join("\n\n") +
        ". You can ask the user if they want to add a movie to their watchlist using the `addMovieToWatchlist` function with the movie title.",
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],

      functions: [
        {
          name: "addMovieToWatchlist",
          description: "Add a movie to the user's watchlist",
          parameters: {
            type: "object",
            properties: {
              movieTitle: {
                type: "string",
                description: "The title of the movie to add to the watchlist",
              },
            },
            required: ["movieTitle"],
          },
        },
      ],
      function_call: "auto",
    });

    const [response1, response2] = response.tee();

    console.log("Response:", response1);

    let movieAdded = false;
    console.log("movieAdded:", movieAdded);
    let accumulatedArguments = "";

    for await (const part of response1) {
      console.log("Part:", part);
      if (part.choices && part.choices[0].delta) {
        const delta = part.choices[0].delta;

        if (delta.function_call && delta.function_call.arguments) {
          accumulatedArguments += delta.function_call.arguments;
        }

        if (
          part.choices &&
          part.choices[0].finish_reason === "function_call" &&
          !movieAdded
        ) {
          {
            try {
              const { movieTitle } = JSON.parse(accumulatedArguments);
              addMovieToWatchlist(movieTitle);
              console.log("Movie added to watchlist:", movieTitle);
              movieAdded = true;
              console.log("movieAdded:", movieAdded);
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
    }

    const stream = OpenAIStream(response2);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }

  async function addMovieToWatchlist(movieTitle: string) {
    try {
      const { userId } = auth();

      if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const title = movieTitle;

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
}

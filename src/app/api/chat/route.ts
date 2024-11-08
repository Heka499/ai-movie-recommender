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
    console.log("Messages:", messagesTruncated);

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

    console.log("Relevant notes:", relevantNotes);
    console.log("Watchlist:", watchlist.movieTitles);

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
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

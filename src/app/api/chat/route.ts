import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { ChatCompletionMessage, ChatCompletionSystemMessageParam } from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai"

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages: ChatCompletionMessage[] = body.message;

        const messagesTruncated = messages.slice(-6);
        console.log('Messages:', messagesTruncated);

        const embedding = await getEmbedding(
            messagesTruncated.map((message) => message.content).join("\n")
        );

        const {userId} = auth();

        const vectorQueryResponse = await notesIndex.query({
            vector: embedding,
            topK: 1,
            filter: {userId}
        });

        const relevantNotes = await prisma.note.findMany({
            where: {
                id: {
                    in: vectorQueryResponse.matches.map((match) => match.id)
                }
            }
        });

        console.log('Relevant notes:', relevantNotes);

        const systemMessage: ChatCompletionSystemMessageParam = {
            role: "system",
            content:
                "You are a movie expert. You can answer user's questions about movies and give recommendations. " + 
                "Here are some notes that might help you answer the user's question: " +
                relevantNotes
                    .map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`)
                    .join("\n\n"),
        };

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [systemMessage, ...messagesTruncated],
        });

        const stream = OpenAIStream(response)
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
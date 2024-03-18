import { Pinecone } from '@pinecone-database/pinecone'

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
    throw new Error('No Pinecone API key found');
}

const pinecone = new Pinecone({
    apiKey,
 });

 export const notesIndex = pinecone.Index('ai-movie-recommendation-system');
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    throw new Error('No OpenAI API key found');
}

const openai = new OpenAI({ apiKey });

export default openai;

export async function getEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
    })

    const embeddings = response.data[0].embedding;

    if (!embeddings) {
        throw new Error('Error getting embeddings from OpenAI API');
    }

    console.log('Embeddings:', embeddings);

    return embeddings;

}

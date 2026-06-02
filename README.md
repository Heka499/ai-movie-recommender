# AI Movie Recommendation System

An archived thesis project that explores how an AI assistant can combine a user's movie watchlist, personal notes, semantic search, and external movie data to provide more contextual movie recommendations.

The project is no longer actively maintained, but the repository is kept as a portfolio piece to demonstrate a full-stack AI application built with Next.js, OpenAI, Pinecone, MongoDB, Prisma, Clerk, and TMDB.

## Project Status

**Status:** Archived / portfolio showcase  
**Original purpose:** Thesis project  
**Maintenance:** No future feature work planned

Because this project is archived, some third-party SDKs, APIs, or model names may require updates before a fresh deployment.

## What It Does

- Authenticated user accounts with Clerk
- Movie discovery through The Movie Database (TMDB) API
- Personal movie watchlists stored in MongoDB
- User notes with create, edit, and delete flows
- OpenAI embeddings generated from notes
- Pinecone vector search for retrieving relevant user notes
- Streaming AI chat assistant for movie questions and recommendations
- AI responses grounded with the user's watchlist and semantically relevant notes
- Dark/light theme support with Tailwind CSS and shadcn/ui-style components

## How The AI Flow Works

1. A user writes notes about preferences, movies, genres, actors, or anything else useful.
2. The app creates OpenAI embeddings for those notes.
3. Embeddings are stored in a Pinecone index with the Clerk user ID as metadata.
4. When the user chats with the assistant, the latest messages are embedded.
5. Pinecone retrieves the user's most relevant notes.
6. The chat route sends OpenAI a system prompt containing:
   - the user's watchlist
   - the retrieved notes
   - the recent conversation
7. The assistant streams back a recommendation-focused response.

## Tech Stack

- **Framework:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI primitives, shadcn/ui-style components
- **Authentication:** Clerk
- **Database:** MongoDB with Prisma
- **AI:** OpenAI Chat Completions and embeddings
- **Vector Search:** Pinecone
- **Movie Data:** TMDB API

## Main Features

### Movie Recommendations

The home page displays stored movie recommendations from the database and provides entry points into the authenticated app.

### Movies

Authenticated users can browse saved movie data and search TMDB for movies. Movie posters are loaded from TMDB's image CDN.

### Watchlist

Users can add movies to a personal watchlist. Watchlist data stores both TMDB movie IDs and movie titles so the AI assistant can use the list as recommendation context.

### Notes

Users can create, edit, and delete notes. Notes are persisted in MongoDB and mirrored into Pinecone as embeddings for semantic retrieval.

### AI Chat

The floating chat assistant answers movie-related questions and recommends movies using the user's notes and watchlist as context.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file with the required service credentials:

```bash
DATABASE_URL=
OPENAI_API_KEY=
PINECONE_API_KEY=
TMDB_AUTH_TOKEN=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

You may also need the usual Clerk routing variables depending on your Clerk app configuration.

Generate the Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## External Service Notes

- MongoDB is configured through Prisma in `prisma/schema.prisma`.
- Pinecone uses the hard-coded index name `ai-movie-recommendation-system`.
- The current embedding model in the code is `text-embedding-ada-002`.
- The current chat model in the code is `gpt-4o-mini`.
- TMDB requests require a bearer token in `TMDB_AUTH_TOKEN`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
src/app               Next.js App Router pages, layouts, middleware, and API routes
src/components        Reusable UI components for notes, movies, chat, and controls
src/lib               Shared utilities, OpenAI client, Prisma client, and Pinecone client
src/lib/validation    Zod schemas for note API validation
prisma/schema.prisma  MongoDB data models for notes, movies, and watchlists
public                Static public assets
```

## Data Models

- **Note:** user-owned note content used for semantic retrieval
- **Movie:** stored TMDB movie metadata
- **Watchlist:** user-owned collection of movie IDs and titles

## Known Limitations

- This is a completed thesis prototype, not an actively maintained production app.
- Some dependencies are pinned to the versions used during development.
- The Pinecone index name is hard-coded in the source.
- There is no automated test suite in the repository.
- A fresh deployment may require updates for current Clerk, OpenAI, Pinecone, Prisma, or TMDB APIs.

## Portfolio Context

This project demonstrates:

- Building a full-stack AI application with authenticated user data
- Combining LLM responses with retrieval-augmented context
- Managing relational-style application data with Prisma and MongoDB
- Integrating multiple external APIs into a cohesive user workflow
- Designing a thesis prototype around personalized recommendation systems

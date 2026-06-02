"use client";

import { useState } from "react";
import { Movie } from "@prisma/client";
import MovieSearchCard from "./MovieSearchCard";
import { Button } from "./ui/button";
import { set } from "zod";
import prisma from "@/lib/db/prisma";

export default function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const [searchInProgress, setSearchInProgress] = useState(false);

  async function search() {
    setSearchInProgress(true);
    const response = await fetch(`/api/tmdb/search?title=${searchTerm}`);
    const data = await response.json();
    console.log(data);
    setSearchResults(data.results.slice(0, 5));
    setSearchInProgress(false);
  }

  async function addToWatchlist() {
    console.log("Add to watchlist");
    const response = await fetch(`/api/tmdb/watchlist`, {
      method: "POST",
      body: JSON.stringify({ title: searchTerm }),
    });

    if (!response.ok) {
      throw new Error("Status code: " + response.status);
    }
    setSearchInProgress(true);
    /*
    const responseSearch = await fetch(`/api/tmdb/search?title=${searchTerm}`);

    if (!responseSearch.ok) {
      throw new Error("Status code: " + responseSearch.status);
    }

    const data = await responseSearch.json();
    console.log(data.results[0]);
    const movie = data.results[0];

    const existingMovie = await prisma.movie.findFirst({
      where: { title: movie.title },
    });

    if (!existingMovie) {
      const response = await fetch("/api/tmdb/movie", {
        method: "POST",
        body: JSON.stringify({
          title: movie.title,
          id: movie.id,
          overview: movie.overview,
          releaseDate: movie.release_date,
          posterPath: movie.poster_path,
        }),
      });

      console.log(response);
      const movieToAdd = await response.json();
      console.log(movieToAdd);
      console.log(movieToAdd.movie.movieId);

      if (!response.ok) {
        throw new Error("Status code: " + response.status);
      }

      const responseWatchlist = await fetch("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({
          movieId: movieToAdd.movie.movieId,
        }),
      });

      if (!responseWatchlist.ok) {
        throw new Error("Status code: " + responseWatchlist.status);
      }
    } else {
      const responseWatchlist = await fetch("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({
          movieId: existingMovie.movieId,
        }),
      });

      if (!responseWatchlist.ok) {
        throw new Error("Status code: " + responseWatchlist.status);
      }
    }
      */

    setSearchInProgress(false);
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button onClick={search}>Search</Button>
      <Button onClick={addToWatchlist}>Add to Watchlist</Button>
      <Button onClick={() => setSearchResults(null)}>Clear</Button>
      {searchInProgress && <p>Searching...</p>}
      {searchResults && (
        <div>
          {searchResults.map((movie) => (
            <MovieSearchCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

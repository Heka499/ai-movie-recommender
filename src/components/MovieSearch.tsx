"use client";

import { useState } from "react";
import { Movie } from "@prisma/client";

export default function MovieSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null);
  const [searchInProgress, setSearchInProgress] = useState(false);

  async function search() {
    setSearchInProgress(true);
    const response = await fetch(`/api/tmdb/search?title=${searchTerm}`);
    const data = await response.json();
    setSearchResults(data.results);
    setSearchInProgress(false);
  }

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={search}>Search</button>
      {searchInProgress && <p>Searching...</p>}
      {searchResults && (
        <div>
          {searchResults.map((movie) => (
            <div key={movie.id}>
              <h2>{movie.title}</h2>
              <p>{movie.overview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

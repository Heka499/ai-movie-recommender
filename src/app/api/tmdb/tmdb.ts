export async function fetchMovieDetails(title: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${title}`,
  );
  const data = await response.json();
  return data;
}

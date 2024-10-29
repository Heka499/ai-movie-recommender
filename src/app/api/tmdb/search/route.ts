import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("title");
    console.log(query);

    const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: "Bearer " + process.env.TMDB_AUTH_TOKEN,
      },
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((json) => console.log("tmdb:", json))
      .catch((err) => console.error(err));

    return Response.json({ results: [] });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

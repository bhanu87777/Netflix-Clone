import { HttpError } from '../middleware/errorHandler';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function tmdb<T = any>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new HttpError(
      503,
      'TMDB_API_KEY is not configured. Add it to server/.env (free key at themoviedb.org).'
    );
  }

  const url = new URL(TMDB_BASE + endpoint);
  const headers: Record<string, string> = { accept: 'application/json' };

  // v4 read access tokens are JWTs sent as a Bearer header; v3 keys go in the query string
  if (apiKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else {
    url.searchParams.set('api_key', apiKey);
  }

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      throw new HttpError(503, 'TMDB rejected the API key. Check TMDB_API_KEY in server/.env.');
    }
    if (res.status === 404) {
      throw new HttpError(404, 'Title not found');
    }
    throw new HttpError(502, `TMDB request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

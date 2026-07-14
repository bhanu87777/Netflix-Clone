import { Router } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { tmdb } from '../services/tmdb';

const router = Router();

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

function normalize(item: TmdbItem, fallbackType: 'movie' | 'tv') {
  return {
    id: item.id,
    title: item.title || item.name || 'Untitled',
    overview: item.overview,
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    mediaType: item.media_type === 'tv' || item.media_type === 'movie' ? item.media_type : fallbackType,
    voteAverage: item.vote_average,
    releaseDate: item.release_date || item.first_air_date || null,
  };
}

const CATEGORIES: { key: string; label: string; endpoint: string; params?: Record<string, string>; type: 'movie' | 'tv' }[] = [
  { key: 'trending', label: 'Trending Now', endpoint: '/trending/all/week', type: 'movie' },
  { key: 'originals', label: 'Netflix Originals', endpoint: '/discover/tv', params: { with_networks: '213' }, type: 'tv' },
  { key: 'topRated', label: 'Top Rated', endpoint: '/movie/top_rated', type: 'movie' },
  { key: 'action', label: 'Action Movies', endpoint: '/discover/movie', params: { with_genres: '28' }, type: 'movie' },
  { key: 'comedy', label: 'Comedies', endpoint: '/discover/movie', params: { with_genres: '35' }, type: 'movie' },
  { key: 'horror', label: 'Horror Movies', endpoint: '/discover/movie', params: { with_genres: '27' }, type: 'movie' },
  { key: 'romance', label: 'Romance Movies', endpoint: '/discover/movie', params: { with_genres: '10749' }, type: 'movie' },
  { key: 'documentaries', label: 'Documentaries', endpoint: '/discover/movie', params: { with_genres: '99' }, type: 'movie' },
];

router.get('/banner', async (_req, res) => {
  const data = await tmdb<{ results: TmdbItem[] }>('/trending/all/week');
  const candidates = data.results.filter((r) => r.backdrop_path && r.overview);
  if (candidates.length === 0) {
    throw new HttpError(502, 'No banner candidates returned by TMDB');
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  res.json(normalize(pick, 'movie'));
});

router.get('/categories', async (_req, res) => {
  const rows = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const data = await tmdb<{ results: TmdbItem[] }>(cat.endpoint, cat.params);
      return {
        key: cat.key,
        label: cat.label,
        items: data.results.filter((r) => r.poster_path).map((r) => normalize(r, cat.type)),
      };
    })
  );
  res.json(rows);
});

router.get('/search', async (req, res) => {
  const query = String(req.query.q ?? '').trim();
  if (!query) {
    res.json([]);
    return;
  }
  const data = await tmdb<{ results: TmdbItem[] }>('/search/multi', { query });
  const results = data.results
    .filter((r) => (r.media_type === 'movie' || r.media_type === 'tv') && r.poster_path)
    .map((r) => normalize(r, 'movie'));
  res.json(results);
});

router.get('/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  if (type !== 'movie' && type !== 'tv') {
    throw new HttpError(400, 'Type must be "movie" or "tv"');
  }
  if (!/^\d+$/.test(id)) {
    throw new HttpError(400, 'Invalid id');
  }

  const data = await tmdb<
    TmdbItem & {
      genres: { id: number; name: string }[];
      runtime?: number;
      number_of_seasons?: number;
      videos: { results: { key: string; site: string; type: string; official: boolean }[] };
    }
  >(`/${type}/${id}`, { append_to_response: 'videos' });

  const youtubeVideos = data.videos.results.filter((v) => v.site === 'YouTube');
  const trailer =
    youtubeVideos.find((v) => v.type === 'Trailer' && v.official) ||
    youtubeVideos.find((v) => v.type === 'Trailer') ||
    youtubeVideos.find((v) => v.type === 'Teaser') ||
    youtubeVideos[0];

  res.json({
    ...normalize(data, type),
    genres: data.genres.map((g) => g.name),
    runtime: data.runtime ?? null,
    seasons: data.number_of_seasons ?? null,
    trailerKey: trailer?.key ?? null,
  });
});

export default router;

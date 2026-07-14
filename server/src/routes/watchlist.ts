import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { HttpError } from '../middleware/errorHandler';

const router = Router();
router.use(requireAuth);

interface WatchlistRow extends RowDataPacket {
  tmdb_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  added_at: Date;
}

router.get('/', async (req: AuthRequest, res) => {
  const [rows] = await pool.query<WatchlistRow[]>(
    'SELECT tmdb_id, media_type, title, poster_path, backdrop_path, added_at FROM watchlist WHERE user_id = ? ORDER BY added_at DESC',
    [req.userId]
  );
  res.json(
    rows.map((r) => ({
      id: r.tmdb_id,
      mediaType: r.media_type,
      title: r.title,
      posterPath: r.poster_path,
      backdropPath: r.backdrop_path,
      addedAt: r.added_at,
    }))
  );
});

router.post('/', async (req: AuthRequest, res) => {
  const { id, mediaType, title, posterPath, backdropPath } = req.body ?? {};

  if (!Number.isInteger(id) || (mediaType !== 'movie' && mediaType !== 'tv')) {
    throw new HttpError(400, 'id (number) and mediaType ("movie" | "tv") are required');
  }
  if (typeof title !== 'string' || title.length === 0) {
    throw new HttpError(400, 'title is required');
  }

  await pool.query(
    `INSERT INTO watchlist (user_id, tmdb_id, media_type, title, poster_path, backdrop_path)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title)`,
    [req.userId, id, mediaType, title, posterPath ?? null, backdropPath ?? null]
  );

  res.status(201).json({ ok: true });
});

router.delete('/:tmdbId', async (req: AuthRequest, res) => {
  const tmdbId = Number(req.params.tmdbId);
  if (!Number.isInteger(tmdbId)) {
    throw new HttpError(400, 'Invalid id');
  }
  const mediaType = req.query.mediaType;

  if (mediaType === 'movie' || mediaType === 'tv') {
    await pool.query('DELETE FROM watchlist WHERE user_id = ? AND tmdb_id = ? AND media_type = ?', [
      req.userId,
      tmdbId,
      mediaType,
    ]);
  } else {
    await pool.query('DELETE FROM watchlist WHERE user_id = ? AND tmdb_id = ?', [req.userId, tmdbId]);
  }

  res.json({ ok: true });
});

export default router;

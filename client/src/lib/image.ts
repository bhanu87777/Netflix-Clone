const IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function tmdbImage(path: string | null, size: 'w300' | 'w500' | 'original' = 'w500'): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null
}

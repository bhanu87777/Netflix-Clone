import { useEffect, useState } from 'react'
import YouTube from 'react-youtube'
import { fetchDetails } from '../api'
import { useWatchlist } from '../context/WatchlistContext'
import { tmdbImage } from '../lib/image'
import type { Movie, MovieDetails } from '../types'

interface Props {
  movie: Movie
  onClose: () => void
}

export default function MovieModal({ movie, onClose }: Props) {
  const { isSaved, toggle } = useWatchlist()
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setDetails(null)
    setError(null)
    fetchDetails(movie.mediaType, movie.id)
      .then((d) => {
        if (!cancelled) setDetails(d)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load details')
      })
    return () => {
      cancelled = true
    }
  }, [movie.id, movie.mediaType])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const display = details ?? movie
  const backdrop = tmdbImage(display.backdropPath, 'original')
  const saved = isSaved(movie.id, movie.mediaType)
  const year = display.releaseDate ? display.releaseDate.slice(0, 4) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-12 md:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-lg bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-black">
          {details?.trailerKey ? (
            <YouTube
              videoId={details.trailerKey}
              className="h-full w-full"
              iframeClassName="h-full w-full"
              opts={{
                width: '100%',
                height: '100%',
                playerVars: { autoplay: 1, modestbranding: 1, rel: 0 },
              }}
            />
          ) : backdrop ? (
            <img src={backdrop} alt={display.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-500">
              {details ? 'No trailer available' : 'Loading…'}
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg text-white hover:bg-black"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{display.title}</h2>
            <button
              onClick={() => toggle(display)}
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                saved
                  ? 'bg-neutral-700 text-white hover:bg-neutral-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {saved ? '✓ In My List' : '+ My List'}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
            {year && <span>{year}</span>}
            {display.voteAverage > 0 && (
              <span className="font-semibold text-green-500">
                {Math.round(display.voteAverage * 10)}% match
              </span>
            )}
            {details?.runtime ? <span>{details.runtime} min</span> : null}
            {details?.seasons ? (
              <span>
                {details.seasons} season{details.seasons > 1 ? 's' : ''}
              </span>
            ) : null}
            <span className="rounded border border-neutral-600 px-1.5 py-0.5 text-xs uppercase">
              {display.mediaType}
            </span>
          </div>

          {details && details.genres.length > 0 && (
            <p className="mt-2 text-sm text-neutral-400">{details.genres.join(' • ')}</p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-neutral-200">
            {display.overview || 'No description available.'}
          </p>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}

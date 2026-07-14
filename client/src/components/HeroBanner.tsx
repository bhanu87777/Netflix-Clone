import { tmdbImage } from '../lib/image'
import { useWatchlist } from '../context/WatchlistContext'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  onSelect: (movie: Movie) => void
}

export default function HeroBanner({ movie, onSelect }: Props) {
  const { isSaved, toggle } = useWatchlist()
  const backdrop = tmdbImage(movie.backdropPath, 'original')
  const saved = isSaved(movie.id, movie.mediaType)

  return (
    <div className="relative h-[75vh] w-full">
      {backdrop && (
        <img src={backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

      <div className="absolute bottom-[15%] left-4 max-w-xl md:left-10">
        <h1 className="text-3xl font-extrabold drop-shadow-lg md:text-5xl">{movie.title}</h1>
        <p className="mt-4 line-clamp-3 text-sm text-neutral-200 drop-shadow md:text-base">
          {movie.overview}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => onSelect(movie)}
            className="flex items-center gap-2 rounded bg-white px-6 py-2 font-semibold text-black transition hover:bg-neutral-300"
          >
            ▶ Play
          </button>
          <button
            onClick={() => toggle(movie)}
            className="flex items-center gap-2 rounded bg-neutral-600/70 px-6 py-2 font-semibold text-white transition hover:bg-neutral-500/70"
          >
            {saved ? '✓ My List' : '+ My List'}
          </button>
        </div>
      </div>
    </div>
  )
}

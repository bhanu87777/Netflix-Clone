import { tmdbImage } from '../lib/image'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  onSelect: (movie: Movie) => void
}

export default function MovieCard({ movie, onSelect }: Props) {
  const poster = tmdbImage(movie.posterPath, 'w300')

  return (
    <button
      onClick={() => onSelect(movie)}
      className="group relative w-[130px] shrink-0 cursor-pointer overflow-hidden rounded transition-transform duration-200 hover:z-10 hover:scale-105 md:w-[160px]"
      title={movie.title}
    >
      {poster ? (
        <img
          src={poster}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-neutral-800 p-2 text-center text-sm text-neutral-300">
          {movie.title}
        </div>
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="text-left text-xs font-semibold text-white">{movie.title}</span>
      </div>
    </button>
  )
}

import { useState } from 'react'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModal'
import { useWatchlist } from '../context/WatchlistContext'
import type { Movie, WatchlistItem } from '../types'

function toMovie(item: WatchlistItem): Movie {
  return {
    id: item.id,
    title: item.title,
    overview: '',
    posterPath: item.posterPath,
    backdropPath: item.backdropPath,
    mediaType: item.mediaType,
    voteAverage: 0,
    releaseDate: null,
  }
}

export default function MyList() {
  const { items, remove } = useWatchlist()
  const [selected, setSelected] = useState<Movie | null>(null)

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-10">
      <h1 className="text-2xl font-bold">My List</h1>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-neutral-400">
          <p className="text-lg">Your list is empty.</p>
          <p className="mt-2 text-sm">Browse titles and hit “+ My List” to save them here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {items.map((item) => (
            <div key={`${item.mediaType}-${item.id}`} className="relative flex justify-center">
              <MovieCard movie={toMovie(item)} onSelect={setSelected} />
              <button
                onClick={() => remove(item.id, item.mediaType)}
                aria-label={`Remove ${item.title} from My List`}
                className="absolute top-1 right-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm text-white opacity-80 hover:bg-red-600 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

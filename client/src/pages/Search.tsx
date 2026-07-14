import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchTitles } from '../api'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModal'
import type { Movie } from '../types'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Movie | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      searchTitles(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 md:px-10">
      <h1 className="text-xl font-semibold text-neutral-200">
        {query ? `Results for "${query}"` : 'Search for a title'}
      </h1>

      {loading && (
        <div className="mt-16 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-red-600" />
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <p className="mt-8 text-neutral-400">No titles found for "{query}".</p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {results.map((movie) => (
          <div key={`${movie.mediaType}-${movie.id}`} className="flex justify-center">
            <MovieCard movie={movie} onSelect={setSelected} />
          </div>
        ))}
      </div>

      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

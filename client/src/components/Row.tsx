import { useRef } from 'react'
import type { Movie } from '../types'
import MovieCard from './MovieCard'

interface Props {
  label: string
  movies: Movie[]
  onSelect: (movie: Movie) => void
}

export default function Row({ label, movies, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current
    if (el) {
      el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
    }
  }

  if (movies.length === 0) return null

  return (
    <section className="group/row relative px-4 md:px-10">
      <h2 className="mb-2 text-lg font-semibold text-neutral-100 md:text-xl">{label}</h2>
      <div className="relative">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="absolute top-0 bottom-0 left-0 z-20 hidden w-10 items-center justify-center bg-black/50 text-3xl text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/70 md:flex"
        >
          ‹
        </button>
        <div ref={scrollerRef} className="scrollbar-hide flex gap-2 overflow-x-auto scroll-smooth">
          {movies.map((movie) => (
            <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} onSelect={onSelect} />
          ))}
        </div>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="absolute top-0 right-0 bottom-0 z-20 hidden w-10 items-center justify-center bg-black/50 text-3xl text-white opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/70 md:flex"
        >
          ›
        </button>
      </div>
    </section>
  )
}

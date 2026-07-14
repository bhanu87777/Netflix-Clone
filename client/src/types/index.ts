export interface User {
  id: number
  email: string
  name: string
}

export interface Movie {
  id: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  mediaType: 'movie' | 'tv'
  voteAverage: number
  releaseDate: string | null
}

export interface MovieDetails extends Movie {
  genres: string[]
  runtime: number | null
  seasons: number | null
  trailerKey: string | null
}

export interface Category {
  key: string
  label: string
  items: Movie[]
}

export interface WatchlistItem {
  id: number
  mediaType: 'movie' | 'tv'
  title: string
  posterPath: string | null
  backdropPath: string | null
  addedAt: string
}

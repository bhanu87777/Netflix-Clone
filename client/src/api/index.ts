import type { Category, Movie, MovieDetails, User, WatchlistItem } from '../types'
import { api } from './client'

interface AuthResponse {
  token: string
  user: User
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name })
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>('/auth/me')
  return data.user
}

export async function fetchBanner(): Promise<Movie> {
  const { data } = await api.get<Movie>('/movies/banner')
  return data
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/movies/categories')
  return data
}

export async function fetchDetails(mediaType: 'movie' | 'tv', id: number): Promise<MovieDetails> {
  const { data } = await api.get<MovieDetails>(`/movies/${mediaType}/${id}`)
  return data
}

export async function searchTitles(query: string): Promise<Movie[]> {
  const { data } = await api.get<Movie[]>('/movies/search', { params: { q: query } })
  return data
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const { data } = await api.get<WatchlistItem[]>('/watchlist')
  return data
}

export async function addToWatchlist(movie: Movie): Promise<void> {
  await api.post('/watchlist', {
    id: movie.id,
    mediaType: movie.mediaType,
    title: movie.title,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
  })
}

export async function removeFromWatchlist(id: number, mediaType: 'movie' | 'tv'): Promise<void> {
  await api.delete(`/watchlist/${id}`, { params: { mediaType } })
}

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as apiClient from '../api'
import type { Movie, WatchlistItem } from '../types'
import { useAuth } from './AuthContext'

interface WatchlistContextValue {
  items: WatchlistItem[]
  isSaved: (id: number, mediaType: 'movie' | 'tv') => boolean
  toggle: (movie: Movie) => Promise<void>
  remove: (id: number, mediaType: 'movie' | 'tv') => Promise<void>
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<WatchlistItem[]>([])

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    apiClient
      .fetchWatchlist()
      .then(setItems)
      .catch(() => setItems([]))
  }, [user])

  const isSaved = useCallback(
    (id: number, mediaType: 'movie' | 'tv') =>
      items.some((item) => item.id === id && item.mediaType === mediaType),
    [items]
  )

  const remove = useCallback(async (id: number, mediaType: 'movie' | 'tv') => {
    await apiClient.removeFromWatchlist(id, mediaType)
    setItems((prev) => prev.filter((item) => !(item.id === id && item.mediaType === mediaType)))
  }, [])

  const toggle = useCallback(
    async (movie: Movie) => {
      if (isSaved(movie.id, movie.mediaType)) {
        await remove(movie.id, movie.mediaType)
        return
      }
      await apiClient.addToWatchlist(movie)
      setItems((prev) => [
        {
          id: movie.id,
          mediaType: movie.mediaType,
          title: movie.title,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          addedAt: new Date().toISOString(),
        },
        ...prev,
      ])
    },
    [isSaved, remove]
  )

  return (
    <WatchlistContext.Provider value={{ items, isSaved, toggle, remove }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}

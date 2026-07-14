import { useEffect, useState } from 'react'
import { fetchBanner, fetchCategories } from '../api'
import { apiErrorMessage } from '../api/client'
import HeroBanner from '../components/HeroBanner'
import MovieModal from '../components/MovieModal'
import Row from '../components/Row'
import type { Category, Movie } from '../types'

export default function Home() {
  const [banner, setBanner] = useState<Movie | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Movie | null>(null)

  useEffect(() => {
    Promise.all([fetchBanner(), fetchCategories()])
      .then(([bannerData, categoryData]) => {
        setBanner(bannerData)
        setCategories(categoryData)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-700 border-t-red-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center px-6">
        <div className="max-w-lg rounded-lg bg-neutral-900 p-8 text-center">
          <h2 className="text-xl font-bold text-red-500">Couldn't load titles</h2>
          <p className="mt-3 text-sm text-neutral-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-16">
      {banner && <HeroBanner movie={banner} onSelect={setSelected} />}
      <div className="-mt-10 flex flex-col gap-8 md:-mt-16">
        {categories.map((category) => (
          <Row key={category.key} label={category.label} movies={category.items} onSelect={setSelected} />
        ))}
      </div>
      {selected && <MovieModal movie={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

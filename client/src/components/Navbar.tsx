import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [scrolled, setScrolled] = useState(false)
  const [term, setTerm] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (location.pathname !== '/search') {
      setTerm('')
    }
  }, [location.pathname])

  function onSearchChange(value: string) {
    setTerm(value)
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`, {
        replace: location.pathname === '/search',
      })
    } else if (location.pathname === '/search') {
      navigate('/')
    }
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? 'font-semibold text-white' : 'text-neutral-300 hover:text-white'}`

  return (
    <header
      className={`fixed top-0 z-40 w-full px-4 py-3 transition-colors duration-300 md:px-10 ${
        scrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-red-600 select-none">
          NETFLIX
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/my-list" className={linkClass}>
            My List
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <input
            type="search"
            value={term}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Titles, people, genres"
            className="w-36 rounded border border-neutral-600 bg-black/60 px-3 py-1.5 text-sm text-white placeholder-neutral-400 outline-none transition-all focus:w-56 focus:border-white md:w-48 md:focus:w-72"
          />
          <span className="hidden text-sm text-neutral-300 sm:block">{user?.name}</span>
          <button
            onClick={logout}
            className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}

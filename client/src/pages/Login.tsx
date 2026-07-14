import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-neutral-900 via-black to-black">
      <header className="px-6 py-5 md:px-12">
        <span className="text-3xl font-extrabold tracking-tight text-red-600 select-none">NETFLIX</span>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-lg bg-black/75 p-8 md:p-12"
        >
          <h1 className="mb-6 text-3xl font-bold">Sign In</h1>
          {error && (
            <p className="mb-4 rounded bg-orange-500/90 px-4 py-2 text-sm text-white">{error}</p>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="mb-4 w-full rounded bg-neutral-800 px-4 py-3 text-white placeholder-neutral-400 outline-none focus:bg-neutral-700"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mb-6 w-full rounded bg-neutral-800 px-4 py-3 text-white placeholder-neutral-400 outline-none focus:bg-neutral-700"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="mt-6 text-sm text-neutral-400">
            New here?{' '}
            <Link to="/register" className="text-white hover:underline">
              Sign up now
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}

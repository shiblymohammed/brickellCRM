'use client'

import { useState, useTransition } from 'react'
import { login } from '@/lib/auth/actions'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 mb-4">
          <span className="text-white font-bold text-lg">B</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">BRICKELL-CONNECT</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 transition"
              placeholder="you@brickell.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isPending}
                className="w-full h-10 px-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:bg-slate-50 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Access is restricted to authorized staff only.
      </p>
    </div>
  )
}

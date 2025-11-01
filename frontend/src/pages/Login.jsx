import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    setPasswordError(null)

    // client-side validation before calling the API
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    let hasError = false
    if (!isValidEmail(email)) {
      setEmailError('Email inválido')
      hasError = true
    }
    if (!password || password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
      hasError = true
    }
    if (hasError) return

    setLoading(true)
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      navigate('/game')
    } catch (err) {
      // Normalize backend error payloads (Zod returns array of objects) into a string
      const raw = err.response?.data?.error
      let msg = 'Login failed'
      if (raw) {
        if (Array.isArray(raw)) {
          // join individual validation messages if present
          msg = raw.map((r) => r?.message || (typeof r === 'string' ? r : JSON.stringify(r))).join(', ')
        } else if (typeof raw === 'string') {
          msg = raw
        } else if (raw.message) {
          msg = raw.message
        } else {
          try { msg = JSON.stringify(raw) } catch (_) { msg = String(raw) }
        }
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <Alert>{error}</Alert>}
        <div>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              // live-validate while typing
              if (emailError) {
                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
                setEmailError(isValidEmail ? null : 'Email inválido')
              }
            }}
            placeholder="Email"
            className="p-2 border rounded w-full"
          />
          {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
        </div>

        <div>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (passwordError) {
                setPasswordError(e.target.value.length >= 6 ? null : 'A senha deve ter pelo menos 6 caracteres')
              }
            }}
            type="password"
            placeholder="Senha"
            className="p-2 border rounded w-full"
          />
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
        </div>
        <button disabled={loading} className="bg-blue-600 text-white p-2 rounded flex items-center justify-center">
          {loading ? <Spinner size={1.2} /> : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

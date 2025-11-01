import React, { useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nameError, setNameError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    // clear previous inline errors
    setNameError(null)
    setEmailError(null)
    setPasswordError(null)

    // client-side validation
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    let hasError = false
    if (!name || name.trim().length < 2) {
      setNameError('Nome muito curto')
      hasError = true
    }
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
      await api.post('/register', { name, email, password })
      navigate('/login')
    } catch (err) {
      // Normalize backend error payloads (Zod returns array of objects)
      const raw = err.response?.data?.error
      let msg = 'Registration failed'
      if (raw) {
        if (Array.isArray(raw)) {
          msg = raw.map((r) => r?.message || (typeof r === 'string' ? r : JSON.stringify(r))).join('; ')
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
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow fade-in">
      <h2 className="text-xl font-bold mb-4">Registrar</h2>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {error && <Alert>{error}</Alert>}

        <div>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(e.target.value.trim().length >= 2 ? null : 'Nome muito curto')
            }}
            placeholder="Nome"
            className="p-2 border rounded w-full"
          />
          {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
        </div>

        <div>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
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
              if (passwordError) setPasswordError(e.target.value.length >= 6 ? null : 'A senha deve ter pelo menos 6 caracteres')
            }}
            type="password"
            placeholder="Senha"
            className="p-2 border rounded w-full"
          />
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
        </div>

        <button disabled={loading} className="bg-green-600 text-white p-2 rounded flex items-center justify-center">
          {loading ? <Spinner size={1.2} /> : 'Registrar'}
        </button>
      </form>
    </div>
  )
}

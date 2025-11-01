import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api'
import Spinner from './Spinner'

function parseJwt(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return decoded
  } catch (e) {
    try {
      // browser fallback if Buffer not available
      const payload = token.split('.')[1]
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const json = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(json)
    } catch (err) {
      return null
    }
  }
}

function isTokenValid(token) {
  if (!token) return false
  const decoded = parseJwt(token)
  if (!decoded) return false
  const now = Date.now() / 1000
  return decoded.exp && decoded.exp > now
}

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    async function check() {
      const access = localStorage.getItem('accessToken')
      if (isTokenValid(access)) {
        setAllowed(true)
        setLoading(false)
        return
      }

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        setAllowed(false)
        setLoading(false)
        return
      }

      // Try to refresh token via API
      try {
        const res = await api.post('/refresh', { refreshToken })
        localStorage.setItem('accessToken', res.data.accessToken)
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken)
        setAllowed(true)
      } catch (e) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAllowed(false)
      } finally {
        setLoading(false)
      }
    }
    check()
  }, [])

  if (loading) return <div className="flex justify-center"><Spinner size={3} /></div>
  if (!allowed) return <Navigate to="/login" replace />
  return children
}

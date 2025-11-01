import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import api from './api'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Game from './pages/Game'
import PrivateRoute from './components/PrivateRoute'
import Ranking from './pages/Ranking'

export default function App() {
  const navigate = useNavigate()

  const [userName, setUserName] = React.useState(null)

  async function loadMe() {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    try {
      const res = await api.get('/me')
      setUserName(res.data.name)
    } catch (e) {
      // ignore
    }
  }

  React.useEffect(() => { loadMe() }, [])

  function handleLogout() {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      api.post('/logout', { refreshToken }).catch(() => {})
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUserName(null)
    navigate('/')
  }

  const isLogged = !!localStorage.getItem('accessToken') || !!localStorage.getItem('refreshToken')

  return (
    <div className="min-h-screen bg-gray-100">
  <nav className="bg-white shadow p-4 text-gray-800">
        <div className="container mx-auto flex gap-4 items-center">
          <Link to="/" className="font-bold">Memory</Link>
          <Link to="/game">Jogar</Link>
          <Link to="/ranking">Ranking</Link>
          <div className="ml-auto">
            {isLogged ? (
              <div className="flex items-center gap-3">
                {userName && <span className="text-sm">Olá, {userName}</span>}
                <button onClick={handleLogout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1 bg-blue-500 text-white rounded mr-2">Login</Link>
                <Link to="/register" className="px-3 py-1 bg-green-500 text-white rounded">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
          <Route path="/ranking" element={<Ranking />} />
        </Routes>
      </main>
    </div>
  )
}

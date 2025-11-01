import React, { useEffect, useState } from 'react'
import api from '../api'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

export default function Ranking() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/ranking')
      .then((res) => {
        console.log('Ranking fetched:', res.data)
        setRows(res.data)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load ranking'))
      .finally(() => setLoading(false))
  }, [])

  function reload() {
    setError(null)
    setLoading(true)
    api.get('/ranking').then((res) => setRows(res.data)).catch((e) => setError(e.response?.data?.error || 'Failed to load ranking')).finally(() => setLoading(false))
  }

  if (loading) return <div className="flex justify-center"><Spinner size={3} /></div>
  if (error) return <Alert>{error}</Alert>

  return (
    <div className="fade-in">
      <h2 className="text-2xl font-bold mb-4">Ranking</h2>
        <div className="mb-4">
          <button onClick={reload} className="btn primary">Recarregar</button>
        </div>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="text-left">
            <th className="p-2">Jogador</th>
            <th className="p-2">Melhor Pontuação</th>
            <th className="p-2">Melhor Tempo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.player_id} className="border-t">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.top_score}</td>
              <td className="p-2">{r.best_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

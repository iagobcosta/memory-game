import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Jogo da Memória</h1>
      <div className="flex gap-4 justify-center">
        <Link to="/game" className="px-4 py-2 bg-blue-600 text-white rounded">Jogar</Link>
        <Link to="/ranking" className="px-4 py-2 bg-green-600 text-white rounded">Ranking</Link>
      </div>
    </div>
  )
}

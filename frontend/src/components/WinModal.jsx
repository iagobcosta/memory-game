import React from 'react'

export default function WinModal({ open, score, moves, time, onClose, onNewGame, onShare }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
  <div className="relative z-10 max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center text-gray-900">
        <h3 className="text-2xl font-bold mb-2">Parabéns!</h3>
        <p className="mb-4">Você completou o jogo.</p>
        <div className="mb-4">
          <div>Pontuação: <strong>{score}</strong></div>
          <div>Movimentos: <strong>{moves}</strong></div>
          <div>Tempo: <strong>{time}s</strong></div>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onNewGame} className="btn">Nova partida</button>
          <button onClick={onShare} className="btn">Compartilhar</button>
          <button onClick={onClose} className="btn">Fechar</button>
        </div>
      </div>
    </div>
  )
}

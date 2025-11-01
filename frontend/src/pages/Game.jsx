import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import WinModal from '../components/WinModal'

const EMOJIS = ['🦊','🐶','🐱','🐼','🐸','🐵','🐤','🐙']

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5)
}

export default function Game() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [saveStatus, setSaveStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialReveal, setInitialReveal] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    const pairs = EMOJIS.slice(0,6)
    const deck = shuffle([...pairs, ...pairs]).map((emoji, idx) => ({ id: idx, emoji }))
    setCards(deck)
    // reveal briefly
    setInitialReveal(true)
    setTimeout(() => setInitialReveal(false), 1500)
    // start timer
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
    setLoading(false)
    return () => clearInterval(timerRef.current)
  }, [])

  const [winModalOpen, setWinModalOpen] = useState(false)
  const [lastScore, setLastScore] = useState(null)

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      clearInterval(timerRef.current)
      const score = Math.max(0, 1000 - (moves * 5 + time * 2))
      setLastScore(score)
      setWinModalOpen(true)
      const token = localStorage.getItem('accessToken')
      if (!token) {
        // don't auto-save, but allow user to navigate to login from modal
        return
      }

      // try to save and show feedback
      setSaveStatus('saving')
      api.post('/game/save', { moves, time_elapsed: time, score })
        .then(() => {
          setSaveStatus('saved')
          // hide saved badge after a short delay
          setTimeout(() => setSaveStatus(null), 2500)
        })
        .catch((err) => {
          console.error('Erro ao salvar jogo:', err?.response?.data || err.message || err)
          setSaveStatus('error')
        })
    }
  }, [matched])

  function flipCard(c, idx) {
    if (loading) return
    if (flipped.includes(idx) || matched.includes(idx)) return
    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a,b] = newFlipped.map(i => cards[i])
      if (a.emoji === b.emoji) {
        setMatched((m) => [...m, ...newFlipped])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  function resetGame() {
    // clear any existing timer and start a fresh one
    try { clearInterval(timerRef.current) } catch (_) {}
    const pairs = EMOJIS.slice(0,6)
    const deck = shuffle([...pairs, ...pairs]).map((emoji, idx) => ({ id: idx, emoji }))
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTime(0)
    setInitialReveal(true)
    setTimeout(() => setInitialReveal(false), 1500)
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
  }

  function handleCloseModal() {
    setWinModalOpen(false)
  }

  function handleNewGame() {
    setWinModalOpen(false)
    resetGame()
  }

  function handleShare() {
    const text = `Consegui ${lastScore} pontos em ${moves} movimentos e ${time}s no Memory!`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert('Texto copiado para área de transferência!'))
    } else {
      prompt('Copie seu resultado:', text)
    }
  }

  if (loading) return <div className="flex justify-center"><Spinner size={4} /></div>

  return (
    <div className="fade-in container">
      <div className="game-frame">
        <div className="frame-header">
          <div>
            <div className="frame-badge">Memory Game</div>
            <div className="text-gray-600">Desafie sua memória — encontre os pares</div>
          </div>
        </div>
        <div className="game-top">
        <div>
          <h2 className="text-2xl font-bold">Jogar</h2>
          <div className="text-sm text-gray-600">Divirta-se e memorize os pares!</div>
        </div>
        <div className="panel">
          <div className="text-sm">Movimentos: <strong className="ml-2">{moves}</strong></div>
          <div className="text-sm">Tempo: <strong className="ml-2">{time}s</strong></div>
        </div>
      </div>

        <div className="board card-grid">
        {cards.map((c, idx) => {
          const isFlipped = initialReveal || flipped.includes(idx) || matched.includes(idx)
          return (
            <div key={idx} className={`card ${isFlipped ? 'flipped' : ''} ${matched.includes(idx) ? 'matched' : ''}`} onClick={() => flipCard(c, idx)}>
              <div className="card-inner">
                <div className="card-face card-front rounded">
                  <div className="text-2xl">❓</div>
                </div>
                <div className="card-face card-back rounded">
                  <div className="text-2xl">{c.emoji}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

        <div className="mt-6 flex justify-center">
          <button onClick={resetGame} className="btn primary">Reiniciar</button>
        </div>

        <WinModal open={winModalOpen} score={lastScore} moves={moves} time={time} onClose={handleCloseModal} onNewGame={handleNewGame} onShare={handleShare} />

        {/* Save status indicator */}
        {saveStatus === 'saving' && <div className="mt-4 text-center text-sm muted">Salvando resultado...</div>}
        {saveStatus === 'saved' && <div className="mt-4 text-center text-sm" style={{color:'#7ef6b6'}}>Resultado salvo com sucesso ✅</div>}
        {saveStatus === 'error' && <div className="mt-4 text-center text-sm" style={{color:'#ff7aa9'}}>Erro ao salvar resultado. Tente novamente.</div>}
      </div>
    </div>
  )
}

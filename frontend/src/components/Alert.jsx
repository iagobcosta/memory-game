import React from 'react'

export default function Alert({ type = 'error', children }) {
  const base = 'p-3 rounded text-sm'
  const cls = type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  return <div className={`${base} ${cls}`}>{children}</div>
}

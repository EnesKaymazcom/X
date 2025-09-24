"use client"

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div style={{ padding: 32 }}>
      <h2>Bir hata oluştu!</h2>
      <pre>{error.message}</pre>
      <button onClick={() => reset()}>Tekrar Dene</button>
    </div>
  )
} 
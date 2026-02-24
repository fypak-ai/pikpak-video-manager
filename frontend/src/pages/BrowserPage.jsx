import { useState, useRef, useEffect } from 'react'

export default function BrowserPage() {
  const [url, setUrl] = useState('https://www.google.com')
  const [currentUrl, setCurrentUrl] = useState('')
  const [extractedVideos, setExtractedVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/scraper/browser`)
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'videos') setExtractedVideos(msg.data)
      if (msg.type === 'navigated') setCurrentUrl(msg.url)
    }
    wsRef.current = ws
    return () => ws.close()
  }, [])

  const navigate = () => {
    if (!wsRef.current) return
    setLoading(true)
    wsRef.current.send(JSON.stringify({ action: 'navigate', url }))
    setLoading(false)
  }

  const extractVideos = () => {
    if (!wsRef.current) return
    wsRef.current.send(JSON.stringify({ action: 'extract', url: currentUrl || url }))
  }

  const sendToPikPak = async (videoUrl) => {
    await fetch('/api/cloud/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_url: videoUrl })
    })
    alert(`Enviado para PikPak: ${videoUrl}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🌐 Navegador Embutido</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate()}
          placeholder="Digite a URL..."
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm"
        />
        <button onClick={navigate} disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          Navegar
        </button>
        <button onClick={extractVideos}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
          🕷️ Extrair Vídeos
        </button>
      </div>

      {currentUrl && (
        <p className="text-gray-500 text-xs mb-4">Página atual (backend): {currentUrl}</p>
      )}

      {/* Iframe sandboxado para preview visual */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden mb-6">
        <iframe
          src={url}
          title="Navegador Embutido"
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="w-full"
          style={{ height: '400px', border: 'none' }}
        />
      </div>

      {extractedVideos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">🎬 Vídeos Encontrados ({extractedVideos.length})</h2>
          <div className="grid gap-2">
            {extractedVideos.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
                <div className="flex-1">
                  <p className="text-blue-400 text-sm truncate">{v.url}</p>
                  <p className="text-gray-500 text-xs">{v.type}</p>
                </div>
                <button
                  onClick={() => sendToPikPak(v.url)}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs whitespace-nowrap">
                  ☁️ Enviar ao PikPak
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

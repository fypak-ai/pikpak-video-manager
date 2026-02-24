import { useState } from 'react'
import axios from 'axios'

export default function ScraperPage() {
  const [url, setUrl] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState('')

  const scrape = async () => {
    if (!url) return
    setLoading(true)
    setVideos([])
    try {
      const { data } = await axios.post('/api/scraper/extract-videos', { url })
      setVideos(data.videos || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const takeScreenshot = async () => {
    if (!url) return
    const { data } = await axios.post('/api/scraper/screenshot', { url })
    setScreenshot(data.screenshot)
  }

  const sendToPikPak = async (videoUrl) => {
    await axios.post('/api/cloud/send', { video_url: videoUrl })
    alert(`Enviado para PikPak!`)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🕷️ Raspador de Vídeos</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="URL do site para raspar..."
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm"
        />
        <button onClick={scrape} disabled={loading}
          className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {loading ? 'Raspando...' : '🕷️ Raspar Vídeos'}
        </button>
        <button onClick={takeScreenshot}
          className="bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-2 rounded-lg text-sm">
          📸 Screenshot
        </button>
      </div>

      {screenshot && (
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-2">Preview da página</h3>
          <img src={`data:image/jpeg;base64,${screenshot}`} alt="screenshot" className="rounded-xl max-w-full border border-[#30363d]" />
        </div>
      )}

      {videos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Vídeos encontrados: <span className="text-blue-400">{videos.length}</span>
          </h2>
          <div className="grid gap-2">
            {videos.map((v, i) => (
              <div key={i} className="flex items-start gap-3 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-400 text-sm break-all">{v.url}</p>
                  <p className="text-gray-500 text-xs mt-1">Tipo: {v.type} | Origem: {v.source}</p>
                </div>
                <button
                  onClick={() => sendToPikPak(v.url)}
                  className="shrink-0 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                  ☁️ PikPak
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && videos.length === 0 && url && (
        <p className="text-gray-500 text-sm mt-4">Nenhum vídeo encontrado. Tente outro site.</p>
      )}
    </div>
  )
}

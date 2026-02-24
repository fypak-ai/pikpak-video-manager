import { useState } from 'react'
import axios from 'axios'

export default function ScraperPage() {
  const [url, setUrl] = useState('')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState({})

  const scrape = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setVideos([])
    setScreenshot('')
    setSent({})
    try {
      const [videosRes, screenshotRes] = await Promise.allSettled([
        axios.post('/api/scraper/extract-videos', { url }),
        axios.post('/api/scraper/screenshot', { url })
      ])
      if (videosRes.status === 'fulfilled') setVideos(videosRes.value.data.videos || [])
      else setError('Erro ao raspar vídeos. Verifique a URL.')
      if (screenshotRes.status === 'fulfilled') setScreenshot(screenshotRes.value.data.screenshot || '')
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao acessar a página.')
    } finally {
      setLoading(false)
    }
  }

  const sendToPikPak = async (videoUrl, idx) => {
    setSent(prev => ({ ...prev, [idx]: 'sending' }))
    try {
      await axios.post('/api/cloud/send', { video_url: videoUrl })
      setSent(prev => ({ ...prev, [idx]: 'done' }))
    } catch {
      setSent(prev => ({ ...prev, [idx]: 'error' }))
    }
  }

  const sendAllToPikPak = async () => {
    for (let i = 0; i < videos.length; i++) {
      if (!sent[i]) await sendToPikPak(videos[i], i)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-4 border-b border-[#30363d]">
        <h1 className="text-xl font-bold text-white mb-1">🕷️ Raspador de Vídeos</h1>
        <p className="text-gray-500 text-sm mb-4">Cole a URL de qualquer página para extrair vídeos e enviar direto ao PikPak</p>
        <div className="flex gap-2">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && scrape()}
            placeholder="https://exemplo.com/pagina-com-video"
            className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-600 outline-none transition-colors"
          />
          <button
            onClick={scrape}
            disabled={loading || !url.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#21262d] disabled:text-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Raspando...' : 'Raspar'}
          </button>
        </div>
        {error && (
          <div className="mt-3 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="text-3xl mb-3 animate-pulse">🔍</div>
            <p className="text-gray-400 text-sm">Acessando a página e extraindo vídeos...</p>
          </div>
        )}

        {!loading && (screenshot || videos.length > 0) && (
          <div className="space-y-6">
            {/* Screenshot */}
            {screenshot && (
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Prévia da página</p>
                <img
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Screenshot"
                  className="rounded-lg border border-[#30363d] w-full max-h-56 object-cover"
                />
              </div>
            )}

            {/* Vídeos encontrados */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-sm">{videos.length} vídeo{videos.length > 1 ? 's' : ''} encontrado{videos.length > 1 ? 's' : ''}</p>
                  {videos.length > 1 && (
                    <button
                      onClick={sendAllToPikPak}
                      className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Enviar todos ao PikPak
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {videos.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
                      <span className="text-blue-400 text-lg flex-shrink-0">🎬</span>
                      <p className="flex-1 text-gray-300 text-xs truncate font-mono">{v}</p>
                      <button
                        onClick={() => sendToPikPak(v, i)}
                        disabled={sent[i] === 'sending' || sent[i] === 'done'}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          sent[i] === 'done' ? 'bg-green-900/50 text-green-400 cursor-default' :
                          sent[i] === 'error' ? 'bg-red-900/50 text-red-400' :
                          sent[i] === 'sending' ? 'bg-[#21262d] text-gray-500 cursor-wait' :
                          'bg-blue-700 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {sent[i] === 'done' ? '✓ Enviado' : sent[i] === 'error' ? '✗ Erro' : sent[i] === 'sending' ? 'Enviando...' : '→ PikPak'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!loading && videos.length === 0 && screenshot && (
              <div className="text-center py-6">
                <span className="text-3xl mb-2 block">🔇</span>
                <p className="text-gray-500 text-sm">Nenhum vídeo encontrado nesta página</p>
              </div>
            )}
          </div>
        )}

        {!loading && videos.length === 0 && !screenshot && !error && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2">🌐</span>
            <p className="text-gray-500 text-sm">Cole uma URL acima para começar a raspar</p>
          </div>
        )}
      </div>
    </div>
  )
}

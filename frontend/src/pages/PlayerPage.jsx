import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Hls from 'hls.js'

export default function PlayerPage() {
  const { fileId } = useParams()
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!fileId) return
    fetch(`/api/player/info/${fileId}`)
      .then(r => r.json())
      .then(data => {
        setInfo(data)
        loadStream(data.stream_url)
      })
      .catch(() => setError('Erro ao carregar vídeo'))
  }, [fileId])

  const loadStream = (url) => {
    const video = videoRef.current
    if (!video) return
    if (Hls.isSupported() && url.includes('.m3u8')) {
      if (hlsRef.current) hlsRef.current.destroy()
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else {
      video.src = url
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">▶️ Reprodutor de Vídeo</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {!fileId && <p className="text-gray-400">Selecione um vídeo na aba Nuvem para reproduzir.</p>}
      {info && (
        <div className="mb-4">
          <p className="text-white font-semibold">{info.name}</p>
          <p className="text-gray-400 text-sm">{info.size ? `${(info.size/1024/1024).toFixed(1)} MB` : ''}</p>
        </div>
      )}
      <div className="bg-black rounded-xl overflow-hidden aspect-video w-full max-w-4xl">
        <video
          ref={videoRef}
          controls
          autoPlay
          className="w-full h-full"
          style={{ background: '#000' }}
        />
      </div>
    </div>
  )
}

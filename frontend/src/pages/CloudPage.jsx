import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function CloudPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [folderId, setFolderId] = useState('')
  const [magnet, setMagnet] = useState('')
  const navigate = useNavigate()

  const loadFiles = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/pikpak/files?folder_id=${folderId}`)
      setFiles(data.files || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFiles() }, [folderId])

  const sendMagnet = async () => {
    if (!magnet) return
    await axios.post('/api/pikpak/upload-magnet', { magnet, folder_id: folderId })
    setMagnet('')
    loadFiles()
  }

  const deleteFile = async (id) => {
    await axios.delete(`/api/pikpak/files/${id}`)
    loadFiles()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">☁️ Gerenciador de Nuvem PikPak</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={magnet}
          onChange={e => setMagnet(e.target.value)}
          placeholder="Link magnético ou URL..."
          className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2 text-white text-sm"
        />
        <button onClick={sendMagnet} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          Enviar para PikPak
        </button>
        <button onClick={loadFiles} className="bg-[#21262d] hover:bg-[#30363d] text-white px-4 py-2 rounded-lg text-sm">
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : (
        <div className="grid gap-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
              <span className="text-xl">{file.kind === 'drive#folder' ? '📁' : '🎬'}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{file.name}</p>
                <p className="text-gray-500 text-xs">{file.size ? `${(file.size/1024/1024).toFixed(1)} MB` : ''}</p>
              </div>
              <div className="flex gap-2">
                {file.kind !== 'drive#folder' && (
                  <button
                    onClick={() => navigate(`/player/${file.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                  >
                    ▶ Reproduzir
                  </button>
                )}
                <button
                  onClick={() => deleteFile(file.id)}
                  className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded text-xs"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          {files.length === 0 && <p className="text-gray-500 text-sm">Nenhum arquivo encontrado.</p>}
        </div>
      )}
    </div>
  )
}

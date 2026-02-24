import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function formatSize(bytes) {
  if (!bytes) return ''
  const mb = bytes / 1024 / 1024
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

function FileIcon({ kind, name }) {
  if (kind === 'drive#folder') return <span className="text-yellow-400 text-lg">📁</span>
  const ext = name?.split('.').pop()?.toLowerCase()
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return <span className="text-blue-400 text-lg">🎬</span>
  if (['mp3', 'aac', 'flac'].includes(ext)) return <span className="text-green-400 text-lg">🎵</span>
  return <span className="text-gray-400 text-lg">📄</span>
}

export default function CloudPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [folderStack, setFolderStack] = useState([{ id: '', name: 'Início' }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const currentFolder = folderStack[folderStack.length - 1]

  const loadFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/api/pikpak/files?folder_id=${currentFolder.id}`)
      setFiles(data.files || [])
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao carregar arquivos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFiles() }, [currentFolder.id])

  const sendToCloud = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      const isMagnet = input.startsWith('magnet:')
      const endpoint = isMagnet ? '/api/pikpak/upload-magnet' : '/api/pikpak/upload-url'
      const body = isMagnet
        ? { magnet: input, folder_id: currentFolder.id }
        : { url: input, folder_id: currentFolder.id }
      await axios.post(endpoint, body)
      setInput('')
      setTimeout(loadFiles, 1500)
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  const openFolder = (file) => {
    setFolderStack(prev => [...prev, { id: file.id, name: file.name }])
  }

  const goToFolder = (idx) => {
    setFolderStack(prev => prev.slice(0, idx + 1))
  }

  const deleteFile = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Remover este item?')) return
    await axios.delete(`/api/pikpak/files/${id}`)
    loadFiles()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">☁️ Gerenciador de Nuvem</h1>
          <button onClick={loadFiles} className="text-gray-500 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-[#21262d] transition-colors">
            ↻ Atualizar
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
          {folderStack.map((f, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-600">/</span>}
              <button
                onClick={() => goToFolder(i)}
                className={i === folderStack.length - 1
                  ? 'text-white font-medium'
                  : 'text-blue-400 hover:text-blue-300 transition-colors'
                }
              >
                {f.name}
              </button>
            </span>
          ))}
        </div>

        {/* Input de envio */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendToCloud()}
            placeholder="Cole um link magnético ou URL de vídeo..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-blue-500 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-600 outline-none transition-colors"
          />
          <button
            onClick={sendToCloud}
            disabled={sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-[#21262d] disabled:text-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

        {error && (
          <div className="mt-3 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 text-sm">Carregando...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <span className="text-3xl mb-2">📭</span>
            <p className="text-gray-500 text-sm">Nenhum arquivo nesta pasta</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map(file => (
              <div
                key={file.id}
                onClick={() => file.kind === 'drive#folder' ? openFolder(file) : navigate(`/player/${file.id}`)}
                className="flex items-center gap-3 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#484f58] rounded-lg px-4 py-3 cursor-pointer group transition-all"
              >
                <FileIcon kind={file.kind} name={file.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.name}</p>
                  {file.size && (
                    <p className="text-gray-600 text-xs">{formatSize(parseInt(file.size))}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.kind !== 'drive#folder' && (
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/player/${file.id}`) }}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      ▶ Reproduzir
                    </button>
                  )}
                  <button
                    onClick={e => deleteFile(file.id, e)}
                    className="bg-red-900/50 hover:bg-red-800 text-red-300 px-3 py-1 rounded text-xs transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

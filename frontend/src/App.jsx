import { Routes, Route, NavLink } from 'react-router-dom'
import CloudPage from './pages/CloudPage'
import PlayerPage from './pages/PlayerPage'
import BrowserPage from './pages/BrowserPage'
import ScraperPage from './pages/ScraperPage'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <nav className="w-56 bg-[#161b22] border-r border-[#30363d] flex flex-col p-4 gap-2">
        <div className="text-lg font-bold text-white mb-6">🎬 PikPak Manager</div>
        <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'}`}>
          ☁️ Nuvem
        </NavLink>
        <NavLink to="/player" className={({isActive}) => `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'}`}>
          ▶️ Reprodutor
        </NavLink>
        <NavLink to="/browser" className={({isActive}) => `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'}`}>
          🌐 Navegador
        </NavLink>
        <NavLink to="/scraper" className={({isActive}) => `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#21262d]'}`}>
          🕷️ Raspador
        </NavLink>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0d1117]">
        <Routes>
          <Route path="/" element={<CloudPage />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/player/:fileId" element={<PlayerPage />} />
          <Route path="/browser" element={<BrowserPage />} />
          <Route path="/scraper" element={<ScraperPage />} />
        </Routes>
      </main>
    </div>
  )
}

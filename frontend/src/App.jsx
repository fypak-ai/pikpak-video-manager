import { Routes, Route, NavLink } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import CloudPage from './pages/CloudPage'
import PlayerPage from './pages/PlayerPage'
import BrowserPage from './pages/BrowserPage'
import ScraperPage from './pages/ScraperPage'
import LoginPage from './pages/LoginPage'

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:text-white hover:bg-[#21262d]'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export default function App() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1117]">
      {/* Sidebar */}
      <nav className="w-52 bg-[#161b22] border-r border-[#30363d] flex flex-col">
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <div>
              <p className="text-white text-sm font-bold leading-tight">PikPak</p>
              <p className="text-blue-400 text-xs">Manager</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <NavItem to="/" icon="☁️" label="Nuvem" end />
          <NavItem to="/player" icon="▶️" label="Reprodutor" />
          <NavItem to="/browser" icon="🌐" label="Navegador" />
          <NavItem to="/scraper" icon="🕷️" label="Raspador" />
        </div>

        {/* User info + logout */}
        <div className="px-3 pb-4 border-t border-[#30363d] pt-3">
          <div className="px-3 py-2 rounded-lg bg-[#0d1117] mb-2">
            <p className="text-gray-500 text-xs">Conectado como</p>
            <p className="text-white text-xs font-medium truncate">{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <span>⎋</span>
            <span>Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
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

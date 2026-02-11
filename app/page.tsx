'use client'
import { useState, useEffect, useCallback } from 'react'

// SVG Icons
const Icons = {
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  star: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  starOutline: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  clock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  trash: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  x: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  refresh: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  rust: <img src="https://files.facepunch.com/lewis/1b2911b1/rust-marque.svg" alt="Rust" className="w-10 h-10 invert" />,
  server: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  map: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  globe: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  chart: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  shield: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  ban: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  external: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
}

interface PlayerData {
  player: {
    steamid: string
    personaname: string
    avatarfull: string
    profileurl: string
    gameid?: string
    gameextrainfo?: string
    gameserverip?: string
  }
  server?: {
    name: string
    players: number
    maxPlayers: number
    map: string
    ip: string
    port: number
    rank?: number
    url?: string
  }
  stats?: {
    playtimeHours: number
    vacBans: number
    gameBans: number
    daysSinceLastBan?: number
  }
}

interface SavedPlayer {
  steamid: string
  name: string
  avatar: string
  url: string
}

export default function Home() {
  const [steamUrl, setSteamUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PlayerData | null>(null)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<SavedPlayer[]>([])
  const [favorites, setFavorites] = useState<SavedPlayer[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30)

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory')
    const savedFavorites = localStorage.getItem('favorites')
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
  }, [])

  const handleSearch = useCallback(async (url?: string) => {
    const searchUrl = url || steamUrl
    if (!searchUrl.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamUrl: searchUrl }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setData(result)

      const newPlayer: SavedPlayer = {
        steamid: result.player.steamid,
        name: result.player.personaname,
        avatar: result.player.avatarfull,
        url: searchUrl,
      }
      setHistory(prev => {
        const filtered = prev.filter(p => p.steamid !== newPlayer.steamid)
        const updated = [newPlayer, ...filtered].slice(0, 10)
        localStorage.setItem('searchHistory', JSON.stringify(updated))
        return updated
      })
    } catch (e: any) {
      setError(e.message || 'Ошибка при поиске')
    } finally {
      setLoading(false)
    }
  }, [steamUrl])

  useEffect(() => {
    if (!autoRefresh || !data) return
    const interval = setInterval(() => {
      handleSearch(data.player.profileurl)
    }, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, data, handleSearch])

  const toggleFavorite = (player: SavedPlayer) => {
    setFavorites(prev => {
      const exists = prev.some(p => p.steamid === player.steamid)
      const updated = exists ? prev.filter(p => p.steamid !== player.steamid) : [...prev, player]
      localStorage.setItem('favorites', JSON.stringify(updated))
      return updated
    })
  }

  const isFavorite = (steamid: string) => favorites.some(p => p.steamid === steamid)
  const clearHistory = () => { setHistory([]); localStorage.removeItem('searchHistory') }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            {Icons.rust}
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Rust Tracker
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Отслеживай игроков в реальном времени</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={steamUrl}
                onChange={(e) => setSteamUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Вставь ссылку на Steam профиль или Steam ID..."
                className="w-full px-5 py-4 bg-neutral-900 rounded-2xl border border-neutral-800 focus:border-neutral-600 focus:outline-none transition-all text-lg placeholder:text-neutral-500"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-8 py-4 bg-white hover:bg-gray-200 text-black rounded-2xl font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : Icons.search}
              <span className="hidden md:inline">Найти</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 mb-6 flex items-center gap-3">
            {Icons.ban}
            {error}
          </div>
        )}

        {/* Player Result */}
        {data && (
          <div className="space-y-6 mb-10">
            {/* Player Card */}
            <div className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur rounded-3xl border border-gray-700/50 shadow-xl">
              <div className="flex items-start gap-5">
                <img src={data.player.avatarfull} alt="" className="w-20 h-20 rounded-2xl shadow-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold truncate">{data.player.personaname}</h2>
                    <button
                      onClick={() => toggleFavorite({
                        steamid: data.player.steamid,
                        name: data.player.personaname,
                        avatar: data.player.avatarfull,
                        url: data.player.profileurl,
                      })}
                      className={`transition-all hover:scale-110 ${isFavorite(data.player.steamid) ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                    >
                      {isFavorite(data.player.steamid) ? Icons.star : Icons.starOutline}
                    </button>
                  </div>
                  <a href={data.player.profileurl} target="_blank" className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors">
                    Открыть Steam профиль {Icons.external}
                  </a>
                </div>
              </div>

              {/* Stats */}
              {data.stats && (
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-2xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        {Icons.clock}
                        <span>Часов в Rust</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{data.stats.playtimeHours}h</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-2xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        {Icons.shield}
                        <span>VAC баны</span>
                      </div>
                      <p className={`text-2xl font-bold ${data.stats.vacBans > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {data.stats.vacBans}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-2xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        {Icons.ban}
                        <span>Game баны</span>
                      </div>
                      <p className={`text-2xl font-bold ${data.stats.gameBans > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {data.stats.gameBans}
                      </p>
                    </div>
                    {data.stats.daysSinceLastBan !== undefined && (data.stats.vacBans > 0 || data.stats.gameBans > 0) && (
                      <div className="p-4 bg-gray-800/50 rounded-2xl">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                          {Icons.chart}
                          <span>Дней с бана</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">{data.stats.daysSinceLastBan}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Auto Refresh */}
              <div className="mt-6 pt-6 border-t border-gray-700/50 flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`relative w-12 h-6 rounded-full transition-colors ${autoRefresh ? 'bg-white' : 'bg-neutral-700'}`}>
                    <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="sr-only" />
                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${autoRefresh ? 'left-7 bg-black' : 'left-1 bg-neutral-400'}`} />
                  </div>
                  <span className="text-sm text-gray-300 flex items-center gap-2">
                    {Icons.refresh} Автообновление
                  </span>
                </label>
                {autoRefresh && (
                  <>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="bg-neutral-800 rounded-xl px-4 py-2 text-sm border border-neutral-700 focus:border-neutral-500 focus:outline-none"
                    >
                      <option value={10}>10 сек</option>
                      <option value={30}>30 сек</option>
                      <option value={60}>1 мин</option>
                      <option value={300}>5 мин</option>
                    </select>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Активно
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Server Status */}
            {data.player.gameid === '252490' ? (
              data.server ? (
                <div className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-3xl">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <span className="text-green-400 font-semibold text-lg">Сейчас играет в Rust</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                      {Icons.server}
                      <div>
                        <p className="text-xs text-gray-400">Сервер</p>
                        <p className="font-medium">{data.server.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                      {Icons.users}
                      <div>
                        <p className="text-xs text-gray-400">Игроки</p>
                        <p className="font-medium">{data.server.players}/{data.server.maxPlayers}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                      {Icons.map}
                      <div>
                        <p className="text-xs text-gray-400">Карта</p>
                        <p className="font-medium">{data.server.map}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                      {Icons.globe}
                      <div>
                        <p className="text-xs text-gray-400">IP адрес</p>
                        <p className="font-medium font-mono">{data.server.ip}:{data.server.port}</p>
                      </div>
                    </div>
                  </div>
                  {data.server.url && (
                    <a href={data.server.url} target="_blank" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 transition-colors">
                      Открыть на BattleMetrics {Icons.external}
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 rounded-3xl">
                  <p className="text-yellow-400 font-medium">Играет в Rust, но сервер скрыт или не найден</p>
                  {data.player.gameserverip && <p className="text-gray-400 mt-2 font-mono">IP: {data.player.gameserverip}</p>}
                </div>
              )
            ) : data.player.gameextrainfo ? (
              <div className="p-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30 rounded-3xl">
                <p className="text-blue-400 font-medium">Сейчас играет в: {data.player.gameextrainfo}</p>
              </div>
            ) : (
              <div className="p-6 bg-gray-800/50 border border-gray-700/50 rounded-3xl">
                <p className="text-gray-400">Не в игре</p>
              </div>
            )}
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
              {Icons.star} Избранные игроки
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map(player => (
                <div
                  key={player.steamid}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                  onClick={() => { setSteamUrl(player.url); handleSearch(player.url); }}
                >
                  <img src={player.avatar} alt="" className="w-12 h-12 rounded-xl" />
                  <span className="flex-1 font-medium truncate">{player.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(player); }}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {Icons.x}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-300">
                {Icons.clock} История поиска
              </h3>
              <button onClick={clearHistory} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-400 transition-colors">
                {Icons.trash} Очистить
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {history.map(player => (
                <div
                  key={player.steamid}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600 hover:bg-gray-800/50 cursor-pointer transition-all"
                  onClick={() => { setSteamUrl(player.url); handleSearch(player.url); }}
                >
                  <img src={player.avatar} alt="" className="w-10 h-10 rounded-lg" />
                  <span className="flex-1 truncate text-sm text-gray-300">{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

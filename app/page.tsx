'use client'
import { useState, useEffect, useCallback } from 'react'

interface PlayerData {
  player: {
    steamid: string
    personaname: string
    avatarfull: string
    profileurl: string
    gameid?: string
    gameextrainfo?: string
    gameserverip?: string
    timecreated?: number
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

  // Загрузка из localStorage
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

      // Добавляем в историю
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

  // Автообновление
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
      const updated = exists
        ? prev.filter(p => p.steamid !== player.steamid)
        : [...prev, player]
      localStorage.setItem('favorites', JSON.stringify(updated))
      return updated
    })
  }

  const isFavorite = (steamid: string) => favorites.some(p => p.steamid === steamid)

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('searchHistory')
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">🎮 Rust Player Tracker</h1>
        <p className="text-gray-400 text-center mb-6">Узнай на каком сервере играет человек</p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={steamUrl}
            onChange={(e) => setSteamUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Вставь ссылку на Steam профиль..."
            className="flex-1 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? '...' : 'Найти'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 mb-4">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4 mb-8">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center gap-4">
                <img src={data.player.avatarfull} alt="" className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{data.player.personaname}</h2>
                  <a href={data.player.profileurl} target="_blank" className="text-gray-400 text-sm hover:text-orange-400">
                    Открыть профиль Steam
                  </a>
                </div>
                <button
                  onClick={() => toggleFavorite({
                    steamid: data.player.steamid,
                    name: data.player.personaname,
                    avatar: data.player.avatarfull,
                    url: data.player.profileurl,
                  })}
                  className="text-2xl hover:scale-110 transition"
                >
                  {isFavorite(data.player.steamid) ? '⭐' : '☆'}
                </button>
              </div>

              {/* Статистика */}
              {data.stats && (
                <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Часов в Rust:</span>
                    <p className="text-lg font-semibold">{data.stats.playtimeHours}h</p>
                  </div>
                  <div>
                    <span className="text-gray-400">VAC баны:</span>
                    <p className={`text-lg font-semibold ${data.stats.vacBans > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {data.stats.vacBans}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Game баны:</span>
                    <p className={`text-lg font-semibold ${data.stats.gameBans > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {data.stats.gameBans}
                    </p>
                  </div>
                  {data.stats.daysSinceLastBan !== undefined && data.stats.daysSinceLastBan > 0 && (
                    <div>
                      <span className="text-gray-400">Дней с бана:</span>
                      <p className="text-lg font-semibold">{data.stats.daysSinceLastBan}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Автообновление */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm">Автообновление</span>
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="bg-gray-700 rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10 сек</option>
                    <option value={30}>30 сек</option>
                    <option value={60}>1 мин</option>
                    <option value={300}>5 мин</option>
                  </select>
                )}
                {autoRefresh && <span className="text-xs text-gray-500">Обновляется автоматически</span>}
              </div>
            </div>

            {data.player.gameid === '252490' ? (
              data.server ? (
                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 font-semibold">Сейчас играет в Rust</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><span className="text-gray-400">Сервер:</span> {data.server.name}</p>
                    <p><span className="text-gray-400">Игроки:</span> {data.server.players}/{data.server.maxPlayers}</p>
                    <p><span className="text-gray-400">Карта:</span> {data.server.map}</p>
                    <p><span className="text-gray-400">IP:</span> {data.server.ip}:{data.server.port}</p>
                    {data.server.rank && <p><span className="text-gray-400">Рейтинг:</span> #{data.server.rank}</p>}
                  </div>
                  {data.server.url && (
                    <a href={data.server.url} target="_blank" className="inline-block mt-3 text-orange-400 hover:text-orange-300">
                      Открыть на BattleMetrics →
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-yellow-400">Играет в Rust, но сервер скрыт или не найден</p>
                  {data.player.gameserverip && (
                    <p className="text-gray-400 mt-2">IP: {data.player.gameserverip}</p>
                  )}
                </div>
              )
            ) : data.player.gameextrainfo ? (
              <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                <p className="text-blue-400">Сейчас играет в: {data.player.gameextrainfo}</p>
              </div>
            ) : (
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-gray-400">Не в игре</p>
              </div>
            )}
          </div>
        )}

        {/* Избранное */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">⭐ Избранное</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {favorites.map(player => (
                <div
                  key={player.steamid}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 cursor-pointer transition"
                  onClick={() => { setSteamUrl(player.url); handleSearch(player.url); }}
                >
                  <img src={player.avatar} alt="" className="w-10 h-10 rounded" />
                  <span className="flex-1 truncate">{player.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(player); }}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* История */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">🕐 История поиска</h3>
              <button onClick={clearHistory} className="text-sm text-gray-500 hover:text-red-400">
                Очистить
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {history.map(player => (
                <div
                  key={player.steamid}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600 cursor-pointer transition"
                  onClick={() => { setSteamUrl(player.url); handleSearch(player.url); }}
                >
                  <img src={player.avatar} alt="" className="w-8 h-8 rounded" />
                  <span className="flex-1 truncate text-sm">{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

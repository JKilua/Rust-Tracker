'use client'
import { useState } from 'react'

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
}

export default function Home() {
  const [steamUrl, setSteamUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PlayerData | null>(null)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!steamUrl.trim()) return
    setLoading(true)
    setError('')
    setData(null)

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamUrl }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      setData(result)
    } catch (e: any) {
      setError(e.message || 'Ошибка при поиске')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">🎮 Rust Player Tracker</h1>
        <p className="text-gray-400 text-center mb-8">Узнай на каком сервере играет человек</p>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={steamUrl}
            onChange={(e) => setSteamUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Вставь ссылку на Steam профиль..."
            className="flex-1 px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
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
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center gap-4">
              <img src={data.player.avatarfull} alt="" className="w-16 h-16 rounded-lg" />
              <div>
                <h2 className="text-xl font-semibold">{data.player.personaname}</h2>
                <a href={data.player.profileurl} target="_blank" className="text-gray-400 text-sm hover:text-orange-400">
                  Открыть профиль Steam
                </a>
              </div>
            </div>

            {data.player.gameid === '252490' ? (
              data.server ? (
                <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400 font-semibold">Сейчас играет в Rust</span>
                  </div>
                  <div className="space-y-2">
                    <p><span className="text-gray-400">Сервер:</span> {data.server.name}</p>
                    <p><span className="text-gray-400">Игроки:</span> {data.server.players}/{data.server.maxPlayers}</p>
                    <p><span className="text-gray-400">Карта:</span> {data.server.map}</p>
                    <p><span className="text-gray-400">IP:</span> {data.server.ip}:{data.server.port}</p>
                    {data.server.rank && <p><span className="text-gray-400">Рейтинг:</span> #{data.server.rank}</p>}
                    {data.server.url && (
                      <a href={data.server.url} target="_blank" className="inline-block mt-2 text-orange-400 hover:text-orange-300">
                        Открыть на BattleMetrics →
                      </a>
                    )}
                  </div>
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
      </div>
    </main>
  )
}

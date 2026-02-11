import { NextRequest, NextResponse } from 'next/server'

const STEAM_API_KEY = process.env.STEAM_API_KEY

// Извлекаем Steam ID из разных форматов ссылок
async function resolveSteamId(input: string): Promise<string | null> {
  const trimmed = input.trim()
  
  // Уже Steam ID 64
  if (/^\d{17}$/.test(trimmed)) return trimmed
  
  // Ссылка на профиль
  const idMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/)
  if (idMatch) return idMatch[1]
  
  // Vanity URL (кастомный URL)
  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^\/\?]+)/)
  if (vanityMatch) {
    const vanity = vanityMatch[1]
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${vanity}`
    )
    const data = await res.json()
    if (data.response?.success === 1) return data.response.steamid
  }
  
  // Просто vanity name без полной ссылки
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    const res = await fetch(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${trimmed}`
    )
    const data = await res.json()
    if (data.response?.success === 1) return data.response.steamid
  }
  
  return null
}

// Получаем информацию об игроке
async function getPlayerInfo(steamId: string) {
  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`
  )
  const data = await res.json()
  return data.response?.players?.[0] || null
}

// Получаем статистику игрока (часы в Rust)
async function getPlayerStats(steamId: string) {
  try {
    // Получаем время в играх
    const gamesRes = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
    )
    const gamesData = await gamesRes.json()
    
    // Ищем Rust (appid: 252490)
    const rustGame = gamesData.response?.games?.find((g: any) => g.appid === 252490)
    const playtimeHours = rustGame ? Math.round(rustGame.playtime_forever / 60) : 0

    // Получаем баны
    const bansRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId}`
    )
    const bansData = await bansRes.json()
    const bans = bansData.players?.[0] || {}

    return {
      playtimeHours,
      vacBans: bans.NumberOfVACBans || 0,
      gameBans: bans.NumberOfGameBans || 0,
      daysSinceLastBan: bans.DaysSinceLastBan || 0,
    }
  } catch (e) {
    console.error('Stats error:', e)
    return null
  }
}

// Ищем сервер на BattleMetrics по IP
async function findServerOnBattleMetrics(ip: string, port: string) {
  try {
    // Сначала ищем точное совпадение по IP и порту
    const exactRes = await fetch(
      `https://api.battlemetrics.com/servers?filter[game]=rust&filter[ip]=${ip}&filter[port]=${port}`
    )
    const exactData = await exactRes.json()
    
    if (exactData.data?.length > 0) {
      const server = exactData.data[0]
      return {
        name: server.attributes.name,
        players: server.attributes.players,
        maxPlayers: server.attributes.maxPlayers,
        map: server.attributes.details?.map || 'Unknown',
        ip: server.attributes.ip,
        port: server.attributes.port,
        rank: server.attributes.rank,
        url: `https://www.battlemetrics.com/servers/rust/${server.id}`,
      }
    }

    // Поиск по IP:port в строке поиска
    const searchRes = await fetch(
      `https://api.battlemetrics.com/servers?filter[game]=rust&filter[search]=${ip}:${port}`
    )
    const searchData = await searchRes.json()
    
    if (searchData.data?.length > 0) {
      // Ищем сервер с точным совпадением порта
      const exactMatch = searchData.data.find((s: any) => 
        s.attributes.ip === ip && String(s.attributes.port) === port
      )
      const server = exactMatch || searchData.data[0]
      return {
        name: server.attributes.name,
        players: server.attributes.players,
        maxPlayers: server.attributes.maxPlayers,
        map: server.attributes.details?.map || 'Unknown',
        ip: server.attributes.ip,
        port: server.attributes.port,
        rank: server.attributes.rank,
        url: `https://www.battlemetrics.com/servers/rust/${server.id}`,
      }
    }
    
    // Альтернативный поиск только по IP
    const altRes = await fetch(
      `https://api.battlemetrics.com/servers?filter[game]=rust&filter[ip]=${ip}`
    )
    const altData = await altRes.json()
    
    if (altData.data?.length > 0) {
      // Пробуем найти с правильным портом
      const matchingPort = altData.data.find((s: any) => String(s.attributes.port) === port)
      const server = matchingPort || altData.data[0]
      return {
        name: server.attributes.name,
        players: server.attributes.players,
        maxPlayers: server.attributes.maxPlayers,
        map: server.attributes.details?.map || 'Unknown',
        ip: server.attributes.ip,
        port: server.attributes.port,
        rank: server.attributes.rank,
        url: `https://www.battlemetrics.com/servers/rust/${server.id}`,
      }
    }
  } catch (e) {
    console.error('BattleMetrics error:', e)
  }
  return null
}

export async function POST(req: NextRequest) {
  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: 'Steam API ключ не настроен' }, { status: 500 })
  }

  try {
    const { steamUrl } = await req.json()
    
    if (!steamUrl) {
      return NextResponse.json({ error: 'Введите ссылку на Steam профиль' }, { status: 400 })
    }

    const steamId = await resolveSteamId(steamUrl)
    if (!steamId) {
      return NextResponse.json({ error: 'Не удалось определить Steam ID' }, { status: 400 })
    }

    // Параллельно получаем данные
    const [player, stats] = await Promise.all([
      getPlayerInfo(steamId),
      getPlayerStats(steamId),
    ])

    if (!player) {
      return NextResponse.json({ error: 'Игрок не найден' }, { status: 404 })
    }

    let server = null
    
    // Если играет в Rust и есть IP сервера
    if (player.gameid === '252490' && player.gameserverip) {
      const [ip, port] = player.gameserverip.split(':')
      server = await findServerOnBattleMetrics(ip, port)
    }

    return NextResponse.json({ player, server, stats })
  } catch (e: any) {
    console.error('Track error:', e)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

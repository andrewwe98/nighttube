const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"

function parseDuration(value) {
  if (!value) {
    return "00:00"
  }

  const matches = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!matches) {
    return "00:00"
  }

  const hours = Number(matches[1] || 0)
  const minutes = Number(matches[2] || 0)
  const seconds = Number(matches[3] || 0)

  if (hours > 0) {
    return [hours, minutes.toString().padStart(2, "0"), seconds.toString().padStart(2, "0")].join(":")
  }

  return [minutes, seconds.toString().padStart(2, "0")].join(":")
}

function formatPublishedAt(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

async function youtubeFetch(path, searchParams) {
  const url = new URL(`${YOUTUBE_API_BASE_URL}/${path}`)
  url.search = new URLSearchParams({
    key: process.env.YOUTUBE_API_KEY,
    ...searchParams,
  }).toString()

  console.log('YouTube API URL:', url.toString())
  console.log('API Key present:', !!process.env.YOUTUBE_API_KEY)

  const response = await fetch(url)
  const data = await response.json()

  console.log('YouTube API response status:', response.status)
  console.log('YouTube API response:', JSON.stringify(data, null, 2))

  if (!response.ok) {
    throw new Error(data?.error?.message || "Unable to load YouTube videos.")
  }

  return data
}

function mapPopularItems(items) {
  return items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description || "Watch on YouTube.",
    published: formatPublishedAt(item.snippet.publishedAt),
    duration: parseDuration(item.contentDetails?.duration),
    views: Number(item.statistics?.viewCount || 0),
    category: "Trending",
  }))
}

function mapSearchItems(items, detailsById, query) {
  return items
    .filter((item) => item.id?.videoId)
    .map((item) => {
      const detail = detailsById.get(item.id.videoId)

      return {
        videoId: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        description: item.snippet.description || "Watch on YouTube.",
        published: formatPublishedAt(item.snippet.publishedAt),
        duration: parseDuration(detail?.contentDetails?.duration),
        views: Number(detail?.statistics?.viewCount || 0),
        category: query || "Search",
      }
    })
}

export async function getPopularVideos() {
  const data = await youtubeFetch("videos", {
    part: "snippet,contentDetails,statistics",
    chart: "mostPopular",
    maxResults: "12",
    regionCode: "US",
  })

  return mapPopularItems(data.items || [])
}

export async function searchVideos(query) {
  const trimmed = query.trim()

  if (!trimmed) {
    return getPopularVideos()
  }

  const searchData = await youtubeFetch("search", {
    part: "snippet",
    q: trimmed,
    maxResults: "12",
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "moderate",
  })

  const ids = (searchData.items || [])
    .map((item) => item.id?.videoId)
    .filter(Boolean)
    .join(",")

  if (!ids) {
    return []
  }

  const detailsData = await youtubeFetch("videos", {
    part: "contentDetails,statistics",
    id: ids,
  })

  const detailsById = new Map((detailsData.items || []).map((item) => [item.id, item]))
  return mapSearchItems(searchData.items || [], detailsById, trimmed)
}

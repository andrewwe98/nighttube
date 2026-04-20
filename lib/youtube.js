const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"

function getApiKey() {
  return process.env.YOUTUBE_API_KEY
}

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
  if (!value) {
    return "Recently"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))
}

function formatCategory(query) {
  if (!query) {
    return "Trending"
  }

  return query
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
}

async function youtubeFetch(path, searchParams) {
  const apiKey = getApiKey()

  if (!apiKey) {
    throw new Error("Add YOUTUBE_API_KEY to .env.local to load YouTube videos.")
  }

  const url = new URL(`${YOUTUBE_API_BASE_URL}/${path}`)
  url.search = new URLSearchParams({
    key: apiKey,
    ...searchParams,
  }).toString()

  const response = await fetch(url, {
    next: { revalidate: 300 },
  })

  const data = await response.json()

  if (!response.ok) {
    const message = data?.error?.message || "Unable to load YouTube videos."
    throw new Error(message)
  }

  return data
}

function mapSearchItems(items, detailsById, query) {
  return items
    .filter((item) => item.id?.videoId)
    .map((item) => {
      const videoId = item.id.videoId
      const detail = detailsById.get(videoId)

      return {
        videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        description: item.snippet.description || "Watch on YouTube.",
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
        published: formatPublishedAt(item.snippet.publishedAt),
        duration: parseDuration(detail?.contentDetails?.duration),
        views: Number(detail?.statistics?.viewCount || 0),
        category: formatCategory(query),
      }
    })
}

function mapPopularItems(items) {
  return items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description || "Watch on YouTube.",
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || "",
    published: formatPublishedAt(item.snippet.publishedAt),
    duration: parseDuration(item.contentDetails?.duration),
    views: Number(item.statistics?.viewCount || 0),
    category: "Trending",
  }))
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
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return getPopularVideos()
  }

  const searchData = await youtubeFetch("search", {
    part: "snippet",
    maxResults: "12",
    q: trimmedQuery,
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "moderate",
  })

  const videoIds = searchData.items
    ?.map((item) => item.id?.videoId)
    .filter(Boolean)
    .join(",")

  if (!videoIds) {
    return []
  }

  const detailsData = await youtubeFetch("videos", {
    part: "contentDetails,statistics",
    id: videoIds,
  })

  const detailsById = new Map(
    (detailsData.items || []).map((item) => [item.id, item]),
  )

  return mapSearchItems(searchData.items || [], detailsById, trimmedQuery)
}

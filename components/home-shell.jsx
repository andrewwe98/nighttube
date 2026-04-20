"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

const STORAGE_KEY = "nighttube-saved-videos"

function formatCount(count) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count || 0)
}

function AuthCard({
  mode,
  setMode,
  authForm,
  setAuthForm,
  authMessage,
  authLoading,
  googleEnabled,
  onSubmit,
}) {
  return (
    <aside className="glass-panel spotlight-card rounded-[2rem] p-6 sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Account Access</p>
          <h2 className="headline mt-2 text-2xl font-semibold text-white">
            {mode === "login" ? "Sign in to unlock YouTube search" : "Create your NightTube account"}
          </h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 p-1">
          {["login", "signup"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                mode === item
                  ? "bg-white text-slate-900"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <input
            required
            value={authForm.name}
            onChange={(event) =>
              setAuthForm((current) => ({ ...current, name: event.target.value }))
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
            placeholder="Display name"
          />
        ) : null}

        <input
          required
          type="email"
          value={authForm.email}
          onChange={(event) =>
            setAuthForm((current) => ({ ...current, email: event.target.value }))
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder="Email address"
        />

        <input
          required
          type="password"
          value={authForm.password}
          onChange={(event) =>
            setAuthForm((current) => ({ ...current, password: event.target.value }))
          }
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          placeholder="Password"
        />

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Working..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => signIn("google")}
        disabled={!googleEnabled}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {googleEnabled ? "Continue with Google" : "Add Google env vars to enable Google login"}
      </button>

      <p className="mt-4 text-sm text-slate-400">
        {authMessage || "After login you’ll see live YouTube results, search, embeds, and your saved list."}
      </p>
    </aside>
  )
}

function LoginShell(props) {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid w-full gap-6 lg:grid-cols-[1.25fr_0.85fr]">
          <div className="glass-panel spotlight-card rounded-[2.5rem] p-8 sm:p-10 lg:p-12">
            <div className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-200">
              Next.js • Tailwind • YouTube API
            </div>
            <p className="mt-8 text-sm uppercase tracking-[0.4em] text-slate-400">Members only</p>
            <h1 className="headline mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl">
              Log in first, then browse and search real YouTube videos in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              NightTube now gates the experience properly. Sign in to unlock live search results, trending videos, embedded playback, and your saved library.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Live results", "YouTube API feed"],
                ["Search flow", "Query videos instantly"],
                ["Saved library", "Keep picks per account"],
              ].map(([label, value]) => (
                <div key={label} className="glass-panel rounded-3xl px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <AuthCard {...props} />
        </section>
      </div>
    </main>
  )
}

function SearchBar({ query, setQuery, loading, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel rounded-[2rem] p-4 sm:flex sm:items-center sm:gap-3"
    >
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full bg-transparent px-3 py-3 text-base text-white outline-none placeholder:text-slate-500"
        placeholder="Search YouTube videos, channels, topics..."
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-3 w-full shrink-0 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  )
}

function VideoCard({ video, isSaved, onToggleSave }) {
  return (
    <article className="glass-panel spotlight-card rounded-[2rem] p-4">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/60">
        {video.videoId ? (
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="aspect-video w-full bg-slate-950" />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">
              {video.category}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {video.duration || "Live"}
            </span>
          </div>
          <h3 className="headline text-2xl font-semibold text-white">{video.title}</h3>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-slate-500">
            {video.channel}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            {video.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleSave(video)}
          className={`shrink-0 self-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
            isSaved
              ? "bg-sky-300 text-slate-950"
              : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
        <span>{formatCount(video.views)} views</span>
        <span>{video.published}</span>
      </div>
    </article>
  )
}

function SavedList({ videos }) {
  return (
    <div className="glass-panel rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-rose-300">Library</p>
          <h2 className="headline mt-2 text-2xl font-semibold text-white">Saved videos</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
          {videos.length}
        </span>
      </div>

      <div className="space-y-3">
        {videos.length ? (
          videos.map((video) => (
            <div
              key={video.videoId}
              className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{video.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{video.channel}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  {video.duration || "Video"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-8 text-center text-sm text-slate-400">
            Save videos from the search results and they will appear here.
          </div>
        )}
      </div>
    </div>
  )
}

export function HomeShell({ googleEnabled, initialSession, youtubeEnabled }) {
  const router = useRouter()
  const { data: clientSession } = useSession()
  const session = clientSession ?? initialSession

  const [mode, setMode] = useState("login")
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState("")
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [savedVideos, setSavedVideos] = useState([])
  const [videos, setVideos] = useState([])
  const [query, setQuery] = useState("")
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoMessage, setVideoMessage] = useState("")

  const isAuthed = Boolean(session?.user?.email)

  useEffect(() => {
    const localVideos = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]")
    setSavedVideos(localVideos)
  }, [])

  useEffect(() => {
    if (!isAuthed) {
      return
    }

    let cancelled = false

    async function hydrateSavedVideos() {
      try {
        const response = await fetch("/api/saved-videos", { cache: "no-store" })
        const data = await response.json()

        if (cancelled) {
          return
        }

        const localVideos = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]")
        const merged = [...data.savedVideos, ...localVideos].reduce((collection, current) => {
          if (!collection.find((item) => item.videoId === current.videoId)) {
            collection.push(current)
          }

          return collection
        }, [])

        setSavedVideos(merged)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))

        await fetch("/api/saved-videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ savedVideos: merged }),
        })
      } catch (error) {
        setAuthMessage(error.message || "Unable to load saved videos.")
      }
    }

    hydrateSavedVideos()

    return () => {
      cancelled = true
    }
  }, [isAuthed])

  useEffect(() => {
    if (!isAuthed) {
      return
    }

    let cancelled = false

    async function loadVideos() {
      setVideoLoading(true)
      setVideoMessage("")

      try {
        const response = await fetch("/api/youtube/search", { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message)
        }

        if (!cancelled) {
          setVideos(data.videos || [])
        }
      } catch (error) {
        if (!cancelled) {
          setVideoMessage(error.message || "Unable to load YouTube videos.")
        }
      } finally {
        if (!cancelled) {
          setVideoLoading(false)
        }
      }
    }

    loadVideos()

    return () => {
      cancelled = true
    }
  }, [isAuthed])

  async function syncVideos(nextVideos) {
    setSavedVideos(nextVideos)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVideos))

    if (!isAuthed) {
      return
    }

    await fetch("/api/saved-videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedVideos: nextVideos }),
    })
  }

  async function handleToggleSave(video) {
    const exists = savedVideos.some((item) => item.videoId === video.videoId)
    const nextVideos = exists
      ? savedVideos.filter((item) => item.videoId !== video.videoId)
      : [
          {
            videoId: video.videoId,
            title: video.title,
            channel: video.channel,
            duration: video.duration,
          },
          ...savedVideos,
        ]

    await syncVideos(nextVideos)
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthMessage("")

    try {
      if (mode === "signup") {
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authForm),
        })

        const registerData = await registerResponse.json()

        if (!registerResponse.ok) {
          throw new Error(registerData.message)
        }
      }

      const loginResponse = await signIn("credentials", {
        email: authForm.email,
        password: authForm.password,
        redirect: false,
      })

      if (loginResponse?.error) {
        throw new Error("Invalid email or password.")
      }

      setAuthMessage(mode === "signup" ? "Account created and signed in." : "Signed in successfully.")
      setAuthForm({ name: "", email: "", password: "" })
    } catch (error) {
      setAuthMessage(error.message || "Authentication failed.")
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSearchSubmit(event) {
    event.preventDefault()
    setVideoLoading(true)
    setVideoMessage("")

    try {
      const params = new URLSearchParams()

      if (query.trim()) {
        params.set("q", query.trim())
      }

      const response = await fetch(`/api/youtube/search?${params.toString()}`, {
        cache: "no-store",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setVideos(data.videos || [])
    } catch (error) {
      setVideoMessage(error.message || "Search failed.")
    } finally {
      setVideoLoading(false)
    }
  }

  async function handleLogout() {
    setAuthMessage("")
    setVideoMessage("")
    setQuery("")
    setVideos([])

    await signOut({
      redirect: false,
    })

    router.refresh()
  }

  const savedLookup = useMemo(
    () => new Set(savedVideos.map((video) => video.videoId)),
    [savedVideos],
  )

  if (!isAuthed) {
    return (
      <LoginShell
        mode={mode}
        setMode={setMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authMessage={authMessage}
        authLoading={authLoading}
        googleEnabled={googleEnabled}
        onSubmit={handleAuthSubmit}
      />
    )
  }

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="glass-panel spotlight-card rounded-[2.25rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-full border border-sky-300/20 bg-sky-300/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-200">
              YouTube Search • Authenticated Access
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                Welcome back
              </p>
              <h1 className="headline mt-4 max-w-3xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl">
                Search and watch YouTube videos after login.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Use the search bar to pull live YouTube results. Trending videos load first, and you can save anything you want to revisit later.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
                  Signed in as {session?.user?.name || session?.user?.email}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
                  {youtubeEnabled ? "YouTube API connected" : "Add YOUTUBE_API_KEY in .env.local"}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Search feed</p>
              <h2 className="headline mt-2 text-2xl font-semibold text-white">Find videos instantly</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Trending results load by default. Search uses the official YouTube Data API, then enriches results with video duration and view counts.
              </p>
              <div className="mt-6">
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  loading={videoLoading}
                  onSubmit={handleSearchSubmit}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.7fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="headline text-3xl font-semibold text-white">
                {query.trim() ? `Results for "${query.trim()}"` : "Trending now"}
              </h2>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {videos.length} videos
              </div>
            </div>

            {videoMessage ? (
              <div className="glass-panel rounded-[2rem] px-5 py-8 text-sm text-slate-300">
                {videoMessage}
              </div>
            ) : null}

            {!videoMessage && !videos.length && !videoLoading ? (
              <div className="glass-panel rounded-[2rem] px-5 py-8 text-sm text-slate-300">
                No videos found yet.
              </div>
            ) : null}

            <div className="grid gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  isSaved={savedLookup.has(video.videoId)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </div>

          <SavedList videos={savedVideos} />
        </section>
      </div>
    </main>
  )
}

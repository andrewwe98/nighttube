"use client"

import { useEffect, useState } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
const FALLBACK_API_URL = "https://nighttube-backend.onrender.com"

export function useApiFallback() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL)
  const [isApiDown, setIsApiDown] = useState(false)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function testApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          mode: 'cors',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Primary API not responding')
        }

        if (!cancelled) {
          setApiUrl(API_BASE_URL)
          setIsApiDown(false)
        }
      } catch (primaryError) {
        console.warn('Primary API failed:', primaryError.message)

        try {
          const fallbackResponse = await fetch(`${FALLBACK_API_URL}/api/health`, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
          })

          if (!fallbackResponse.ok) {
            throw new Error('Fallback API not responding')
          }

          if (!cancelled) {
            setApiUrl(FALLBACK_API_URL)
            setIsApiDown(false)
          }
        } catch (fallbackError) {
          console.warn('Fallback API failed:', fallbackError.message)
          if (!cancelled) {
            setIsApiDown(true)
          }
        }
      }
    }

    testApi()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  return { apiUrl, isApiDown }
}

export async function apiFetch(path, options = {}, token = "", customBaseUrl = null) {
  const baseUrl = customBaseUrl || API_BASE_URL
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Request failed.")
    }

    return data
  } catch (error) {
    // Fallback to secondary API if primary fails
    if (baseUrl === API_BASE_URL && !customBaseUrl) {
      console.warn('Primary API failed, trying fallback:', error.message)
      return apiFetch(path, options, token, FALLBACK_API_URL)
    }
    throw error
  }
}

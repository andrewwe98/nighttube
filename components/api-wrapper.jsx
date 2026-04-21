"use client"

import { useEffect, useState } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
const FALLBACK_API_URL = "https://nighttube-api.onrender.com"

export function useApiFallback() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL)
  const [isApiDown, setIsApiDown] = useState(false)

  useEffect(() => {
    // Test if the primary API is working
    async function testApi() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`, {
          method: 'GET',
          mode: 'cors',
          timeout: 5000
        })
        if (!response.ok) throw new Error('API not responding')
        setIsApiDown(false)
      } catch (error) {
        console.warn('Primary API failed, falling back:', error.message)
        setApiUrl(FALLBACK_API_URL)
        setIsApiDown(true)
      }
    }

    testApi()
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

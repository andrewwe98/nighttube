"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://nighttube-api.onrender.com"

export function useApiFallback() {
  const isApiDown = false
  return { apiUrl: API_BASE_URL, isApiDown }
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

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Request failed.")
  }

  return data
}

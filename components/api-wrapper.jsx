"use client"

import { useEffect, useState } from "react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"

export function useApiFallback() {
  const [apiUrl, setApiUrl] = useState(API_BASE_URL)
  const [isApiDown, setIsApiDown] = useState(false)

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
    throw error
  }
}

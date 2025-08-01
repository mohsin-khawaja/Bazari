"use client"

import { useState, useEffect, useCallback } from "react"

interface OfflineStorageOptions {
  key: string
  syncOnReconnect?: boolean
}

export function useOfflineStorage<T>({ key, syncOnReconnect = true }: OfflineStorageOptions) {
  const [data, setData] = useState<T | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState<T[]>([])

  // Initialize data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setData(JSON.parse(stored))
      }

      const pending = localStorage.getItem(`${key}_pending`)
      if (pending) {
        setPendingSync(JSON.parse(pending))
      }
    } catch (error) {
      console.error("Error loading offline data:", error)
    }
  }, [key])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Sync pending data when coming back online
  useEffect(() => {
    if (isOnline && syncOnReconnect && pendingSync.length > 0) {
      // Trigger sync of pending data
      syncPendingData()
    }
  }, [isOnline, syncOnReconnect, pendingSync.length])

  const saveData = useCallback(
    (newData: T) => {
      setData(newData)
      try {
        localStorage.setItem(key, JSON.stringify(newData))
      } catch (error) {
        console.error("Error saving offline data:", error)
      }
    },
    [key],
  )

  const addToPendingSync = useCallback(
    (item: T) => {
      const newPending = [...pendingSync, item]
      setPendingSync(newPending)
      try {
        localStorage.setItem(`${key}_pending`, JSON.stringify(newPending))
      } catch (error) {
        console.error("Error saving pending sync data:", error)
      }
    },
    [key, pendingSync],
  )

  const syncPendingData = useCallback(async () => {
    if (pendingSync.length === 0) return

    try {
      // Here you would implement your sync logic
      // For example, sending pending data to your API
      console.log("Syncing pending data:", pendingSync)

      // Clear pending data after successful sync
      setPendingSync([])
      localStorage.removeItem(`${key}_pending`)
    } catch (error) {
      console.error("Error syncing pending data:", error)
    }
  }, [key, pendingSync])

  const clearData = useCallback(() => {
    setData(null)
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error clearing offline data:", error)
    }
  }, [key])

  return {
    data,
    saveData,
    clearData,
    addToPendingSync,
    syncPendingData,
    pendingSync,
    isOnline,
  }
}

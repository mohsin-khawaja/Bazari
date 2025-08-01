"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  if (!showOfflineMessage) return null

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:top-4 md:left-auto md:right-4 md:w-96">
      <Alert className={isOnline ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
            <AlertDescription className="mb-0">
              {isOnline
                ? "Connection restored! You're back online."
                : "You're offline. Some features may not work properly."}
            </AlertDescription>
          </div>

          {!isOnline && (
            <Button size="sm" variant="outline" onClick={handleRetry} className="ml-2 bg-transparent">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </Alert>
    </div>
  )
}

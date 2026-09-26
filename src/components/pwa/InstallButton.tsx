'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InstallButton({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
    }
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null)
  }

  if (!isInstallable) return null

  return (
    <button
      onClick={handleInstallClick}
      className={cn("flex items-center gap-2 px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200", className)}
    >
      <Download className="w-4 h-4 flex-shrink-0" />
      Install App
    </button>
  )
}

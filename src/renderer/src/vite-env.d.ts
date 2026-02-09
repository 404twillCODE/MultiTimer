/// <reference types="vite/client" />

interface ElectronAPI {
  minimize: () => void
  close: () => void
  showNotification: (title: string, body: string) => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}

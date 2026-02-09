import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('notification', { title, body }),
})

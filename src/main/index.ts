import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const iconPath = join(__dirname, '../../icon.png')
  mainWindow = new BrowserWindow({
    width: 680,
    height: 900,
    minWidth: 380,
    minHeight: 520,
    backgroundColor: '#0c0c0e',
    frame: false,
    titleBarStyle: 'hidden',
    transparent: false,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  nativeTheme.themeSource = 'dark'
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('notification', (_event, { title, body }: { title: string; body: string }) => {
  const { Notification } = require('electron')
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
})

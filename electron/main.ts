// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
import type { BrowserWindow as BrowserWindowType, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindowType | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // In development, load from Vite dev server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow!.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow!.webContents.openDevTools()
  } else {
    // In production, load the built files
    mainWindow!.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers for file operations
ipcMain.handle('file:save', async (_event: IpcMainInvokeEvent, data: string, filePath?: string) => {
  try {
    let savePath: string | undefined = filePath
    
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: 'Save Project',
        defaultPath: 'quest-project.json',
        filters: [
          { name: 'Quest Project', extensions: ['json'] }
        ]
      })
      
      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true }
      }
      savePath = result.filePath
    }
    
    fs.writeFileSync(savePath!, data, 'utf-8')
    return { success: true, filePath: savePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:load', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title: 'Open Project',
      filters: [
        { name: 'Quest Project', extensions: ['json'] }
      ],
      properties: ['openFile']
    })
    
    if (result.canceled || !result.filePaths[0]) {
      return { success: false, canceled: true }
    }
    
    const content = fs.readFileSync(result.filePaths[0], 'utf-8')
    return { success: true, data: content, filePath: result.filePaths[0] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

// Load a file directly from a path (for recent projects)
ipcMain.handle('file:loadFromPath', async (_event: IpcMainInvokeEvent, filePath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' }
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, data: content, filePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('file:export', async (_event: IpcMainInvokeEvent, data: string, defaultName: string) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      title: 'Export Quest',
      defaultPath: defaultName || 'quest-export.json',
      filters: [
        { name: 'JSON', extensions: ['json'] }
      ]
    })
    
    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true }
    }
    
    fs.writeFileSync(result.filePath, data, 'utf-8')
    return { success: true, filePath: result.filePath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
})


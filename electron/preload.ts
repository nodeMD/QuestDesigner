// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data: string, filePath?: string) => 
    ipcRenderer.invoke('file:save', data, filePath),
  loadFile: () => 
    ipcRenderer.invoke('file:load'),
  loadFromPath: (filePath: string) => 
    ipcRenderer.invoke('file:loadFromPath', filePath),
  exportFile: (data: string, defaultName: string) => 
    ipcRenderer.invoke('file:export', data, defaultName),
  
  // Platform info
  platform: process.platform,
})


export {}

declare global {
  interface Window {
    electronAPI?: {
      saveFile: (
        data: string,
        filePath?: string
      ) => Promise<{
        success: boolean
        filePath?: string
        canceled?: boolean
        error?: string
      }>
      loadFile: () => Promise<{
        success: boolean
        data?: string
        filePath?: string
        canceled?: boolean
        error?: string
      }>
      loadFromPath: (filePath: string) => Promise<{
        success: boolean
        data?: string
        filePath?: string
        error?: string
      }>
      exportFile: (
        data: string,
        defaultName: string
      ) => Promise<{
        success: boolean
        filePath?: string
        canceled?: boolean
        error?: string
      }>
      platform: NodeJS.Platform
    }
  }
}

import { useEffect, useRef } from 'react'
import { useProjectStore } from '@/stores/projectStore'

const AUTO_SAVE_DELAY = 2000 // 2 seconds

export function useAutoSave() {
  const { project, filePath, isDirty, setDirty } = useProjectStore()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only auto-save if enabled in settings, we have a file path, and there are unsaved changes
    if (!project || !project.settings.autoSave || !filePath || !isDirty) return

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set a new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      if (!window.electronAPI) return

      try {
        const data = JSON.stringify(project, null, 2)
        const result = await window.electronAPI.saveFile(data, filePath)
        if (result.success) {
          setDirty(false)
          console.log('Auto-saved project')
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, AUTO_SAVE_DELAY)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [project, filePath, isDirty, setDirty])
}


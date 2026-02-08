import { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { exportProject, toJsonString, downloadJson } from '@/utils/export'
import { validateQuest } from '@/utils/validation'

export function useKeyboardShortcuts() {
  const { 
    project, 
    selectedNodeId, 
    deleteNode, 
    filePath, 
    setFilePath, 
    setDirty,
    getCurrentQuest 
  } = useProjectStore()
  const { 
    openDeleteModal, 
    setValidationPanelOpen,
    setValidating 
  } = useUIStore()

  const handleSave = useCallback(async () => {
    if (!project) return

    const data = JSON.stringify(project, null, 2)
    
    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(data, filePath || undefined)
      if (result.success && result.filePath) {
        setFilePath(result.filePath)
        setDirty(false)
      }
    } else {
      downloadJson(data, `${project.name}.json`)
      setDirty(false)
    }
  }, [project, filePath, setFilePath, setDirty])

  const handleExport = useCallback(async () => {
    if (!project) return

    const exportData = exportProject(project)
    const jsonString = toJsonString(exportData)
    const filename = `${project.name.replace(/\s+/g, '-').toLowerCase()}-export.json`

    if (window.electronAPI) {
      await window.electronAPI.exportFile(jsonString, filename)
    } else {
      downloadJson(jsonString, filename)
    }
  }, [project])

  const handleValidate = useCallback(() => {
    const currentQuest = getCurrentQuest()
    if (!currentQuest) return
    
    setValidating(true)
    setTimeout(() => {
      validateQuest(currentQuest)
      setValidating(false)
      setValidationPanelOpen(true)
    }, 200)
  }, [getCurrentQuest, setValidating, setValidationPanelOpen])

  const handleDelete = useCallback(() => {
    if (selectedNodeId) {
      openDeleteModal('node', selectedNodeId)
    }
  }, [selectedNodeId, openDeleteModal])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + S: Save
      if (isMod && e.key === 's') {
        e.preventDefault()
        handleSave()
        return
      }

      // Cmd/Ctrl + E: Export
      if (isMod && e.key === 'e') {
        e.preventDefault()
        handleExport()
        return
      }

      // Cmd/Ctrl + T: Validate/Test
      if (isMod && e.key === 't') {
        e.preventDefault()
        handleValidate()
        return
      }

      // Delete/Backspace: Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Don't trigger if user is typing in an input
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return
        }
        e.preventDefault()
        handleDelete()
        return
      }

      // Escape: Close panels
      if (e.key === 'Escape') {
        setValidationPanelOpen(false)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSave, handleExport, handleValidate, handleDelete, selectedNodeId, setValidationPanelOpen])
}


import { useEffect, useCallback } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { exportProject, toJsonString, downloadJson } from '@/utils/export'
import { validateQuest } from '@/utils/validation'

export function useKeyboardShortcuts() {
  const { 
    project, 
    selectedNodeId, 
    filePath, 
    setFilePath, 
    setDirty,
    getCurrentQuest,
    copyNode,
    pasteNode,
    getNode
  } = useProjectStore()
  const { 
    openDeleteModal, 
    setValidationPanelOpen,
    setValidating,
    openSearch,
    isSearchOpen,
    closeSearch
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


  const handleCopy = useCallback(() => {
    if (selectedNodeId) {
      copyNode(selectedNodeId)
    }
  }, [selectedNodeId, copyNode])

  const handlePaste = useCallback(() => {
    // Paste at a slight offset from the original position
    const node = selectedNodeId ? getNode(selectedNodeId) : null
    const position = node 
      ? { x: node.position.x + 50, y: node.position.y + 50 }
      : { x: 100, y: 100 }
    pasteNode(position)
  }, [selectedNodeId, getNode, pasteNode])

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

      // Cmd/Ctrl + F: Search
      if (isMod && e.key === 'f') {
        e.preventDefault()
        if (isSearchOpen) {
          closeSearch()
        } else {
          openSearch()
        }
        return
      }

      // Cmd/Ctrl + C: Copy
      if (isMod && e.key === 'c') {
        // Don't prevent default if user is selecting text
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return
        }
        e.preventDefault()
        handleCopy()
        return
      }

      // Cmd/Ctrl + V: Paste
      if (isMod && e.key === 'v') {
        // Don't prevent default if user is pasting text
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA'
        ) {
          return
        }
        e.preventDefault()
        handlePaste()
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
  }, [handleSave, handleExport, handleValidate, handleDelete, handleCopy, handlePaste, selectedNodeId, setValidationPanelOpen, openSearch, closeSearch, isSearchOpen])
}


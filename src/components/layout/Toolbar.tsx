import { useState } from 'react'
import {
  Save,
  Download,
  Upload,
  FlaskConical,
  Check,
  AlertTriangle,
  Loader2,
  RefreshCw,
  LayoutGrid,
  Search,
  Play,
} from 'lucide-react'
import { useReactFlow } from '@xyflow/react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import {
  exportQuest,
  exportProject,
  toJsonString,
  downloadJson,
  parseImportedQuest,
} from '@/utils/export'
import { validateQuest } from '@/utils/validation'
import { autoLayoutQuest } from '@/utils/autoLayout'
import type { MeasuredNodeDimensions } from '@/utils/autoLayout'

const RECENT_PROJECT_KEY = 'quest-designer-recent-project'

function saveRecentProject(path: string, name: string) {
  try {
    localStorage.setItem(
      RECENT_PROJECT_KEY,
      JSON.stringify({
        path,
        name,
        lastOpened: new Date().toISOString(),
      })
    )
  } catch {
    // Ignore storage errors
  }
}

export function Toolbar() {
  const {
    project,
    filePath,
    isDirty,
    setFilePath,
    setDirty,
    getCurrentQuest,
    toggleAutoSave,
    applyAutoLayout,
    importQuest,
  } = useProjectStore()
  const { setValidating, setValidationPanelOpen, openSearch, startSimulation } = useUIStore()

  const reactFlowInstance = useReactFlow()
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null)

  const currentQuest = getCurrentQuest()

  const handleSave = async () => {
    if (!project) return
    setIsSaving(true)

    try {
      const data = JSON.stringify(project, null, 2)

      if (window.electronAPI) {
        const result = await window.electronAPI.saveFile(data, filePath || undefined)
        if (result.success && result.filePath) {
          setFilePath(result.filePath)
          setDirty(false)
          // Save to recent projects
          saveRecentProject(result.filePath, project.name)
        }
      } else {
        // Browser fallback
        downloadJson(data, `${project.name}.json`)
        setDirty(false)
      }
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportQuest = async () => {
    if (!currentQuest) return

    const exportData = exportQuest(currentQuest)
    const jsonString = toJsonString(exportData)
    const filename = `${currentQuest.name.replace(/\s+/g, '-').toLowerCase()}-quest.json`

    if (window.electronAPI) {
      await window.electronAPI.exportFile(jsonString, filename)
    } else {
      downloadJson(jsonString, filename)
    }
  }

  const handleExportProject = async () => {
    if (!project) return

    const exportData = exportProject(project)
    const jsonString = toJsonString(exportData)
    const filename = `${project.name.replace(/\s+/g, '-').toLowerCase()}-project.json`

    if (window.electronAPI) {
      await window.electronAPI.exportFile(jsonString, filename)
    } else {
      downloadJson(jsonString, filename)
    }
  }

  const handleValidate = () => {
    if (!currentQuest) return

    setValidating(true)

    // Small delay for UX
    setTimeout(() => {
      const issues = validateQuest(currentQuest)
      const hasErrors = issues.some((i) => i.severity === 'error')

      setValidationResult(hasErrors ? 'invalid' : 'valid')
      setValidating(false)
      setValidationPanelOpen(true)

      // Clear result after 3 seconds
      setTimeout(() => setValidationResult(null), 3000)
    }, 300)
  }

  const handleAutoLayout = () => {
    if (!currentQuest || currentQuest.nodes.length === 0) return

    // Read actual DOM-measured node dimensions from React Flow
    const measuredDimensions = new Map<string, MeasuredNodeDimensions>()
    const flowNodes = reactFlowInstance.getNodes()
    for (const flowNode of flowNodes) {
      const w = flowNode.measured?.width ?? flowNode.width
      const h = flowNode.measured?.height ?? flowNode.height
      if (w != null && h != null) {
        measuredDimensions.set(flowNode.id, { width: w, height: h })
      }
    }

    const positions = autoLayoutQuest(currentQuest, measuredDimensions)
    applyAutoLayout(positions)
  }

  const handlePreview = () => {
    if (!currentQuest || currentQuest.nodes.length === 0) return

    // Find the START node
    const startNode = currentQuest.nodes.find((n) => n.type === 'START')
    if (startNode) {
      startSimulation(startNode.id)
    } else if (currentQuest.nodes.length > 0) {
      // If no START node, use the first node
      startSimulation(currentQuest.nodes[0].id)
    }
  }

  const handleImportQuest = async () => {
    if (!window.electronAPI) {
      // Browser fallback - use file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const text = await file.text()
        const quest = parseImportedQuest(text)
        if (quest) {
          importQuest(quest)
        } else {
          console.error('Failed to parse imported quest')
        }
      }
      input.click()
      return
    }

    try {
      const result = await window.electronAPI.loadFile()
      if (result.success && result.data) {
        const quest = parseImportedQuest(result.data)
        if (quest) {
          importQuest(quest)
        } else {
          console.error('Failed to parse imported quest')
        }
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  const [exportOpen, setExportOpen] = useState(false)

  if (!project) return null

  const isMac = window.electronAPI?.platform === 'darwin'

  return (
    <div className="h-10 bg-sidebar-bg border-b border-sidebar-border flex items-center gap-1 app-drag-region">
      {/* macOS traffic light spacer + drag region */}
      {isMac && <div className="w-[70px] flex-shrink-0" />}

      {/* Non-draggable toolbar content */}
      <div className="flex items-center gap-1 px-2 app-no-drag">
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary 
                   hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors
                   disabled:opacity-50"
          title="Save Project (⌘S)"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">Save</span>
          {isDirty && <span className="w-1.5 h-1.5 bg-node-event rounded-full" />}
        </button>

        {/* Auto-save toggle */}
        <button
          onClick={toggleAutoSave}
          className={`flex items-center gap-1.5 px-2 py-1.5 text-sm rounded transition-colors
                   ${
                     project.settings.autoSave
                       ? 'text-node-start bg-node-start/10'
                       : 'text-text-muted hover:text-text-secondary hover:bg-sidebar-hover'
                   }`}
          title={
            project.settings.autoSave
              ? 'Auto-save ON (click to disable)'
              : 'Auto-save OFF (click to enable)'
          }
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${project.settings.autoSave ? 'animate-spin-slow' : ''}`}
          />
          <span className="hidden lg:inline text-xs">Auto Save</span>
        </button>

        <div className="w-px h-5 bg-panel-border mx-1" />

        {/* Import */}
        <button
          onClick={handleImportQuest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary 
                   hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors"
          title="Import Quest from JSON"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Export dropdown - click based */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            onBlur={() => setTimeout(() => setExportOpen(false), 150)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors rounded
                     ${
                       exportOpen
                         ? 'text-text-primary bg-sidebar-hover'
                         : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'
                     }`}
            title="Export"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {exportOpen && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <div className="bg-panel-bg border border-panel-border rounded-lg shadow-panel py-1 min-w-40">
                <button
                  onClick={() => {
                    handleExportQuest()
                    setExportOpen(false)
                  }}
                  disabled={!currentQuest}
                  className="w-full px-3 py-2 text-sm text-left text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary disabled:opacity-50"
                >
                  Export Current Quest
                </button>
                <button
                  onClick={() => {
                    handleExportProject()
                    setExportOpen(false)
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary"
                >
                  Export Entire Project
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-panel-border mx-1" />

        {/* Validate */}
        <button
          onClick={handleValidate}
          disabled={!currentQuest}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors
                   disabled:opacity-50 ${
                     validationResult === 'valid'
                       ? 'text-node-start bg-node-start/10'
                       : validationResult === 'invalid'
                         ? 'text-validation-error bg-validation-error/10'
                         : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'
                   }`}
          title="Validate Quest (⌘T)"
        >
          {validationResult === 'valid' ? (
            <Check className="w-4 h-4" />
          ) : validationResult === 'invalid' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <FlaskConical className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {validationResult === 'valid'
              ? 'Valid!'
              : validationResult === 'invalid'
                ? 'Issues Found'
                : 'Validate'}
          </span>
        </button>

        <div className="w-px h-5 bg-panel-border mx-1" />

        {/* Auto-layout */}
        <button
          onClick={handleAutoLayout}
          disabled={!currentQuest || currentQuest.nodes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary 
                   hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors
                   disabled:opacity-50"
          title="Auto-arrange nodes"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="hidden sm:inline">Auto Layout</span>
        </button>

        <div className="w-px h-5 bg-panel-border mx-1" />

        {/* Search */}
        <button
          onClick={openSearch}
          disabled={!currentQuest}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary 
                   hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors
                   disabled:opacity-50"
          title="Search nodes (⌘F)"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>

        <div className="w-px h-5 bg-panel-border mx-1" />

        {/* Preview/Simulate */}
        <button
          onClick={handlePreview}
          disabled={!currentQuest || currentQuest.nodes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary 
                   hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors
                   disabled:opacity-50"
          title="Preview quest"
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Preview</span>
        </button>
      </div>

      {/* Spacer - draggable area */}
      <div className="flex-1" />

      {/* Project name */}
      <div className="text-sm text-text-muted px-2 app-no-drag">
        {project.name}
        {currentQuest && <span className="text-text-secondary"> / {currentQuest.name}</span>}
      </div>
    </div>
  )
}

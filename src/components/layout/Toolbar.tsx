import { useState } from 'react'
import { 
  Save, 
  Download, 
  FlaskConical, 
  Check,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { exportQuest, exportProject, toJsonString, downloadJson } from '@/utils/export'
import { validateQuest } from '@/utils/validation'

const RECENT_PROJECT_KEY = 'quest-designer-recent-project'

function saveRecentProject(path: string, name: string) {
  try {
    localStorage.setItem(RECENT_PROJECT_KEY, JSON.stringify({
      path,
      name,
      lastOpened: new Date().toISOString(),
    }))
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
    getCurrentQuest 
  } = useProjectStore()
  const { setValidating, setValidationPanelOpen } = useUIStore()
  
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
    const filename = `${currentQuest.name.replace(/\s+/g, '-').toLowerCase()}-export.json`

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
      const hasErrors = issues.some(i => i.severity === 'error')
      
      setValidationResult(hasErrors ? 'invalid' : 'valid')
      setValidating(false)
      setValidationPanelOpen(true)
      
      // Clear result after 3 seconds
      setTimeout(() => setValidationResult(null), 3000)
    }, 300)
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
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Save</span>
        {isDirty && <span className="w-1.5 h-1.5 bg-node-event rounded-full" />}
      </button>

      <div className="w-px h-5 bg-panel-border mx-1" />

      {/* Export dropdown - click based */}
      <div className="relative">
        <button
          onClick={() => setExportOpen(!exportOpen)}
          onBlur={() => setTimeout(() => setExportOpen(false), 150)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors rounded
                     ${exportOpen 
                       ? 'text-text-primary bg-sidebar-hover' 
                       : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'}`}
          title="Export"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
        {exportOpen && (
          <div className="absolute top-full left-0 mt-1 z-50">
            <div className="bg-panel-bg border border-panel-border rounded-lg shadow-panel py-1 min-w-40">
              <button
                onClick={() => { handleExportQuest(); setExportOpen(false); }}
                disabled={!currentQuest}
                className="w-full px-3 py-2 text-sm text-left text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary disabled:opacity-50"
              >
                Export Current Quest
              </button>
              <button
                onClick={() => { handleExportProject(); setExportOpen(false); }}
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
      </div>

      {/* Spacer - draggable area */}
      <div className="flex-1" />

      {/* Project name */}
      <div className="text-sm text-text-muted px-2 app-no-drag">
        {project.name}
        {currentQuest && (
          <span className="text-text-secondary"> / {currentQuest.name}</span>
        )}
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Sparkles, X, Clock } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

const RECENT_PROJECT_KEY = 'quest-designer-recent-project'

interface RecentProject {
  path: string
  name: string
  lastOpened: string
}

function getRecentProject(): RecentProject | null {
  try {
    const stored = localStorage.getItem(RECENT_PROJECT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

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

function parseProjectData(data: string) {
  const project = JSON.parse(data)
  // Convert date strings back to Date objects
  project.createdAt = new Date(project.createdAt)
  project.updatedAt = new Date(project.updatedAt)
  project.quests = project.quests.map((q: any) => ({
    ...q,
    createdAt: new Date(q.createdAt),
    updatedAt: new Date(q.updatedAt),
  }))
  project.events = project.events.map((e: any) => ({
    ...e,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt),
  }))
  return project
}

export function WelcomeScreen() {
  const { createProject, setProject, setFilePath } = useProjectStore()
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [recentProject, setRecentProject] = useState<RecentProject | null>(null)

  useEffect(() => {
    setRecentProject(getRecentProject())
  }, [])

  const handleNewProject = () => {
    setShowNameDialog(true)
    setProjectName('')
  }

  const handleCreateProject = () => {
    const name = projectName.trim() || 'Untitled Project'
    createProject(name)
    setShowNameDialog(false)
  }

  const handleOpenProject = async () => {
    if (!window.electronAPI) {
      // Fallback for browser dev
      setShowNameDialog(true)
      setProjectName('')
      return
    }

    const result = await window.electronAPI.loadFile()
    if (result.success && result.data && result.filePath) {
      try {
        const project = parseProjectData(result.data)
        setProject(project)
        setFilePath(result.filePath)
        saveRecentProject(result.filePath, project.name)
      } catch (e) {
        console.error('Failed to parse project file:', e)
      }
    }
  }

  const handleOpenRecent = async () => {
    if (!window.electronAPI || !recentProject) return

    try {
      // Load file directly from the stored path
      const result = await window.electronAPI.loadFromPath(recentProject.path)
      if (result.success && result.data && result.filePath) {
        const project = parseProjectData(result.data)
        setProject(project)
        setFilePath(result.filePath)
        saveRecentProject(result.filePath, project.name)
      } else if (result.error) {
        // File not found or other error - clear the recent project
        console.error('Failed to open recent project:', result.error)
        localStorage.removeItem(RECENT_PROJECT_KEY)
        setRecentProject(null)
      }
    } catch (e) {
      console.error('Failed to open recent project:', e)
    }
  }

  const isMac = window.electronAPI?.platform === 'darwin'

  return (
    <div className="h-screen w-screen bg-canvas-bg flex items-center justify-center relative">
      {/* Drag bar at top for window movement */}
      {isMac && (
        <div className="absolute top-0 left-0 right-0 h-10 app-drag-region" />
      )}
      
      <div className="text-center">
        {/* Logo/Title */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-accent-blue" />
            <h1 className="text-4xl font-bold text-text-primary font-mono">
              Quest Designer
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            Visual node-based quest design tool
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={handleNewProject}
            className="w-64 flex items-center gap-3 px-6 py-4 bg-accent-blue hover:bg-accent-hover 
                       text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
          
          <button
            onClick={handleOpenProject}
            className="w-64 flex items-center gap-3 px-6 py-4 bg-panel-bg hover:bg-sidebar-hover 
                       text-text-primary border border-panel-border rounded-lg transition-colors font-medium"
          >
            <FolderOpen className="w-5 h-5" />
            <span>Open Project</span>
          </button>

          {/* Recent project */}
          {recentProject && window.electronAPI && (
            <button
              onClick={handleOpenRecent}
              className="w-64 flex items-center gap-3 px-6 py-3 bg-transparent hover:bg-sidebar-hover 
                         text-text-secondary border border-transparent hover:border-panel-border rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4 text-text-muted" />
              <div className="flex-1 text-left">
                <span className="block text-sm text-text-primary">{recentProject.name}</span>
                <span className="block text-xs text-text-muted truncate max-w-48">
                  {recentProject.path.split('/').pop()}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Hint */}
        <p className="mt-12 text-text-muted text-sm">
          Press <kbd className="px-2 py-1 bg-panel-bg rounded text-text-secondary">⌘N</kbd> to create a new project
        </p>
      </div>

      {/* Project name dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-panel-bg border border-panel-border rounded-lg shadow-panel w-96 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">New Project</h2>
              <button
                onClick={() => setShowNameDialog(false)}
                className="p-1 hover:bg-sidebar-hover rounded text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-text-secondary mb-2">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject()
                  if (e.key === 'Escape') setShowNameDialog(false)
                }}
                placeholder="My Quest Project"
                className="w-full"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNameDialog(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="btn btn-primary"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


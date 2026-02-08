import { FolderOpen, Plus, Sparkles } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

export function WelcomeScreen() {
  const { createProject, setProject, setFilePath } = useProjectStore()

  const handleNewProject = () => {
    createProject('Untitled Project')
  }

  const handleOpenProject = async () => {
    if (!window.electronAPI) {
      // Fallback for browser dev
      createProject('Untitled Project')
      return
    }

    const result = await window.electronAPI.loadFile()
    if (result.success && result.data) {
      try {
        const project = JSON.parse(result.data)
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
        setProject(project)
        setFilePath(result.filePath ?? null)
      } catch (e) {
        console.error('Failed to parse project file:', e)
      }
    }
  }

  return (
    <div className="h-screen w-screen bg-canvas-bg flex items-center justify-center">
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
        </div>

        {/* Hint */}
        <p className="mt-12 text-text-muted text-sm">
          Press <kbd className="px-2 py-1 bg-panel-bg rounded text-text-secondary">⌘N</kbd> to create a new project
        </p>
      </div>
    </div>
  )
}


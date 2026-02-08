import { useReactFlow } from '@xyflow/react'
import { Circle } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'

export function StatusBar() {
  const { project, currentQuestId, isDirty } = useProjectStore()
  
  // Try to get zoom level from React Flow, but handle case where it's not available
  let zoom = 1
  try {
    const { getZoom } = useReactFlow()
    zoom = getZoom()
  } catch {
    // React Flow not available yet
  }

  const currentQuest = project?.quests.find(q => q.id === currentQuestId)
  const nodeCount = currentQuest?.nodes.length ?? 0
  const connectionCount = currentQuest?.connections.length ?? 0

  return (
    <footer className="h-7 bg-sidebar-bg border-t border-sidebar-border flex items-center px-4 text-xs text-text-muted">
      <div className="flex items-center gap-4">
        {/* Save status */}
        <div className="flex items-center gap-1.5">
          <Circle 
            className={`w-2 h-2 ${isDirty ? 'fill-node-event text-node-event' : 'fill-node-start text-node-start'}`} 
          />
          <span>{isDirty ? 'Unsaved changes' : 'Saved'}</span>
        </div>

        <span className="text-panel-border">|</span>

        {/* Zoom level */}
        <span>Zoom: {Math.round(zoom * 100)}%</span>

        <span className="text-panel-border">|</span>

        {/* Node count */}
        <span>Nodes: {nodeCount}</span>

        <span className="text-panel-border">|</span>

        {/* Connection count */}
        <span>Connections: {connectionCount}</span>
      </div>

      {/* Right side - current quest */}
      <div className="ml-auto">
        {currentQuest && (
          <span>Editing: {currentQuest.name}</span>
        )}
      </div>
    </footer>
  )
}


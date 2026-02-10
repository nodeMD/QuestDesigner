import { useOnViewportChange } from '@xyflow/react'
import { Circle } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useState, useCallback } from 'react'

export function StatusBar() {
  const { project, currentQuestId, isDirty } = useProjectStore()
  const [zoom, setZoom] = useState(1)

  // Listen for viewport changes to keep zoom level in sync
  const onViewportChange = useCallback((viewport: { zoom: number }) => {
    setZoom(viewport.zoom)
  }, [])

  useOnViewportChange({
    onStart: onViewportChange,
    onChange: onViewportChange,
    onEnd: onViewportChange,
  })

  const currentQuest = project?.quests.find((q) => q.id === currentQuestId)
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
      <div className="ml-auto">{currentQuest && <span>Editing: {currentQuest.name}</span>}</div>
    </footer>
  )
}

import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { 
  Play, 
  MessageSquare, 
  GitBranch, 
  Zap, 
  HelpCircle, 
  GitMerge, 
  GitPullRequest,
  Square 
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import type { NodeType } from '@/types'

const nodeTypeOptions: { type: NodeType; label: string; icon: typeof Play; color: string }[] = [
  { type: 'START', label: 'Start', icon: Play, color: 'text-node-start' },
  { type: 'DIALOGUE', label: 'Dialogue', icon: MessageSquare, color: 'text-node-dialogue' },
  { type: 'CHOICE', label: 'Choice', icon: GitBranch, color: 'text-node-choice' },
  { type: 'EVENT', label: 'Event', icon: Zap, color: 'text-node-event' },
  { type: 'IF', label: 'If', icon: HelpCircle, color: 'text-node-condition' },
  { type: 'AND', label: 'And', icon: GitMerge, color: 'text-node-condition' },
  { type: 'OR', label: 'Or', icon: GitPullRequest, color: 'text-node-condition' },
  { type: 'END', label: 'End', icon: Square, color: 'text-node-end' },
]

export function ContextMenu() {
  const { contextMenu, closeContextMenu, openEditPanel } = useUIStore()
  const { addNode, currentQuestId } = useProjectStore()
  
  let screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number }
  try {
    const { screenToFlowPosition: stfp } = useReactFlow()
    screenToFlowPosition = stfp
  } catch {
    // React Flow not ready, use identity function
    screenToFlowPosition = (pos) => pos
  }

  const handleAddNode = useCallback((type: NodeType) => {
    if (!currentQuestId) return
    
    // Convert screen position to flow position
    const position = screenToFlowPosition({
      x: contextMenu.position.x,
      y: contextMenu.position.y,
    })
    
    const node = addNode(type, position)
    if (node) {
      openEditPanel(node.id)
    }
    closeContextMenu()
  }, [contextMenu.position, screenToFlowPosition, addNode, currentQuestId, openEditPanel, closeContextMenu])

  if (!contextMenu.isOpen || contextMenu.type !== 'canvas') {
    return null
  }

  return (
    <div
      className="context-menu fixed z-50 bg-panel-bg border border-panel-border rounded-lg shadow-panel py-1 min-w-48"
      style={{
        left: contextMenu.position.x,
        top: contextMenu.position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wide">
        Add Node
      </div>
      
      {nodeTypeOptions.map(({ type, label, icon: Icon, color }) => (
        <button
          key={type}
          onClick={() => handleAddNode(type)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary 
                     hover:bg-sidebar-hover hover:text-text-primary transition-colors"
        >
          <Icon className={`w-4 h-4 ${color}`} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}


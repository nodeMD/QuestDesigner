import { memo } from 'react'
import { Wrench, X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

interface NodeActionsProps {
  nodeId: string
}

export const NodeActions = memo(({ nodeId }: NodeActionsProps) => {
  const { openEditPanel, openDeleteModal } = useUIStore()

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openEditPanel(nodeId)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    openDeleteModal('node', nodeId)
  }

  return (
    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        onClick={handleEdit}
        className="p-1 bg-accent-blue hover:bg-accent-hover rounded transition-colors"
        title="Edit node"
      >
        <Wrench className="w-3 h-3 text-white" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1 bg-validation-error hover:bg-red-600 rounded transition-colors"
        title="Delete node"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  )
})

NodeActions.displayName = 'NodeActions'

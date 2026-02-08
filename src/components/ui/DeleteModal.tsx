import { AlertTriangle, X } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

export function DeleteModal() {
  const { isDeleteModalOpen, deleteTarget, closeDeleteModal } = useUIStore()
  const { deleteNode, deleteConnection, deleteQuest } = useProjectStore()

  if (!isDeleteModalOpen || !deleteTarget) {
    return null
  }

  const handleConfirm = () => {
    switch (deleteTarget.type) {
      case 'node':
        deleteNode(deleteTarget.id)
        break
      case 'connection':
        deleteConnection(deleteTarget.id)
        break
      case 'quest':
        deleteQuest(deleteTarget.id)
        break
    }
    closeDeleteModal()
  }

  const getTitle = () => {
    switch (deleteTarget.type) {
      case 'node':
        return 'Delete Node?'
      case 'connection':
        return 'Remove Connection?'
      case 'quest':
        return 'Delete Quest?'
    }
  }

  const getMessage = () => {
    switch (deleteTarget.type) {
      case 'node':
        return 'This will remove the node and all its connections. This action cannot be undone.'
      case 'connection':
        return 'This will disconnect these nodes. You can reconnect them later.'
      case 'quest':
        return 'This will permanently delete the quest and all its nodes. This action cannot be undone.'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeDeleteModal}
      />
      
      {/* Modal */}
      <div className="relative bg-panel-bg border border-panel-border rounded-lg shadow-panel w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-validation-error" />
            <h3 className="font-semibold text-text-primary">{getTitle()}</h3>
          </div>
          <button
            onClick={closeDeleteModal}
            className="p-1 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-4 py-4">
          <p className="text-text-secondary">{getMessage()}</p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 px-4 py-3 border-t border-panel-border">
          <button
            onClick={closeDeleteModal}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-danger"
          >
            {deleteTarget.type === 'connection' ? 'Remove' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}


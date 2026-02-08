import { create } from 'zustand'
import type { Position } from '@/types'

interface ContextMenuState {
  isOpen: boolean
  position: Position
  type: 'canvas' | 'node' | 'connection'
  targetId?: string
}

interface UIState {
  // Edit panel
  isEditPanelOpen: boolean
  editingNodeId: string | null
  
  // Context menu
  contextMenu: ContextMenuState
  
  // Modals
  isDeleteModalOpen: boolean
  deleteTarget: { type: 'node' | 'connection' | 'quest'; id: string } | null
  
  // Sidebar
  sidebarTab: 'quests' | 'events'
  
  // Validation
  isValidating: boolean
  validationPanelOpen: boolean
  
  // Actions
  openEditPanel: (nodeId: string) => void
  closeEditPanel: () => void
  
  openContextMenu: (type: ContextMenuState['type'], position: Position, targetId?: string) => void
  closeContextMenu: () => void
  
  openDeleteModal: (type: 'node' | 'connection' | 'quest', id: string) => void
  closeDeleteModal: () => void
  
  setSidebarTab: (tab: 'quests' | 'events') => void
  
  setValidating: (validating: boolean) => void
  setValidationPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isEditPanelOpen: false,
  editingNodeId: null,
  
  contextMenu: {
    isOpen: false,
    position: { x: 0, y: 0 },
    type: 'canvas',
  },
  
  isDeleteModalOpen: false,
  deleteTarget: null,
  
  sidebarTab: 'quests',
  
  isValidating: false,
  validationPanelOpen: false,

  openEditPanel: (nodeId) => set({ isEditPanelOpen: true, editingNodeId: nodeId }),
  closeEditPanel: () => set({ isEditPanelOpen: false, editingNodeId: null }),

  openContextMenu: (type, position, targetId) =>
    set({
      contextMenu: { isOpen: true, position, type, targetId },
    }),
  closeContextMenu: () =>
    set({
      contextMenu: { isOpen: false, position: { x: 0, y: 0 }, type: 'canvas' },
    }),

  openDeleteModal: (type, id) => set({ isDeleteModalOpen: true, deleteTarget: { type, id } }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, deleteTarget: null }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setValidating: (validating) => set({ isValidating: validating }),
  setValidationPanelOpen: (open) => set({ validationPanelOpen: open }),
}))


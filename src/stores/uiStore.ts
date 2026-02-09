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
  
  // Event edit panel
  isEventEditPanelOpen: boolean
  editingEventId: string | null
  
  // Context menu
  contextMenu: ContextMenuState
  
  // Modals
  isDeleteModalOpen: boolean
  deleteTarget: { type: 'node' | 'connection' | 'quest' | 'event'; id: string } | null
  
  // Sidebar
  sidebarTab: 'quests' | 'events'
  
  // Validation
  isValidating: boolean
  validationPanelOpen: boolean
  
  // Canvas focus - for panning to a node
  focusNodeId: string | null
  
  // Search
  searchQuery: string
  searchResultNodeIds: string[]
  isSearchOpen: boolean
  
  // Actions
  openEditPanel: (nodeId: string) => void
  closeEditPanel: () => void
  
  openEventEditPanel: (eventId: string) => void
  closeEventEditPanel: () => void
  
  openContextMenu: (type: ContextMenuState['type'], position: Position, targetId?: string) => void
  closeContextMenu: () => void
  
  openDeleteModal: (type: 'node' | 'connection' | 'quest' | 'event', id: string) => void
  closeDeleteModal: () => void
  
  setSidebarTab: (tab: 'quests' | 'events') => void
  
  setValidating: (validating: boolean) => void
  setValidationPanelOpen: (open: boolean) => void
  
  focusOnNode: (nodeId: string) => void
  clearFocusNode: () => void
  
  setSearchQuery: (query: string) => void
  setSearchResults: (nodeIds: string[]) => void
  openSearch: () => void
  closeSearch: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isEditPanelOpen: false,
  editingNodeId: null,
  
  isEventEditPanelOpen: false,
  editingEventId: null,
  
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
  
  focusNodeId: null,
  
  searchQuery: '',
  searchResultNodeIds: [],
  isSearchOpen: false,

  openEditPanel: (nodeId) => set({ isEditPanelOpen: true, editingNodeId: nodeId }),
  closeEditPanel: () => set({ isEditPanelOpen: false, editingNodeId: null }),

  openEventEditPanel: (eventId) => set({ isEventEditPanelOpen: true, editingEventId: eventId }),
  closeEventEditPanel: () => set({ isEventEditPanelOpen: false, editingEventId: null }),

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
  
  focusOnNode: (nodeId) => set({ focusNodeId: nodeId }),
  clearFocusNode: () => set({ focusNodeId: null }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (nodeIds) => set({ searchResultNodeIds: nodeIds }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, searchQuery: '', searchResultNodeIds: [] }),
}))


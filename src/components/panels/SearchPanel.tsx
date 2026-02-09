import { useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import { searchNodes, getUniqueNodeIds } from '@/utils/search'
import type { QuestNode } from '@/types'

// Get display name for a node based on its type
function getNodeDisplayName(node: QuestNode): string {
  switch (node.type) {
    case 'START':
      return node.title || 'Start'
    case 'END':
      return node.title || 'End'
    case 'DIALOGUE':
      return node.speaker || 'Dialogue'
    case 'CHOICE':
      return node.prompt || 'Choice'
    case 'EVENT':
      return node.eventName || 'Event'
    case 'IF':
      return 'IF Condition'
    case 'AND':
      return 'AND Gate'
    case 'OR':
      return 'OR Gate'
    default:
      return 'Node'
  }
}

export function SearchPanel() {
  const { 
    isSearchOpen, 
    searchQuery, 
    searchResultNodeIds,
    setSearchQuery, 
    setSearchResults, 
    closeSearch,
    focusOnNode 
  } = useUIStore()
  
  const { getCurrentQuest, selectNode } = useProjectStore()
  const currentQuest = getCurrentQuest()
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSearchOpen])
  
  // Search when query changes
  useEffect(() => {
    if (!currentQuest || !searchQuery.trim()) {
      setSearchResults([])
      return
    }
    
    const results = searchNodes(currentQuest, searchQuery)
    const nodeIds = getUniqueNodeIds(results)
    setSearchResults(nodeIds)
  }, [searchQuery, currentQuest, setSearchResults])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isSearchOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, closeSearch])
  
  const handleNodeClick = useCallback((nodeId: string) => {
    selectNode(nodeId)
    focusOnNode(nodeId)
  }, [selectNode, focusOnNode])
  
  if (!isSearchOpen) return null
  
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-96 max-w-[90vw]">
      <div className="bg-panel-bg border border-panel-border rounded-lg shadow-panel overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-panel-border">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-muted"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-text-muted hover:text-text-secondary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="p-1 text-text-muted hover:text-text-secondary rounded"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Results */}
        {searchQuery && (
          <div className="max-h-64 overflow-y-auto">
            {searchResultNodeIds.length === 0 ? (
              <div className="px-3 py-4 text-sm text-text-muted text-center">
                No nodes found
              </div>
            ) : (
              <div className="py-1">
                <div className="px-3 py-1 text-xs text-text-muted">
                  {searchResultNodeIds.length} node{searchResultNodeIds.length !== 1 ? 's' : ''} found
                </div>
                {searchResultNodeIds.map((nodeId) => {
                  const node = currentQuest?.nodes.find((n) => n.id === nodeId)
                  if (!node) return null
                  
                  return (
                    <button
                      key={nodeId}
                      onClick={() => handleNodeClick(nodeId)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm
                                 text-text-secondary hover:bg-sidebar-hover hover:text-text-primary
                                 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getNodeColor(node.type)}`} />
                        <span className="truncate">{getNodeDisplayName(node)}</span>
                        <span className="text-xs text-text-muted flex-shrink-0">
                          ({node.type})
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Help text when empty */}
        {!searchQuery && (
          <div className="px-3 py-4 text-sm text-text-muted text-center">
            Type to search nodes by name, speaker, content...
          </div>
        )}
      </div>
    </div>
  )
}

function getNodeColor(type: string): string {
  switch (type) {
    case 'START':
      return 'bg-node-start'
    case 'DIALOGUE':
      return 'bg-node-dialogue'
    case 'CHOICE':
      return 'bg-node-choice'
    case 'EVENT':
      return 'bg-node-event'
    case 'IF':
    case 'AND':
    case 'OR':
      return 'bg-node-condition'
    case 'END':
      return 'bg-node-end'
    default:
      return 'bg-text-muted'
  }
}

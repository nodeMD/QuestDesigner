import { useState } from 'react'
import { 
  Plus, 
  ScrollText, 
  Zap, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  ChevronRight
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

export function Sidebar() {
  const { 
    project, 
    currentQuestId, 
    createQuest, 
    selectQuest, 
    deleteQuest,
    createEvent 
  } = useProjectStore()
  const { sidebarTab, setSidebarTab } = useUIStore()

  const [newQuestName, setNewQuestName] = useState('')
  const [isAddingQuest, setIsAddingQuest] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)

  const handleAddQuest = () => {
    if (newQuestName.trim()) {
      createQuest(newQuestName.trim())
      setNewQuestName('')
      setIsAddingQuest(false)
    }
  }

  const handleAddEvent = () => {
    if (newEventName.trim()) {
      createEvent(newEventName.trim())
      setNewEventName('')
      setIsAddingEvent(false)
    }
  }

  if (!project) return null

  return (
    <aside className="w-72 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
      {/* Project name */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <h2 className="font-semibold text-text-primary truncate">{project.name}</h2>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-sidebar-border">
        <button
          onClick={() => setSidebarTab('quests')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
            ${sidebarTab === 'quests' 
              ? 'text-accent-blue border-b-2 border-accent-blue bg-sidebar-hover/50' 
              : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'
            }`}
        >
          <ScrollText className="w-4 h-4" />
          Quests
        </button>
        <button
          onClick={() => setSidebarTab('events')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
            ${sidebarTab === 'events' 
              ? 'text-accent-blue border-b-2 border-accent-blue bg-sidebar-hover/50' 
              : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'
            }`}
        >
          <Zap className="w-4 h-4" />
          Events
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'quests' ? (
          <div className="p-2">
            {/* Quest list */}
            {project.quests.map((quest) => (
              <div
                key={quest.id}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors
                  ${currentQuestId === quest.id 
                    ? 'bg-accent-blue/20 text-accent-blue' 
                    : 'text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'
                  }`}
                onClick={() => selectQuest(quest.id)}
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${currentQuestId === quest.id ? 'rotate-90' : ''}`} />
                <span className="flex-1 truncate text-sm">{quest.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setContextMenuId(contextMenuId === quest.id ? null : quest.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-panel-border rounded transition-all"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {/* Quest context menu */}
                {contextMenuId === quest.id && (
                  <div 
                    className="absolute right-0 top-full mt-1 z-50 bg-panel-bg border border-panel-border rounded-md shadow-panel py-1 min-w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                      onClick={() => {
                        // TODO: Implement rename
                        setContextMenuId(null)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-validation-error hover:bg-sidebar-hover"
                      onClick={() => {
                        deleteQuest(quest.id)
                        setContextMenuId(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add quest form */}
            {isAddingQuest ? (
              <div className="mt-2 px-2">
                <input
                  type="text"
                  value={newQuestName}
                  onChange={(e) => setNewQuestName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddQuest()
                    if (e.key === 'Escape') {
                      setIsAddingQuest(false)
                      setNewQuestName('')
                    }
                  }}
                  placeholder="Quest name..."
                  className="w-full text-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddQuest}
                    className="btn btn-primary text-xs py-1"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingQuest(false)
                      setNewQuestName('')
                    }}
                    className="btn btn-ghost text-xs py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingQuest(true)}
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Quest
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {/* Event list */}
            {project.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4 text-node-event" />
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-sm">{event.name}</span>
                  {event.usedInQuests.length > 0 && (
                    <span className="text-xs text-text-muted">
                      Used in {event.usedInQuests.length} quest(s)
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Add event form */}
            {isAddingEvent ? (
              <div className="mt-2 px-2">
                <input
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddEvent()
                    if (e.key === 'Escape') {
                      setIsAddingEvent(false)
                      setNewEventName('')
                    }
                  }}
                  placeholder="Event name..."
                  className="w-full text-sm"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleAddEvent}
                    className="btn btn-primary text-xs py-1"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingEvent(false)
                      setNewEventName('')
                    }}
                    className="btn btn-ghost text-xs py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingEvent(true)}
                className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}


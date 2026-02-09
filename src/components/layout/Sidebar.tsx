import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  ScrollText, 
  Zap, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  ChevronRight,
  Check,
  X,
  Settings
} from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

export function Sidebar() {
  const { 
    project, 
    currentQuestId, 
    createQuest, 
    selectQuest, 
    updateQuest,
    createEvent,
    updateEvent,
    renameProject
  } = useProjectStore()
  const { sidebarTab, setSidebarTab, openDeleteModal, openEventEditPanel } = useUIStore()

  const [newQuestName, setNewQuestName] = useState('')
  const [isAddingQuest, setIsAddingQuest] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [isAddingEvent, setIsAddingEvent] = useState(false)
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const [renamingQuestId, setRenamingQuestId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isRenamingProject, setIsRenamingProject] = useState(false)
  const [projectRenameValue, setProjectRenameValue] = useState('')
  const [eventContextMenuId, setEventContextMenuId] = useState<string | null>(null)
  const [renamingEventId, setRenamingEventId] = useState<string | null>(null)
  const [eventRenameValue, setEventRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const projectRenameInputRef = useRef<HTMLInputElement>(null)
  const eventRenameInputRef = useRef<HTMLInputElement>(null)

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingQuestId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingQuestId])

  useEffect(() => {
    if (isRenamingProject && projectRenameInputRef.current) {
      projectRenameInputRef.current.focus()
      projectRenameInputRef.current.select()
    }
  }, [isRenamingProject])

  useEffect(() => {
    if (renamingEventId && eventRenameInputRef.current) {
      eventRenameInputRef.current.focus()
      eventRenameInputRef.current.select()
    }
  }, [renamingEventId])

  const handleStartRename = (questId: string, currentName: string) => {
    setRenamingQuestId(questId)
    setRenameValue(currentName)
    setContextMenuId(null)
  }

  const handleConfirmRename = () => {
    if (renamingQuestId && renameValue.trim()) {
      updateQuest(renamingQuestId, { name: renameValue.trim() })
    }
    setRenamingQuestId(null)
    setRenameValue('')
  }

  const handleCancelRename = () => {
    setRenamingQuestId(null)
    setRenameValue('')
  }

  const handleStartProjectRename = () => {
    if (!project) return
    setIsRenamingProject(true)
    setProjectRenameValue(project.name)
  }

  const handleConfirmProjectRename = () => {
    if (projectRenameValue.trim()) {
      renameProject(projectRenameValue.trim())
    }
    setIsRenamingProject(false)
    setProjectRenameValue('')
  }

  const handleCancelProjectRename = () => {
    setIsRenamingProject(false)
    setProjectRenameValue('')
  }

  const handleStartEventRename = (eventId: string, currentName: string) => {
    setRenamingEventId(eventId)
    setEventRenameValue(currentName)
    setEventContextMenuId(null)
  }

  const handleConfirmEventRename = () => {
    if (renamingEventId && eventRenameValue.trim()) {
      updateEvent(renamingEventId, { name: eventRenameValue.trim() })
    }
    setRenamingEventId(null)
    setEventRenameValue('')
  }

  const handleCancelEventRename = () => {
    setRenamingEventId(null)
    setEventRenameValue('')
  }

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
        {isRenamingProject ? (
          <div className="flex items-center gap-1">
            <input
              ref={projectRenameInputRef}
              type="text"
              value={projectRenameValue}
              onChange={(e) => setProjectRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmProjectRename()
                if (e.key === 'Escape') handleCancelProjectRename()
              }}
              onBlur={handleConfirmProjectRename}
              className="flex-1 text-sm px-1 py-0.5 bg-sidebar-bg border border-accent-blue rounded font-semibold"
            />
            <button
              onClick={handleConfirmProjectRename}
              className="p-0.5 hover:bg-node-start/20 rounded text-node-start"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancelProjectRename}
              className="p-0.5 hover:bg-validation-error/20 rounded text-validation-error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <h2 
            className="font-semibold text-text-primary truncate cursor-pointer hover:text-accent-blue transition-colors"
            onClick={handleStartProjectRename}
            title="Click to rename project"
          >
            {project.name}
          </h2>
        )}
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
                onClick={() => !renamingQuestId && selectQuest(quest.id)}
              >
                <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${currentQuestId === quest.id ? 'rotate-90' : ''}`} />
                
                {renamingQuestId === quest.id ? (
                  <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename()
                        if (e.key === 'Escape') handleCancelRename()
                      }}
                      onBlur={handleConfirmRename}
                      className="flex-1 text-sm px-1 py-0.5 bg-sidebar-bg border border-accent-blue rounded"
                    />
                    <button
                      onClick={handleConfirmRename}
                      className="p-0.5 hover:bg-node-start/20 rounded text-node-start"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-0.5 hover:bg-validation-error/20 rounded text-validation-error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
                
                {/* Quest context menu */}
                {contextMenuId === quest.id && !renamingQuestId && (
                  <div 
                    className="absolute right-0 top-full mt-1 z-50 bg-panel-bg border border-panel-border rounded-md shadow-panel py-1 min-w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                      onClick={() => handleStartRename(quest.id, quest.name)}
                    >
                      <Pencil className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-validation-error hover:bg-sidebar-hover"
                      onClick={() => {
                        openDeleteModal('quest', quest.id)
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
                onClick={() => !renamingEventId && openEventEditPanel(event.id)}
                className="relative flex items-center gap-2 px-3 py-2 rounded-md text-text-secondary 
                           hover:bg-sidebar-hover hover:text-text-primary cursor-pointer transition-colors group"
              >
                <Zap className="w-4 h-4 text-node-event flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {renamingEventId === event.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        ref={eventRenameInputRef}
                        type="text"
                        value={eventRenameValue}
                        onChange={(e) => setEventRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmEventRename()
                          if (e.key === 'Escape') handleCancelEventRename()
                        }}
                        onBlur={handleConfirmEventRename}
                        className="w-full text-sm py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConfirmEventRename(); }}
                        className="p-0.5 text-node-start hover:bg-sidebar-hover rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelEventRename(); }}
                        className="p-0.5 text-node-end hover:bg-sidebar-hover rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="block truncate text-sm">{event.name}</span>
                      {event.usedInQuests.length > 0 && (
                        <span className="text-xs text-text-muted">
                          Used in {event.usedInQuests.length} quest(s)
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Context menu button */}
                {!renamingEventId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEventContextMenuId(eventContextMenuId === event.id ? null : event.id)
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-sidebar-hover rounded transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                )}

                {/* Context menu dropdown */}
                {eventContextMenuId === event.id && !renamingEventId && (
                  <div 
                    className="absolute right-0 top-full mt-1 z-50 bg-panel-bg border border-panel-border rounded-md shadow-panel py-1 min-w-32"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                      onClick={() => {
                        openEventEditPanel(event.id)
                        setEventContextMenuId(null)
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Edit Parameters
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-sidebar-hover hover:text-text-primary"
                      onClick={() => handleStartEventRename(event.id, event.name)}
                    >
                      <Pencil className="w-4 h-4" />
                      Rename
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-validation-error hover:bg-sidebar-hover"
                      onClick={() => {
                        openDeleteModal('event', event.id)
                        setEventContextMenuId(null)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
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


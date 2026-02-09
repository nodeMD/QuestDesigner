import { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import type { EventParameter } from '@/types'

export function EventEditPanel() {
  const { isEventEditPanelOpen, editingEventId, closeEventEditPanel } = useUIStore()
  const { project, updateEvent } = useProjectStore()

  const event = project?.events.find((e) => e.id === editingEventId)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parameters, setParameters] = useState<EventParameter[]>([])

  // Sync state when event changes
  useEffect(() => {
    if (event) {
      setName(event.name)
      setDescription(event.description || '')
      setParameters(event.parameters || [])
    }
  }, [event])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEventEditPanelOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEventEditPanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEventEditPanelOpen, closeEventEditPanel])

  const handleSave = () => {
    if (!editingEventId) return

    updateEvent(editingEventId, {
      name: name.trim() || event?.name || 'Unnamed Event',
      description: description.trim() || undefined,
      parameters: parameters.length > 0 ? parameters : undefined,
    })

    closeEventEditPanel()
  }

  const handleAddParameter = () => {
    const newParam: EventParameter = {
      name: `param${parameters.length + 1}`,
      type: 'string',
      defaultValue: '',
      description: '',
    }
    setParameters([...parameters, newParam])
  }

  const handleUpdateParameter = (index: number, updates: Partial<EventParameter>) => {
    const updated = [...parameters]
    updated[index] = { ...updated[index], ...updates }
    setParameters(updated)
  }

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index))
  }

  if (!isEventEditPanelOpen || !event) return null

  return (
    <div className="w-96 bg-panel-bg border-l border-panel-border flex flex-col edit-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
        <h2 className="font-semibold text-text-primary">Edit Event</h2>
        <button
          onClick={closeEventEditPanel}
          className="p-1 text-text-muted hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Event Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder="Event name..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-20"
            placeholder="Optional description..."
          />
        </div>

        {/* Usage info */}
        <div className="text-xs text-text-muted">
          Used in {event.usedInQuests.length} quest{event.usedInQuests.length !== 1 ? 's' : ''}
        </div>

        {/* Parameters */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-secondary">Parameters</label>
            <button
              onClick={handleAddParameter}
              className="flex items-center gap-1 px-2 py-1 text-xs text-accent-blue hover:bg-accent-blue/10 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          {parameters.length === 0 ? (
            <div className="text-sm text-text-muted text-center py-4 border border-dashed border-panel-border rounded">
              No parameters defined
            </div>
          ) : (
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div
                  key={index}
                  className="bg-sidebar-bg border border-panel-border rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-text-muted mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      {/* Parameter name and type */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                          className="flex-1 text-sm"
                          placeholder="Parameter name"
                        />
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleUpdateParameter(index, {
                              type: e.target.value as 'string' | 'number' | 'boolean',
                              defaultValue:
                                e.target.value === 'boolean'
                                  ? false
                                  : e.target.value === 'number'
                                    ? 0
                                    : '',
                            })
                          }
                          className="w-24 text-sm"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>

                      {/* Default value */}
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-text-muted w-16">Default:</span>
                        {param.type === 'boolean' ? (
                          <select
                            value={param.defaultValue === true ? 'true' : 'false'}
                            onChange={(e) =>
                              handleUpdateParameter(index, {
                                defaultValue: e.target.value === 'true',
                              })
                            }
                            className="flex-1 text-sm"
                          >
                            <option value="false">false</option>
                            <option value="true">true</option>
                          </select>
                        ) : param.type === 'number' ? (
                          <input
                            type="number"
                            value={(param.defaultValue as number) || 0}
                            onChange={(e) =>
                              handleUpdateParameter(index, {
                                defaultValue: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="flex-1 text-sm"
                          />
                        ) : (
                          <input
                            type="text"
                            value={(param.defaultValue as string) || ''}
                            onChange={(e) =>
                              handleUpdateParameter(index, {
                                defaultValue: e.target.value,
                              })
                            }
                            className="flex-1 text-sm"
                            placeholder="Default value"
                          />
                        )}
                      </div>

                      {/* Description */}
                      <input
                        type="text"
                        value={param.description || ''}
                        onChange={(e) =>
                          handleUpdateParameter(index, { description: e.target.value })
                        }
                        className="w-full text-sm"
                        placeholder="Parameter description (optional)"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveParameter(index)}
                      className="p-1 text-text-muted hover:text-validation-error hover:bg-validation-error/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-panel-border flex justify-end gap-2">
        <button onClick={closeEventEditPanel} className="btn btn-ghost text-sm">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary text-sm">
          Save Changes
        </button>
      </div>
    </div>
  )
}

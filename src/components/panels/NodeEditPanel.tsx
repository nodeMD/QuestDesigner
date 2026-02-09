import { useState, useEffect } from 'react'
import { X, Check, Plus, Trash2, GripVertical } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import type { QuestNode, Option, StartNode, DialogueNode, ChoiceNode, EndNode, EventNode, IfNode, AndNode, OrNode, GlobalEvent } from '@/types'

export function NodeEditPanel() {
  const { isEditPanelOpen, editingNodeId, closeEditPanel } = useUIStore()
  const { getNode, updateNode, project } = useProjectStore()
  
  const [localNode, setLocalNode] = useState<QuestNode | null>(null)

  // Load node data when panel opens
  useEffect(() => {
    if (editingNodeId) {
      const node = getNode(editingNodeId)
      if (node) {
        setLocalNode({ ...node })
      }
    }
  }, [editingNodeId, getNode])

  if (!isEditPanelOpen || !localNode) {
    return null
  }

  const handleSave = () => {
    if (localNode) {
      updateNode(localNode.id, localNode)
    }
    closeEditPanel()
  }

  const handleCancel = () => {
    closeEditPanel()
  }

  const updateLocalNode = (updates: Partial<QuestNode>) => {
    if (localNode) {
      setLocalNode({ ...localNode, ...updates } as QuestNode)
    }
  }

  const addOption = () => {
    if ('options' in localNode) {
      const newOption: Option = { id: uuid(), label: 'New option' }
      updateLocalNode({ options: [...localNode.options, newOption] } as Partial<QuestNode>)
    }
  }

  const updateOption = (optionId: string, label: string) => {
    if ('options' in localNode) {
      updateLocalNode({
        options: localNode.options.map(o => 
          o.id === optionId ? { ...o, label } : o
        )
      } as Partial<QuestNode>)
    }
  }

  const removeOption = (optionId: string) => {
    if ('options' in localNode) {
      updateLocalNode({
        options: localNode.options.filter(o => o.id !== optionId)
      } as Partial<QuestNode>)
    }
  }

  const renderNodeTypeFields = () => {
    switch (localNode.type) {
      case 'START':
        return <StartNodeFields node={localNode as StartNode} onUpdate={updateLocalNode} />
      case 'DIALOGUE':
        return <DialogueNodeFields node={localNode as DialogueNode} onUpdate={updateLocalNode} />
      case 'CHOICE':
        return <ChoiceNodeFields node={localNode as ChoiceNode} onUpdate={updateLocalNode} />
      case 'EVENT':
        return <EventNodeFields node={localNode as EventNode} onUpdate={updateLocalNode} events={project?.events || []} />
      case 'IF':
        return <IfNodeFields node={localNode as IfNode} onUpdate={updateLocalNode} />
      case 'AND':
        return <AndOrNodeFields node={localNode as AndNode} onUpdate={updateLocalNode} />
      case 'OR':
        return <AndOrNodeFields node={localNode as OrNode} onUpdate={updateLocalNode} />
      case 'END':
        return <EndNodeFields node={localNode as EndNode} onUpdate={updateLocalNode} />
      default:
        return null
    }
  }

  const hasOptions = 'options' in localNode

  return (
    <div className="w-96 bg-panel-bg border-l border-panel-border flex flex-col edit-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="p-1.5 text-node-start hover:bg-node-start/20 rounded transition-colors"
            title="Save changes"
          >
            <Check className="w-5 h-5" />
          </button>
          <h3 className="font-mono font-semibold text-text-primary">
            {localNode.type} NODE
          </h3>
        </div>
        <button
          onClick={handleCancel}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node ID (read-only) */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Node ID</label>
          <div className="text-xs font-mono text-text-secondary bg-sidebar-bg px-2 py-1 rounded">
            {localNode.id}
          </div>
        </div>

        {/* Type-specific fields */}
        {renderNodeTypeFields()}

        {/* Options (for nodes that have them) */}
        {hasOptions && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-text-muted">Options</label>
              <button
                onClick={addOption}
                className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-hover transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(localNode as StartNode | DialogueNode | ChoiceNode).options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-text-muted cursor-grab" />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    className="flex-1 text-sm"
                    placeholder="Option label"
                  />
                  <button
                    onClick={() => removeOption(option.id)}
                    className="p-1 text-text-muted hover:text-validation-error transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-4 py-3 border-t border-panel-border">
        <button onClick={handleCancel} className="btn btn-secondary text-sm">
          Cancel
        </button>
        <button onClick={handleSave} className="btn btn-primary text-sm">
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Field components for each node type

function StartNodeFields({ node, onUpdate }: { node: StartNode; onUpdate: (u: Partial<StartNode>) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Title</label>
        <input
          type="text"
          value={node.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-sm"
          placeholder="Quest title"
        />
      </div>
      
      <div className="grid grid-cols-1">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Location Name</label>
          <input
            type="text"
            value={node.location?.name || ''}
            onChange={(e) => onUpdate({ location: { ...node.location, name: e.target.value } })}
            className="w-full text-sm"
            placeholder="e.g., Rivenhold"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">X</label>
            <input
              type="number"
              value={node.location?.x || ''}
              onChange={(e) => onUpdate({ location: { ...node.location, x: Number(e.target.value) } })}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Y</label>
            <input
              type="number"
              value={node.location?.y || ''}
              onChange={(e) => onUpdate({ location: { ...node.location, y: Number(e.target.value) } })}
              className="w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Z</label>
            <input
              type="number"
              value={node.location?.z || ''}
              onChange={(e) => onUpdate({ location: { ...node.location, z: Number(e.target.value) } })}
              className="w-full text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">NPC Name</label>
          <input
            type="text"
            value={node.npc?.name || ''}
            onChange={(e) => onUpdate({ npc: { ...node.npc, name: e.target.value } })}
            className="w-full text-sm"
            placeholder="e.g., Glosnar"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">NPC Type</label>
          <input
            type="text"
            value={node.npc?.type || ''}
            onChange={(e) => onUpdate({ npc: { ...node.npc, name: node.npc?.name || '', type: e.target.value } })}
            className="w-full text-sm"
            placeholder="e.g., Orc"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
        <textarea
          value={node.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full text-sm h-24"
          placeholder="Quest introduction/hook..."
        />
      </div>
    </>
  )
}

function DialogueNodeFields({ node, onUpdate }: { node: DialogueNode; onUpdate: (u: Partial<DialogueNode>) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Speaker</label>
        <input
          type="text"
          value={node.speaker || ''}
          onChange={(e) => onUpdate({ speaker: e.target.value })}
          className="w-full text-sm"
          placeholder="Who is speaking?"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Dialogue Text</label>
        <textarea
          value={node.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full text-sm h-32"
          placeholder="What do they say?"
        />
      </div>
    </>
  )
}

function ChoiceNodeFields({ node, onUpdate }: { node: ChoiceNode; onUpdate: (u: Partial<ChoiceNode>) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">Prompt (optional)</label>
      <input
        type="text"
        value={node.prompt || ''}
        onChange={(e) => onUpdate({ prompt: e.target.value })}
        className="w-full text-sm"
        placeholder="What do you do?"
      />
    </div>
  )
}

function EventNodeFields({ 
  node, 
  onUpdate, 
  events 
}: { 
  node: EventNode; 
  onUpdate: (u: Partial<EventNode>) => void;
  events: GlobalEvent[]
}) {
  const selectedEvent = events.find(e => e.id === node.eventId)
  const eventParams = selectedEvent?.parameters || []
  
  const handleParamChange = (paramName: string, value: unknown) => {
    onUpdate({
      parameters: {
        ...(node.parameters || {}),
        [paramName]: value
      }
    })
  }
  
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Action</label>
        <select
          value={node.action}
          onChange={(e) => onUpdate({ action: e.target.value as 'TRIGGER' | 'CHECK' })}
          className="w-full text-sm"
        >
          <option value="TRIGGER">Trigger Event</option>
          <option value="CHECK">Check Event</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Event</label>
        <select
          value={node.eventId}
          onChange={(e) => {
            const event = events.find(ev => ev.id === e.target.value)
            onUpdate({ 
              eventId: e.target.value, 
              eventName: event?.name,
              // Reset parameters when changing event
              parameters: {}
            })
          }}
          className="w-full text-sm"
        >
          <option value="">Select an event...</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {/* Event Parameters */}
      {eventParams.length > 0 && (
        <div className="mt-4 pt-4 border-t border-panel-border">
          <label className="block text-xs font-medium text-text-muted mb-2">Event Parameters</label>
          <div className="space-y-3">
            {eventParams.map((param) => (
              <div key={param.name} className="bg-sidebar-bg p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-text-secondary">{param.name}</label>
                  <span className="text-xs text-text-muted capitalize">{param.type}</span>
                </div>
                {param.description && (
                  <p className="text-xs text-text-muted mb-2">{param.description}</p>
                )}
                {param.type === 'boolean' ? (
                  <select
                    value={(node.parameters?.[param.name] ?? param.defaultValue ?? false) === true ? 'true' : 'false'}
                    onChange={(e) => handleParamChange(param.name, e.target.value === 'true')}
                    className="w-full text-sm"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={(node.parameters?.[param.name] ?? param.defaultValue ?? 0) as number}
                    onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value) || 0)}
                    className="w-full text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={(node.parameters?.[param.name] ?? param.defaultValue ?? '') as string}
                    onChange={(e) => handleParamChange(param.name, e.target.value)}
                    className="w-full text-sm"
                    placeholder={param.defaultValue?.toString() || 'Value...'}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Condition types for the visual builder
type ConditionType = 'hasItem' | 'reputation' | 'eventTriggered' | 'custom'
type ConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<='

interface ConditionPart {
  id: string
  type: ConditionType
  itemName?: string
  factionName?: string
  operator?: ConditionOperator
  value?: string | number
  customExpression?: string
}

function parseConditionToBuilder(condition: string): { parts: ConditionPart[], combiner: 'AND' | 'OR' } {
  // Simple parser - try to extract conditions
  if (!condition || condition.trim() === '') {
    return { parts: [], combiner: 'AND' }
  }
  
  // Check if it's a combined condition
  const combiner = condition.includes('||') ? 'OR' : 'AND'
  
  // For now, if it's complex, just return a custom condition
  return {
    parts: [{
      id: uuid(),
      type: 'custom',
      customExpression: condition
    }],
    combiner
  }
}

function buildConditionFromParts(parts: ConditionPart[], combiner: 'AND' | 'OR'): string {
  if (parts.length === 0) return ''
  
  const conditions = parts.map(part => {
    switch (part.type) {
      case 'hasItem':
        return `player.hasItem('${part.itemName || ''}')`
      case 'reputation':
        return `faction.reputation('${part.factionName || ''}') ${part.operator || '>'} ${part.value || 0}`
      case 'eventTriggered':
        return `event.isTriggered('${part.itemName || ''}')`
      case 'custom':
        return part.customExpression || ''
      default:
        return ''
    }
  }).filter(c => c.trim() !== '')
  
  const joiner = combiner === 'AND' ? ' && ' : ' || '
  return conditions.join(joiner)
}

function IfNodeFields({ node, onUpdate }: { node: IfNode; onUpdate: (u: Partial<IfNode>) => void }) {
  const [useBuilder, setUseBuilder] = useState(false)
  const [parts, setParts] = useState<ConditionPart[]>([])
  const [combiner, setCombiner] = useState<'AND' | 'OR'>('AND')

  // Initialize builder state from existing condition
  useEffect(() => {
    const parsed = parseConditionToBuilder(node.condition)
    setParts(parsed.parts)
    setCombiner(parsed.combiner)
  }, []) // Only on mount

  const addConditionPart = (type: ConditionType) => {
    const newPart: ConditionPart = {
      id: uuid(),
      type,
      operator: '>',
      value: 0
    }
    const newParts = [...parts, newPart]
    setParts(newParts)
    onUpdate({ condition: buildConditionFromParts(newParts, combiner) })
  }

  const updateConditionPart = (id: string, updates: Partial<ConditionPart>) => {
    const newParts = parts.map(p => p.id === id ? { ...p, ...updates } : p)
    setParts(newParts)
    onUpdate({ condition: buildConditionFromParts(newParts, combiner) })
  }

  const removeConditionPart = (id: string) => {
    const newParts = parts.filter(p => p.id !== id)
    setParts(newParts)
    onUpdate({ condition: buildConditionFromParts(newParts, combiner) })
  }

  const handleCombinerChange = (newCombiner: 'AND' | 'OR') => {
    setCombiner(newCombiner)
    onUpdate({ condition: buildConditionFromParts(parts, newCombiner) })
  }

  return (
    <div className="space-y-3">
      {/* Toggle between builder and raw mode */}
      <div className="flex items-center gap-2">
        <label className="block text-xs font-medium text-text-muted">Condition</label>
        <button
          type="button"
          onClick={() => setUseBuilder(!useBuilder)}
          className="text-xs text-accent-blue hover:text-accent-hover transition-colors"
        >
          {useBuilder ? '← Raw mode' : 'Use builder →'}
        </button>
      </div>

      {useBuilder ? (
        <div className="space-y-3">
          {/* Condition combiner */}
          {parts.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">Combine with:</span>
              <button
                type="button"
                onClick={() => handleCombinerChange('AND')}
                className={`px-2 py-1 rounded ${combiner === 'AND' ? 'bg-accent-blue text-white' : 'bg-sidebar-bg text-text-secondary'}`}
              >
                AND
              </button>
              <button
                type="button"
                onClick={() => handleCombinerChange('OR')}
                className={`px-2 py-1 rounded ${combiner === 'OR' ? 'bg-accent-blue text-white' : 'bg-sidebar-bg text-text-secondary'}`}
              >
                OR
              </button>
            </div>
          )}

          {/* Condition parts */}
          <div className="space-y-2">
            {parts.map((part, index) => (
              <div key={part.id} className="bg-sidebar-bg rounded p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">#{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeConditionPart(part.id)}
                    className="p-1 text-text-muted hover:text-validation-error transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Condition type selector */}
                <select
                  value={part.type}
                  onChange={(e) => updateConditionPart(part.id, { type: e.target.value as ConditionType })}
                  className="w-full text-xs"
                >
                  <option value="hasItem">Player has item</option>
                  <option value="reputation">Faction reputation</option>
                  <option value="eventTriggered">Event triggered</option>
                  <option value="custom">Custom expression</option>
                </select>

                {/* Type-specific inputs */}
                {part.type === 'hasItem' && (
                  <input
                    type="text"
                    value={part.itemName || ''}
                    onChange={(e) => updateConditionPart(part.id, { itemName: e.target.value })}
                    className="w-full text-xs"
                    placeholder="Item name (e.g., ember)"
                  />
                )}

                {part.type === 'reputation' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={part.factionName || ''}
                      onChange={(e) => updateConditionPart(part.id, { factionName: e.target.value })}
                      className="flex-1 text-xs"
                      placeholder="Faction name"
                    />
                    <select
                      value={part.operator || '>'}
                      onChange={(e) => updateConditionPart(part.id, { operator: e.target.value as ConditionOperator })}
                      className="w-16 text-xs"
                    >
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value=">=">{'>='}</option>
                      <option value="<=">{'<='}</option>
                      <option value="==">{'=='}</option>
                      <option value="!=">{'!='}</option>
                    </select>
                    <input
                      type="number"
                      value={part.value || 0}
                      onChange={(e) => updateConditionPart(part.id, { value: Number(e.target.value) })}
                      className="w-16 text-xs"
                    />
                  </div>
                )}

                {part.type === 'eventTriggered' && (
                  <input
                    type="text"
                    value={part.itemName || ''}
                    onChange={(e) => updateConditionPart(part.id, { itemName: e.target.value })}
                    className="w-full text-xs"
                    placeholder="Event name"
                  />
                )}

                {part.type === 'custom' && (
                  <input
                    type="text"
                    value={part.customExpression || ''}
                    onChange={(e) => updateConditionPart(part.id, { customExpression: e.target.value })}
                    className="w-full text-xs font-mono"
                    placeholder="JavaScript expression"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add condition buttons */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => addConditionPart('hasItem')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-sidebar-bg hover:bg-sidebar-hover rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Has Item
            </button>
            <button
              type="button"
              onClick={() => addConditionPart('reputation')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-sidebar-bg hover:bg-sidebar-hover rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Reputation
            </button>
            <button
              type="button"
              onClick={() => addConditionPart('eventTriggered')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-sidebar-bg hover:bg-sidebar-hover rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Event
            </button>
            <button
              type="button"
              onClick={() => addConditionPart('custom')}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-sidebar-bg hover:bg-sidebar-hover rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Custom
            </button>
          </div>

          {/* Preview */}
          {parts.length > 0 && (
            <div className="bg-sidebar-bg rounded p-2">
              <span className="text-xs text-text-muted">Generated:</span>
              <code className="block text-xs font-mono text-text-secondary mt-1 break-all">
                {node.condition || '(empty)'}
              </code>
            </div>
          )}
        </div>
      ) : (
        <>
          <textarea
            value={node.condition}
            onChange={(e) => onUpdate({ condition: e.target.value })}
            className="w-full text-sm h-20 font-mono"
            placeholder="e.g., player.hasItem('ember') && faction.reputation('dwarves') > 50"
          />
          <p className="text-xs text-text-muted">
            Use JavaScript-like syntax for conditions
          </p>
        </>
      )}
    </div>
  )
}

function EndNodeFields({ node, onUpdate }: { node: EndNode; onUpdate: (u: Partial<EndNode>) => void }) {
  return (
    <>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Title</label>
        <input
          type="text"
          value={node.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full text-sm"
          placeholder="Ending name"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Outcome</label>
        <select
          value={node.outcome}
          onChange={(e) => onUpdate({ outcome: e.target.value as 'SUCCESS' | 'FAILURE' | 'NEUTRAL' })}
          className="w-full text-sm"
        >
          <option value="SUCCESS">Success</option>
          <option value="FAILURE">Failure</option>
          <option value="NEUTRAL">Neutral</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
        <textarea
          value={node.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="w-full text-sm h-20"
          placeholder="What happens in this ending?"
        />
      </div>
    </>
  )
}

function AndOrNodeFields({ node, onUpdate }: { node: AndNode | OrNode; onUpdate: (u: Partial<AndNode | OrNode>) => void }) {
  const handleInputCountChange = (delta: number) => {
    const newCount = Math.max(2, node.inputCount + delta)
    onUpdate({ inputCount: newCount })
  }

  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">Number of Inputs</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleInputCountChange(-1)}
          disabled={node.inputCount <= 2}
          className="w-8 h-8 flex items-center justify-center rounded bg-sidebar-bg hover:bg-sidebar-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-bold transition-colors"
        >
          −
        </button>
        <span className="text-lg font-mono text-text-primary min-w-[2ch] text-center">
          {node.inputCount}
        </span>
        <button
          type="button"
          onClick={() => handleInputCountChange(1)}
          className="w-8 h-8 flex items-center justify-center rounded bg-sidebar-bg hover:bg-sidebar-hover text-text-primary font-bold transition-colors"
        >
          +
        </button>
      </div>
      <p className="text-xs text-text-muted mt-2">
        {node.type === 'AND' 
          ? 'All inputs must be connected for the condition to pass'
          : 'Any input being connected will allow the condition to pass'
        }
      </p>
    </div>
  )
}


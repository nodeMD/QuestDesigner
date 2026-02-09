import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Zap, Target, Search } from 'lucide-react'
import type { EventNode as EventNodeType } from '@/types'
import { NodeActions } from './NodeActions'

export const EventNode = memo(({ data, selected, id }: NodeProps) => {
  const node = data as unknown as EventNodeType
  const isTrigger = node.action === 'TRIGGER'

  return (
    <div className={`quest-node node-event group relative ${selected ? 'ring-2 ring-accent-blue' : ''}`}>
      <NodeActions nodeId={id} />
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-node-event !border-node-event"
      />

      {/* Header */}
      <div className="quest-node-header header-event">
        <Zap className="w-4 h-4" />
        <span>EVENT: {isTrigger ? 'Trigger' : 'Check'}</span>
      </div>

      {/* Event info */}
      <div className="quest-node-content">
        <div className="flex items-center gap-2 text-text-primary">
          {isTrigger ? (
            <Target className="w-4 h-4 text-node-event" />
          ) : (
            <Search className="w-4 h-4 text-node-event" />
          )}
          <span className="font-mono text-sm">
            {node.eventName || node.eventId || 'No event selected'}
          </span>
        </div>
        
        {/* Parameters preview */}
        {node.parameters && Object.keys(node.parameters).length > 0 && (
          <div className="mt-2 text-xs text-text-muted font-mono">
            {JSON.stringify(node.parameters)}
          </div>
        )}
      </div>

      {/* Output handles - different for CHECK vs TRIGGER */}
      {isTrigger ? (
        // Single output for TRIGGER
        <div className="quest-node-options">
          <div className="quest-node-option">
            <span className="text-text-muted">→ Continue</span>
            <Handle
              type="source"
              position={Position.Right}
              className="!bg-node-event !border-node-event"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
        </div>
      ) : (
        // True/False outputs for CHECK
        <div className="quest-node-options">
          <div className="quest-node-option">
            <span className="text-node-start">✓ Triggered</span>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!bg-node-start !border-node-start"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
          <div className="quest-node-option">
            <span className="text-node-end">✗ Not triggered</span>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!bg-node-end !border-node-end"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
})

EventNode.displayName = 'EventNode'


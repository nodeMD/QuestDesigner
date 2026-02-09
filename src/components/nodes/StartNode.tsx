import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Play, MapPin, User } from 'lucide-react'
import type { StartNode as StartNodeType } from '@/types'

export const StartNode = memo(({ data, selected }: NodeProps) => {
  const node = data as unknown as StartNodeType

  return (
    <div className={`quest-node node-start ${selected ? 'ring-2 ring-accent-blue' : ''}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-node-start !border-node-start"
      />

      {/* Header */}
      <div className="quest-node-header header-start">
        <Play className="w-4 h-4" />
        <span>START</span>
      </div>

      {/* Meta info */}
      {(node.location?.name || node.npc?.name) && (
        <div className="px-3 py-2 border-b border-panel-border space-y-1">
          {node.location?.name && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <MapPin className="w-3 h-3" />
              <span>{node.location.name}</span>
              {(node.location.x !== undefined || node.location.z !== undefined) && (
                <span className="text-text-muted">
                  ({node.location.x}, {node.location.y}, {node.location.z})
                </span>
              )}
            </div>
          )}
          {node.npc?.name && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <User className="w-3 h-3" />
              <span>{node.npc.name}</span>
              {node.npc.type && (
                <span className="text-text-muted">({node.npc.type})</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="quest-node-content">
        <p className="text-text-primary text-sm line-clamp-3">
          "{node.description}"
        </p>
      </div>

      {/* Options */}
      {node.options.length > 0 && (
        <div className="quest-node-options">
          {node.options.map((option) => (
            <div key={option.id} className="quest-node-option">
              <span>{option.label}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={option.id}
                className="!bg-node-start !border-node-start"
                style={{ top: 'auto', position: 'relative', transform: 'none' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

StartNode.displayName = 'StartNode'


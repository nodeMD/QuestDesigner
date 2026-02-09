import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { MessageSquare, User } from 'lucide-react'
import type { DialogueNode as DialogueNodeType } from '@/types'
import { NodeActions } from './NodeActions'

export const DialogueNode = memo(({ data, selected, id }: NodeProps) => {
  const node = data as unknown as DialogueNodeType

  return (
    <div
      className={`quest-node node-dialogue group relative ${selected ? 'ring-2 ring-accent-blue' : ''}`}
    >
      <NodeActions nodeId={id} />
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-node-dialogue !border-node-dialogue"
      />

      {/* Header */}
      <div className="quest-node-header header-dialogue">
        <MessageSquare className="w-4 h-4" />
        <span>DIALOGUE</span>
      </div>

      {/* Speaker */}
      {node.speaker && (
        <div className="px-3 py-2 border-b border-panel-border">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <User className="w-3 h-3" />
            <span>{node.speaker}</span>
          </div>
        </div>
      )}

      {/* Text content */}
      <div className="quest-node-content">
        <p className="text-text-primary text-sm line-clamp-4">"{node.text}"</p>
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
                className="!bg-node-dialogue !border-node-dialogue"
                style={{ top: 'auto', position: 'relative', transform: 'none' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

DialogueNode.displayName = 'DialogueNode'

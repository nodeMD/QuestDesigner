import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { GitBranch } from 'lucide-react'
import type { ChoiceNode as ChoiceNodeType } from '@/types'
import { NodeActions } from './NodeActions'

export const ChoiceNode = memo(({ data, selected, id }: NodeProps) => {
  const node = data as unknown as ChoiceNodeType

  return (
    <div
      className={`quest-node node-choice group relative ${selected ? 'ring-2 ring-accent-blue' : ''}`}
    >
      <NodeActions nodeId={id} />
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-node-choice !border-node-choice"
      />

      {/* Header */}
      <div className="quest-node-header header-choice">
        <GitBranch className="w-4 h-4" />
        <span>CHOICE</span>
      </div>

      {/* Prompt */}
      {node.prompt && (
        <div className="quest-node-content">
          <p className="text-text-primary text-sm">{node.prompt}</p>
        </div>
      )}

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
                className="!bg-node-choice !border-node-choice"
                style={{ top: 'auto', position: 'relative', transform: 'none' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

ChoiceNode.displayName = 'ChoiceNode'

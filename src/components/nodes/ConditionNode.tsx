import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { HelpCircle, GitMerge, GitPullRequest } from 'lucide-react'
import type { IfNode, AndNode, OrNode } from '@/types'

type ConditionNodeType = IfNode | AndNode | OrNode

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const node = data as unknown as ConditionNodeType
  const isIf = node.type === 'IF'
  const isAnd = node.type === 'AND'
  const isOr = node.type === 'OR'

  const Icon = isIf ? HelpCircle : isAnd ? GitMerge : GitPullRequest
  const label = isIf ? 'IF' : isAnd ? 'AND' : 'OR'

  return (
    <div className={`quest-node node-condition ${selected ? 'ring-2 ring-accent-blue' : ''}`}>
      {/* Input handle(s) */}
      {(isAnd || isOr) ? (
        // Multiple inputs for AND/OR
        <>
          {Array.from({ length: (node as AndNode | OrNode).inputCount }).map((_, i) => (
            <Handle
              key={i}
              type="target"
              position={Position.Left}
              id={`input-${i}`}
              className="!bg-node-condition !border-node-condition"
              style={{ top: `${30 + (i * 24)}px` }}
            />
          ))}
        </>
      ) : (
        // Single input for IF
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-node-condition !border-node-condition"
        />
      )}

      {/* Header */}
      <div className="quest-node-header header-condition">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>

      {/* Content */}
      <div className="quest-node-content">
        {isIf && (
          <p className="font-mono text-sm text-text-primary">
            {(node as IfNode).condition || 'No condition set'}
          </p>
        )}
        {(isAnd || isOr) && (
          <p className="text-sm text-text-secondary">
            {isAnd ? 'All inputs must pass' : 'Any input can pass'}
          </p>
        )}
      </div>

      {/* Output handles */}
      {isIf ? (
        // True/False outputs for IF
        <div className="quest-node-options">
          <div className="quest-node-option">
            <span className="text-node-start">✓ True</span>
            <Handle
              type="source"
              position={Position.Right}
              id="true"
              className="!bg-node-start !border-node-start"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
          <div className="quest-node-option">
            <span className="text-node-end">✗ False</span>
            <Handle
              type="source"
              position={Position.Right}
              id="false"
              className="!bg-node-end !border-node-end"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
        </div>
      ) : (
        // Single output for AND/OR
        <div className="quest-node-options">
          <div className="quest-node-option">
            <span className="text-text-muted">→ Output</span>
            <Handle
              type="source"
              position={Position.Right}
              className="!bg-node-condition !border-node-condition"
              style={{ top: 'auto', position: 'relative', transform: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  )
})

ConditionNode.displayName = 'ConditionNode'


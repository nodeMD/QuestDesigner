import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Square, Trophy, XCircle, Minus, Gift, Users } from 'lucide-react'
import type { EndNode as EndNodeType } from '@/types'
import { NodeActions } from './NodeActions'

export const EndNode = memo(({ data, selected, id }: NodeProps) => {
  const node = data as unknown as EndNodeType

  const OutcomeIcon =
    node.outcome === 'SUCCESS' ? Trophy : node.outcome === 'FAILURE' ? XCircle : Minus

  const outcomeColor =
    node.outcome === 'SUCCESS'
      ? 'text-node-start'
      : node.outcome === 'FAILURE'
        ? 'text-node-end'
        : 'text-text-secondary'

  return (
    <div
      className={`quest-node node-end group relative ${selected ? 'ring-2 ring-accent-blue' : ''}`}
    >
      <NodeActions nodeId={id} />
      {/* Input handle */}
      <Handle type="target" position={Position.Left} className="!bg-node-end !border-node-end" />

      {/* Header */}
      <div className="quest-node-header header-end">
        <Square className="w-4 h-4" />
        <span>END</span>
        <OutcomeIcon className={`w-4 h-4 ml-auto ${outcomeColor}`} />
      </div>

      {/* Title */}
      <div className="quest-node-content">
        <p className="text-text-primary font-medium">{node.title}</p>
        {node.description && (
          <p className="text-text-secondary text-sm mt-1 line-clamp-4">{node.description}</p>
        )}
      </div>

      {/* Rewards */}
      {node.rewards && node.rewards.length > 0 && (
        <div className="px-3 py-2 border-t border-panel-border">
          <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
            <Gift className="w-3 h-3" />
            <span>Rewards</span>
          </div>
          {node.rewards.map((reward, i) => (
            <div key={i} className="text-xs text-node-start">
              +{reward.quantity || 1} {reward.value}
            </div>
          ))}
        </div>
      )}

      {/* Faction changes */}
      {node.factionChanges && node.factionChanges.length > 0 && (
        <div className="px-3 py-2 border-t border-panel-border">
          <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
            <Users className="w-3 h-3" />
            <span>Reputation</span>
          </div>
          {node.factionChanges.map((change, i) => (
            <div
              key={i}
              className={`text-xs ${change.change >= 0 ? 'text-node-start' : 'text-node-end'}`}
            >
              {change.factionName}: {change.change >= 0 ? '+' : ''}
              {change.change}
            </div>
          ))}
        </div>
      )}

      {/* Triggered events */}
      {node.triggeredEvents && node.triggeredEvents.length > 0 && (
        <div className="px-3 py-2 border-t border-panel-border">
          <div className="text-xs text-text-muted">Triggers: {node.triggeredEvents.join(', ')}</div>
        </div>
      )}
    </div>
  )
})

EndNode.displayName = 'EndNode'

import { useEffect, useCallback } from 'react'
import {
  X,
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flag,
  MessageSquare,
  HelpCircle,
  GitBranch,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import type { QuestNode, Connection } from '@/types'

export function SimulationPanel() {
  const {
    isSimulationOpen,
    simulationNodeId,
    simulationHistory,
    stopSimulation,
    goToNode,
    goBack,
    focusOnNode,
  } = useUIStore()

  const { getCurrentQuest } = useProjectStore()
  const currentQuest = getCurrentQuest()

  const currentNode = currentQuest?.nodes.find((n) => n.id === simulationNodeId)

  // Focus on current node when it changes
  useEffect(() => {
    if (simulationNodeId && isSimulationOpen) {
      focusOnNode(simulationNodeId)
    }
  }, [simulationNodeId, isSimulationOpen, focusOnNode])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isSimulationOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSimulation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSimulationOpen, stopSimulation])

  // Get outgoing connections from current node
  const getOutgoingConnections = useCallback(
    (nodeId: string): Connection[] => {
      if (!currentQuest) return []
      return currentQuest.connections.filter((c) => c.sourceNodeId === nodeId)
    },
    [currentQuest]
  )

  // Handle selecting an option/choice
  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (!currentNode || !currentQuest) return

      // Find connection for this option
      const connection = currentQuest.connections.find(
        (c) => c.sourceNodeId === currentNode.id && c.sourceOptionId === optionId
      )

      if (connection) {
        goToNode(connection.targetNodeId)
      }
    },
    [currentNode, currentQuest, goToNode]
  )

  // Handle continuing to next node (for nodes without options)
  const handleContinue = useCallback(() => {
    if (!currentNode || !currentQuest) return

    const connections = getOutgoingConnections(currentNode.id)
    if (connections.length === 1) {
      goToNode(connections[0].targetNodeId)
    }
  }, [currentNode, currentQuest, getOutgoingConnections, goToNode])

  // Handle condition branch selection
  const handleConditionBranch = useCallback(
    (branch: 'true' | 'false') => {
      if (!currentNode || !currentQuest) return

      const connection = currentQuest.connections.find(
        (c) => c.sourceNodeId === currentNode.id && c.sourceOutput === branch
      )

      if (connection) {
        goToNode(connection.targetNodeId)
      }
    },
    [currentNode, currentQuest, goToNode]
  )

  if (!isSimulationOpen) return null

  const outgoingConnections = currentNode ? getOutgoingConnections(currentNode.id) : []
  const canContinue = outgoingConnections.length === 1 && !('options' in currentNode!)
  const isEndNode = currentNode?.type === 'END'

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[500px] max-w-[90vw]">
      <div className="bg-panel-bg border border-panel-border rounded-lg shadow-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-panel-border bg-sidebar-bg">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-node-start" />
            <span className="text-sm font-medium text-text-primary">Quest Preview</span>
            <span className="text-xs text-text-muted">Step {simulationHistory.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goBack}
              disabled={simulationHistory.length <= 1}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-sidebar-hover 
                         rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={stopSimulation}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-sidebar-hover rounded transition-colors"
              title="Close preview (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!currentNode ? (
            <div className="text-center text-text-muted py-8">No node selected</div>
          ) : (
            <div className="space-y-4">
              {/* Node type indicator */}
              <div className="flex items-center gap-2">
                {getNodeIcon(currentNode.type)}
                <span className="text-xs text-text-muted uppercase tracking-wide">
                  {currentNode.type}
                </span>
              </div>

              {/* Node content based on type */}
              {renderNodeContent(currentNode, handleSelectOption, handleConditionBranch)}

              {/* Continue button for simple nodes */}
              {canContinue && !isEndNode && (
                <button
                  onClick={handleContinue}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-accent-blue hover:bg-accent-hover text-white rounded-md 
                             transition-colors"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* End node - restart option */}
              {isEndNode && (
                <div className="pt-4 border-t border-panel-border">
                  <button
                    onClick={stopSimulation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 
                               bg-panel-border hover:bg-sidebar-hover text-text-primary 
                               rounded-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    End Preview
                  </button>
                </div>
              )}

              {/* No connections warning */}
              {outgoingConnections.length === 0 && !isEndNode && (
                <div
                  className="text-sm text-validation-warning bg-validation-warning/10 
                                px-3 py-2 rounded-md"
                >
                  ⚠️ This node has no outgoing connections
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getNodeIcon(type: string) {
  const iconClass = 'w-4 h-4'
  switch (type) {
    case 'START':
      return <Play className={`${iconClass} text-node-start`} />
    case 'DIALOGUE':
      return <MessageSquare className={`${iconClass} text-node-dialogue`} />
    case 'CHOICE':
      return <HelpCircle className={`${iconClass} text-node-choice`} />
    case 'EVENT':
      return <Zap className={`${iconClass} text-node-event`} />
    case 'IF':
    case 'AND':
    case 'OR':
      return <GitBranch className={`${iconClass} text-node-condition`} />
    case 'END':
      return <Flag className={`${iconClass} text-node-end`} />
    default:
      return null
  }
}

function renderNodeContent(
  node: QuestNode,
  onSelectOption: (optionId: string) => void,
  onConditionBranch: (branch: 'true' | 'false') => void
) {
  switch (node.type) {
    case 'START':
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">{node.title}</h3>
          {node.description && <p className="text-sm text-text-secondary">{node.description}</p>}
          {node.npc?.name && (
            <p className="text-xs text-text-muted">Quest giver: {node.npc.name}</p>
          )}
          {node.options && node.options.length > 0 && (
            <div className="space-y-2 pt-2">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option.id)}
                  className="w-full text-left px-3 py-2 bg-sidebar-bg hover:bg-sidebar-hover 
                             border border-panel-border rounded-md text-sm text-text-primary 
                             transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )

    case 'DIALOGUE':
      return (
        <div className="space-y-2">
          {node.speaker && <p className="text-xs font-medium text-accent-blue">{node.speaker}</p>}
          <p className="text-sm text-text-primary leading-relaxed">
            {node.text || <span className="text-text-muted italic">No dialogue text</span>}
          </p>
          {node.options && node.options.length > 0 && (
            <div className="space-y-2 pt-2">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option.id)}
                  className="w-full text-left px-3 py-2 bg-sidebar-bg hover:bg-sidebar-hover 
                             border border-panel-border rounded-md text-sm text-text-primary 
                             transition-colors"
                >
                  ▸ {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )

    case 'CHOICE':
      return (
        <div className="space-y-2">
          {node.prompt && <p className="text-sm text-text-secondary italic">{node.prompt}</p>}
          {node.options && node.options.length > 0 && (
            <div className="space-y-2">
              {node.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option.id)}
                  className="w-full text-left px-3 py-2 bg-sidebar-bg hover:bg-sidebar-hover 
                             border border-panel-border rounded-md text-sm text-text-primary 
                             transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )

    case 'EVENT':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs rounded ${
                node.action === 'TRIGGER'
                  ? 'bg-node-event/20 text-node-event'
                  : 'bg-node-condition/20 text-node-condition'
              }`}
            >
              {node.action}
            </span>
            <span className="text-sm text-text-primary">{node.eventName || 'Unknown Event'}</span>
          </div>
          {node.parameters && Object.keys(node.parameters).length > 0 && (
            <div className="text-xs text-text-muted">
              Parameters: {JSON.stringify(node.parameters)}
            </div>
          )}
        </div>
      )

    case 'IF':
      return (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-text-muted mb-1">Condition:</p>
            <code className="text-sm text-node-condition bg-sidebar-bg px-2 py-1 rounded block">
              {node.condition || 'No condition set'}
            </code>
          </div>
          <p className="text-xs text-text-muted">Choose the result:</p>
          <div className="flex gap-2">
            <button
              onClick={() => onConditionBranch('true')}
              className="flex-1 px-3 py-2 bg-node-start/20 hover:bg-node-start/30 
                         text-node-start rounded-md text-sm transition-colors"
            >
              ✓ True
            </button>
            <button
              onClick={() => onConditionBranch('false')}
              className="flex-1 px-3 py-2 bg-node-end/20 hover:bg-node-end/30 
                         text-node-end rounded-md text-sm transition-colors"
            >
              ✗ False
            </button>
          </div>
        </div>
      )

    case 'AND':
    case 'OR':
      return (
        <div className="space-y-2">
          <p className="text-sm text-text-secondary">
            {node.type === 'AND'
              ? 'All inputs must be satisfied'
              : 'At least one input must be satisfied'}
          </p>
          <p className="text-xs text-text-muted">Inputs: {node.inputCount}</p>
        </div>
      )

    case 'END':
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">{node.title}</h3>
          <div
            className={`inline-block px-2 py-0.5 text-xs rounded ${
              node.outcome === 'SUCCESS'
                ? 'bg-node-start/20 text-node-start'
                : node.outcome === 'FAILURE'
                  ? 'bg-node-end/20 text-node-end'
                  : 'bg-text-muted/20 text-text-muted'
            }`}
          >
            {node.outcome}
          </div>
          {node.description && <p className="text-sm text-text-secondary">{node.description}</p>}
          {node.rewards && node.rewards.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-text-muted mb-1">Rewards:</p>
              <ul className="text-sm text-text-primary space-y-1">
                {node.rewards.map((reward, i) => (
                  <li key={i}>
                    • {reward.type}: {reward.value} {reward.quantity && `x${reward.quantity}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )

    default:
      return (
        <div className="text-text-muted">Unknown node type: {(node as { type: string }).type}</div>
      )
  }
}

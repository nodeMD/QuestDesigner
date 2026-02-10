import { useCallback, useMemo, useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
  OnConnect,
  NodeChange,
  EdgeChange,
  useReactFlow,
  applyNodeChanges,
} from '@xyflow/react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { StartNode } from '@/components/nodes/StartNode'
import { DialogueNode } from '@/components/nodes/DialogueNode'
import { ChoiceNode } from '@/components/nodes/ChoiceNode'
import { EventNode } from '@/components/nodes/EventNode'
import { ConditionNode } from '@/components/nodes/ConditionNode'
import { EndNode } from '@/components/nodes/EndNode'
import { DeletableEdge } from '@/components/edges/DeletableEdge'
import type { QuestNode } from '@/types'

// Register custom node types
const nodeTypes: NodeTypes = {
  START: StartNode,
  DIALOGUE: DialogueNode,
  CHOICE: ChoiceNode,
  EVENT: EventNode,
  IF: ConditionNode,
  AND: ConditionNode,
  OR: ConditionNode,
  END: EndNode,
}

// Register custom edge types
const edgeTypes: EdgeTypes = {
  deletable: DeletableEdge,
}

// Convert our nodes to React Flow nodes
function questNodeToFlowNode(node: QuestNode): Node {
  return {
    id: node.id,
    type: node.type,
    position: node.position,
    data: node as unknown as Record<string, unknown>,
  }
}

// Get edge color based on source node type
function getEdgeColor(nodeType: string): string {
  const colors: Record<string, string> = {
    START: '#22c55e',
    DIALOGUE: '#3b82f6',
    CHOICE: '#a855f7',
    EVENT: '#f97316',
    IF: '#06b6d4',
    AND: '#06b6d4',
    OR: '#06b6d4',
    END: '#f43f5e',
  }
  return colors[nodeType] || '#666666'
}

// Get a short label for an edge (option text or True/False) so users can tell outputs apart
function getEdgeLabel(
  conn: { sourceOptionId?: string; sourceOutput?: string },
  sourceNode: QuestNode | undefined
): string {
  if (conn.sourceOutput) {
    return conn.sourceOutput === 'true' ? 'True' : 'False'
  }
  if (conn.sourceOptionId && sourceNode && 'options' in sourceNode && Array.isArray(sourceNode.options)) {
    const opt = sourceNode.options.find((o: { id: string }) => o.id === conn.sourceOptionId)
    if (opt && 'label' in opt) return (opt.label as string).slice(0, 32)
  }
  return ''
}

export function Canvas() {
  const {
    project,
    currentQuestId,
    addConnection,
    deleteConnection,
    updateNode,
    selectedNodeId,
    selectNode,
  } = useProjectStore()
  const {
    openContextMenu,
    openEditPanel,
    focusNodeId,
    clearFocusNode,
    searchResultNodeIds,
    simulationNodeId,
    isSimulationOpen,
  } = useUIStore()
  const { setCenter, getZoom } = useReactFlow()

  const currentQuest = project?.quests.find((q) => q.id === currentQuestId)

  // Local state for nodes - allows React Flow to control dragging smoothly
  const [nodes, setNodes] = useState<Node[]>([])

  // Sync nodes from store to local state when quest changes
  useEffect(() => {
    if (currentQuest) {
      setNodes(
        currentQuest.nodes.map((node) => {
          const flowNode = questNodeToFlowNode(node)
          // Add highlight classes
          const classNames: string[] = []

          // Search highlight
          if (searchResultNodeIds.includes(node.id)) {
            classNames.push('search-match')
          }

          // Simulation highlight
          if (isSimulationOpen && simulationNodeId === node.id) {
            classNames.push('simulation-active')
          }

          if (classNames.length > 0) {
            flowNode.className = classNames.join(' ')
          }
          return flowNode
        })
      )
    } else {
      setNodes([])
    }
  }, [currentQuest, searchResultNodeIds, simulationNodeId, isSimulationOpen])

  // Pan to focused node when focusNodeId changes
  useEffect(() => {
    if (focusNodeId && currentQuest) {
      const node = currentQuest.nodes.find((n) => n.id === focusNodeId)
      if (node) {
        // Center the viewport on the node with a smooth animation
        const zoom = getZoom()
        setCenter(
          node.position.x + 100, // Add half the node width (~200px) to center it
          node.position.y + 50, // Add some offset for the node height
          { zoom: Math.max(zoom, 0.8), duration: 500 }
        )
        // Clear the focus after panning
        setTimeout(() => clearFocusNode(), 600)
      }
    }
  }, [focusNodeId, currentQuest, setCenter, getZoom, clearFocusNode])

  const flowEdges = useMemo(() => {
    if (!currentQuest) return []
    return currentQuest.connections.map((conn) => {
      const sourceNode = currentQuest.nodes.find((n) => n.id === conn.sourceNodeId)
      return {
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        sourceHandle: conn.sourceOptionId || conn.sourceOutput,
        targetHandle: conn.targetHandle,
        type: 'deletable',
        data: { label: getEdgeLabel(conn, sourceNode) },
        style: {
          stroke: getEdgeColor(sourceNode?.type || ''),
        },
        animated: true,
      }
    })
  }, [currentQuest])

  // Handle node changes (position, selection)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out 'remove' changes - we handle deletion through our own modal/confirmation flow
      const filteredChanges = changes.filter((change) => change.type !== 'remove')

      // Apply filtered changes to local state for smooth UI updates
      setNodes((nds) => applyNodeChanges(filteredChanges, nds))

      // Handle specific changes
      filteredChanges.forEach((change) => {
        // Persist position to store only when drag ends
        if (change.type === 'position' && change.dragging === false && change.position) {
          updateNode(change.id, { position: change.position })
        }
        // Handle selection
        if (change.type === 'select') {
          if (change.selected) {
            selectNode(change.id)
          } else if (selectedNodeId === change.id) {
            selectNode(null)
          }
        }
      })
    },
    [updateNode, selectNode, selectedNodeId]
  )

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        // Find source node to determine connection type
        const sourceNode = currentQuest?.nodes.find((n) => n.id === connection.source)
        const sourceHandleId = connection.sourceHandle || undefined
        const targetHandleId = connection.targetHandle || undefined

        // IF, AND, OR, and EVENT CHECK nodes use sourceOutput for true/false handles
        const usesSourceOutput =
          sourceNode &&
          (sourceNode.type === 'IF' ||
            sourceNode.type === 'AND' ||
            sourceNode.type === 'OR' ||
            (sourceNode.type === 'EVENT' && sourceNode.action === 'CHECK'))

        addConnection({
          sourceNodeId: connection.source,
          sourceOptionId: usesSourceOutput ? undefined : sourceHandleId,
          sourceOutput: usesSourceOutput ? sourceHandleId : undefined,
          targetNodeId: connection.target,
          targetHandle: targetHandleId,
        })
      }
    },
    [addConnection, currentQuest]
  )

  // Handle edge deletion
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteConnection(change.id)
        }
      })
    },
    [deleteConnection]
  )

  // Handle context menu (right-click)
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()

      // Get canvas-relative position
      const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect()
      if (!bounds) return

      openContextMenu('canvas', {
        x: event.clientX,
        y: event.clientY,
      })
    },
    [openContextMenu]
  )

  // Handle node double-click to open edit panel
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      openEditPanel(node.id)
    },
    [openEditPanel]
  )

  // Empty state
  if (!currentQuest) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center">
          <p className="text-lg mb-2">No quest selected</p>
          <p className="text-sm">Create or select a quest from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={flowEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onContextMenu={onContextMenu}
      onNodeDoubleClick={onNodeDoubleClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ maxZoom: 1 }}
      snapToGrid
      snapGrid={[20, 20]}
      minZoom={0.1}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'deletable',
        animated: true,
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#2a2a2a" />
      <Controls showZoom showFitView showInteractive={false} position="bottom-right" />
      <MiniMap
        nodeColor={(node) => getEdgeColor(node.type || '')}
        maskColor="rgba(0, 0, 0, 0.8)"
        position="bottom-left"
      />
    </ReactFlow>
  )
}

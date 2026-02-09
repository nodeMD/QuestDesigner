import type { Quest, QuestNode, Position } from '@/types'

interface LayoutOptions {
  direction?: 'TB' | 'LR' // Top-Bottom or Left-Right
  nodeWidth?: number
  nodeHeight?: number
  horizontalSpacing?: number
  verticalSpacing?: number
}

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  direction: 'TB',
  nodeWidth: 300,
  nodeHeight: 120,
  horizontalSpacing: 80,
  verticalSpacing: 140,
}

interface LayoutNode {
  id: string
  level: number
  index: number
  width: number
  height: number
  children: string[]
  parents: string[]
}

/**
 * Auto-layout nodes in a quest using a simple hierarchical algorithm
 * Returns new positions for each node
 */
export function autoLayoutQuest(quest: Quest, options: LayoutOptions = {}): Map<string, Position> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (quest.nodes.length === 0) {
    return new Map()
  }

  // Build adjacency lists
  const layoutNodes = new Map<string, LayoutNode>()

  // Initialize nodes
  quest.nodes.forEach((node) => {
    layoutNodes.set(node.id, {
      id: node.id,
      level: -1,
      index: 0,
      width: opts.nodeWidth,
      height: getNodeHeight(node),
      children: [],
      parents: [],
    })
  })

  // Build parent-child relationships from connections
  quest.connections.forEach((conn) => {
    const source = layoutNodes.get(conn.sourceNodeId)
    const target = layoutNodes.get(conn.targetNodeId)
    if (source && target) {
      source.children.push(conn.targetNodeId)
      target.parents.push(conn.sourceNodeId)
    }
  })

  // Find root nodes (nodes with no parents)
  const roots: string[] = []
  layoutNodes.forEach((node) => {
    if (node.parents.length === 0) {
      roots.push(node.id)
    }
  })

  // If no roots found, use first node
  if (roots.length === 0 && quest.nodes.length > 0) {
    roots.push(quest.nodes[0].id)
  }

  // Assign levels using BFS
  const visited = new Set<string>()
  const queue: { id: string; level: number }[] = roots.map((id) => ({ id, level: 0 }))

  while (queue.length > 0) {
    const { id, level } = queue.shift()!

    if (visited.has(id)) continue
    visited.add(id)

    const node = layoutNodes.get(id)
    if (!node) continue

    node.level = Math.max(node.level, level)

    node.children.forEach((childId) => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 })
      }
    })
  }

  // Handle disconnected nodes
  layoutNodes.forEach((node) => {
    if (node.level === -1) {
      node.level = 0
    }
  })

  // Group nodes by level
  const levels = new Map<number, string[]>()
  layoutNodes.forEach((node) => {
    const levelNodes = levels.get(node.level) || []
    levelNodes.push(node.id)
    levels.set(node.level, levelNodes)
  })

  // Assign indices within each level
  levels.forEach((nodeIds, _level) => {
    nodeIds.forEach((id, index) => {
      const node = layoutNodes.get(id)
      if (node) {
        node.index = index
      }
    })
  })

  // Calculate positions
  const positions = new Map<string, Position>()
  const maxNodesInLevel = Math.max(...Array.from(levels.values()).map((n) => n.length))

  layoutNodes.forEach((node) => {
    const levelNodes = levels.get(node.level) || []
    const nodesInLevel = levelNodes.length

    // Calculate total width of this level
    const totalWidth = nodesInLevel * opts.nodeWidth + (nodesInLevel - 1) * opts.horizontalSpacing

    // Center the level horizontally
    const startX = -totalWidth / 2 + opts.nodeWidth / 2

    let x: number
    let y: number

    if (opts.direction === 'TB') {
      x = startX + node.index * (opts.nodeWidth + opts.horizontalSpacing)
      y = node.level * (opts.nodeHeight + opts.verticalSpacing)
    } else {
      // Left to Right
      x = node.level * (opts.nodeWidth + opts.horizontalSpacing)
      y = startX + node.index * (opts.nodeHeight + opts.verticalSpacing)
    }

    // Add some base offset so nodes don't start at negative coordinates
    const offsetX = (maxNodesInLevel * (opts.nodeWidth + opts.horizontalSpacing)) / 2 + 50
    const offsetY = 50

    positions.set(node.id, {
      x: x + offsetX,
      y: y + offsetY,
    })
  })

  return positions
}

/**
 * Get estimated height for a node based on its type and content
 */
function getNodeHeight(node: QuestNode): number {
  const baseHeight = 80

  switch (node.type) {
    case 'START':
      return baseHeight

    case 'DIALOGUE': {
      const dialogueNode = node as { options?: unknown[] }
      const optionCount = dialogueNode.options?.length || 0
      return baseHeight + Math.max(0, optionCount - 1) * 30
    }

    case 'CHOICE': {
      const choiceNode = node as { options?: unknown[] }
      const choiceCount = choiceNode.options?.length || 0
      return baseHeight + Math.max(0, choiceCount - 1) * 30
    }

    case 'IF':
    case 'AND':
    case 'OR': {
      const conditionNode = node as { inputCount?: number }
      const inputCount = conditionNode.inputCount || 2
      return baseHeight + Math.max(0, inputCount - 2) * 20
    }

    case 'EVENT':
      return baseHeight + 20

    case 'END':
      return baseHeight

    default:
      return baseHeight
  }
}

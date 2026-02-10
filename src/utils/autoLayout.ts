import type { Quest, QuestNode, Position } from '@/types'

/** Measured dimensions from the DOM (provided by React Flow) */
export interface MeasuredNodeDimensions {
  width: number
  height: number
}

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
  nodeHeight: 150,
  horizontalSpacing: 80,
  verticalSpacing: 60,
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
 * Auto-layout nodes in a quest using a simple hierarchical algorithm.
 * Returns new positions for each node.
 *
 * @param quest - The quest to layout
 * @param measuredDimensions - Actual DOM-measured node sizes from React Flow (preferred)
 * @param options - Layout configuration overrides
 */
export function autoLayoutQuest(
  quest: Quest,
  measuredDimensions?: Map<string, MeasuredNodeDimensions>,
  options: LayoutOptions = {}
): Map<string, Position> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (quest.nodes.length === 0) {
    return new Map()
  }

  // Build adjacency lists
  const layoutNodes = new Map<string, LayoutNode>()

  // Initialize nodes - prefer DOM-measured dimensions, fall back to estimates
  quest.nodes.forEach((node) => {
    const measured = measuredDimensions?.get(node.id)
    layoutNodes.set(node.id, {
      id: node.id,
      level: -1,
      index: 0,
      width: measured?.width || opts.nodeWidth,
      height: measured?.height || getNodeHeight(node),
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

  // Calculate the maximum height for each level based on actual node content
  const maxLevel = Math.max(...Array.from(levels.keys()))
  const levelMaxHeights = new Map<number, number>()
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const nodeIds = levels.get(lvl) || []
    let maxH = 0
    nodeIds.forEach((id) => {
      const n = layoutNodes.get(id)
      if (n) {
        maxH = Math.max(maxH, n.height)
      }
    })
    // Use at least a sensible minimum for empty/tiny nodes
    levelMaxHeights.set(lvl, Math.max(maxH, 80))
  }

  // Pre-compute cumulative Y offsets per level based on actual max heights
  const levelYOffset = new Map<number, number>()
  let cumulativeY = 0
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    levelYOffset.set(lvl, cumulativeY)
    const levelH = levelMaxHeights.get(lvl) || opts.nodeHeight
    cumulativeY += levelH + opts.verticalSpacing
  }

  // Per-level total width (sum of node widths + gaps) for horizontal centering
  const levelTotalWidth = new Map<number, number>()
  let maxTotalLevelWidth = 0
  for (let lvl = 0; lvl <= maxLevel; lvl++) {
    const nodeIds = levels.get(lvl) || []
    let totalW = 0
    nodeIds.forEach((id) => {
      const n = layoutNodes.get(id)
      if (n) totalW += n.width
    })
    totalW += (nodeIds.length - 1) * opts.horizontalSpacing
    levelTotalWidth.set(lvl, totalW)
    maxTotalLevelWidth = Math.max(maxTotalLevelWidth, totalW)
  }

  const offsetX = maxTotalLevelWidth / 2 + 50
  const offsetY = 50

  // Calculate positions: use each node's actual width for horizontal placement
  const positions = new Map<string, Position>()

  if (opts.direction === 'TB') {
    layoutNodes.forEach((node) => {
      const levelNodes = levels.get(node.level) || []
      const totalWidth = levelTotalWidth.get(node.level) || 0
      const startX = -totalWidth / 2

      // Cumulative X: sum of widths of all nodes before this one in the level + gaps
      let cumulativeX = 0
      for (let i = 0; i < node.index; i++) {
        const n = layoutNodes.get(levelNodes[i])
        if (n) cumulativeX += n.width + opts.horizontalSpacing
      }

      const x = startX + cumulativeX + offsetX
      const y = (levelYOffset.get(node.level) || 0) + offsetY

      positions.set(node.id, { x, y })
    })
  } else {
    // Left to Right: level = x (column), index = y (stack within column); use variable heights per level
    const levelTotalHeight = new Map<number, number>()
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      const nodeIds = levels.get(lvl) || []
      let totalH = 0
      nodeIds.forEach((id) => {
        const n = layoutNodes.get(id)
        if (n) totalH += n.height
      })
      totalH += (nodeIds.length - 1) * opts.verticalSpacing
      levelTotalHeight.set(lvl, totalH)
    }
    layoutNodes.forEach((node) => {
      const levelNodes = levels.get(node.level) || []
      const totalHeight = levelTotalHeight.get(node.level) || 0
      const startY = -totalHeight / 2
      let cumulativeY = 0
      for (let i = 0; i < node.index; i++) {
        const n = layoutNodes.get(levelNodes[i])
        if (n) cumulativeY += n.height + opts.verticalSpacing
      }
      const x = (levelYOffset.get(node.level) || 0) + offsetX
      const y = startY + cumulativeY + offsetY
      positions.set(node.id, { x, y })
    })
  }

  return positions
}

/**
 * Estimate how many lines a text block will take given a container width.
 * Uses ~6px average character width for Inter font at text-sm (14px).
 * This is deliberately conservative (fewer chars per line = more lines)
 * so that the layout slightly overestimates rather than underestimates.
 */
function estimateTextLines(text: string, containerWidth: number): number {
  if (!text) return 0
  const charsPerLine = Math.max(1, Math.floor(containerWidth / 6))
  return Math.ceil(text.length / charsPerLine)
}

// Node content area width: max-width 260px minus horizontal padding (px-3 = 12px * 2)
const NODE_CONTENT_WIDTH = 260 - 24
// Line height for text-sm in Tailwind (1.25rem = 20px)
const LINE_HEIGHT = 20

/**
 * Get estimated height for a node based on its type and content
 */
function getNodeHeight(node: QuestNode): number {
  // Header (~36px) + border/padding overhead (~8px)
  const headerHeight = 44

  switch (node.type) {
    case 'START': {
      const startNode = node as {
        description?: string
        location?: { name?: string }
        npc?: { name?: string }
        options?: unknown[]
      }
      let h = headerHeight
      // Location + NPC meta rows (rendered as compact info lines)
      if (startNode.location?.name || startNode.npc?.name) {
        let metaH = 16 // py-2 padding top+bottom
        if (startNode.location?.name) metaH += 20
        if (startNode.npc?.name) metaH += 20
        h += metaH
      }
      // Description text
      const descLines = estimateTextLines(startNode.description || '', NODE_CONTENT_WIDTH)
      h += descLines * LINE_HEIGHT + 16 // padding
      // Options
      const optCount = startNode.options?.length || 0
      h += optCount * 30
      return Math.max(80, h)
    }

    case 'DIALOGUE': {
      const dialogueNode = node as { speaker?: string; text?: string; options?: unknown[] }
      let h = headerHeight
      // Speaker line
      if (dialogueNode.speaker) h += 32
      // Text content – estimate full rendered height
      const textLines = estimateTextLines(dialogueNode.text || '', NODE_CONTENT_WIDTH)
      h += textLines * LINE_HEIGHT + 16 // padding
      // Options
      const optionCount = dialogueNode.options?.length || 0
      h += optionCount * 30
      return Math.max(80, h)
    }

    case 'CHOICE': {
      const choiceNode = node as { prompt?: string; options?: unknown[] }
      let h = headerHeight
      // Prompt text
      const promptLines = estimateTextLines(choiceNode.prompt || '', NODE_CONTENT_WIDTH)
      h += promptLines * LINE_HEIGHT + 16
      // Options
      const choiceCount = choiceNode.options?.length || 0
      h += choiceCount * 30
      return Math.max(80, h)
    }

    case 'IF':
    case 'AND':
    case 'OR': {
      const conditionNode = node as { inputCount?: number; condition?: string }
      let h = headerHeight
      const condLines = estimateTextLines(conditionNode.condition || '', NODE_CONTENT_WIDTH)
      h += condLines * LINE_HEIGHT + 16
      const inputCount = conditionNode.inputCount || 2
      h += Math.max(0, inputCount - 2) * 20
      return Math.max(80, h)
    }

    case 'EVENT':
      return headerHeight + 40

    case 'END': {
      const endNode = node as {
        description?: string
        rewards?: unknown[]
        factionChanges?: unknown[]
      }
      let h = headerHeight + 32 // outcome badge
      const descLines = estimateTextLines(endNode.description || '', NODE_CONTENT_WIDTH)
      h += descLines * LINE_HEIGHT + 16
      h += (endNode.rewards?.length || 0) * 24
      h += (endNode.factionChanges?.length || 0) * 24
      return Math.max(80, h)
    }

    default:
      return 80
  }
}

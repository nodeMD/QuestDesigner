import type { Quest, QuestNode, ValidationIssue } from '@/types'

/**
 * Validate a quest and return all issues found
 */
export function validateQuest(quest: Quest): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  let issueId = 0

  const createIssue = (
    severity: 'error' | 'warning',
    type: string,
    message: string,
    nodeId?: string,
    optionId?: string
  ): ValidationIssue => ({
    id: `issue-${++issueId}`,
    severity,
    type,
    message,
    nodeId,
    optionId,
  })

  // Check for START node
  const startNodes = quest.nodes.filter(n => n.type === 'START')
  if (startNodes.length === 0) {
    issues.push(createIssue('error', 'MISSING_START', 'Quest has no START node'))
  } else if (startNodes.length > 1) {
    issues.push(createIssue('error', 'MULTIPLE_START', 'Quest has multiple START nodes'))
  }

  // Build connection maps
  const outgoingConnections = new Map<string, Set<string>>() // nodeId -> Set of targetNodeIds
  const incomingConnections = new Map<string, Set<string>>() // nodeId -> Set of sourceNodeIds
  const optionConnections = new Map<string, string>() // optionId -> targetNodeId

  quest.connections.forEach(conn => {
    // Track outgoing
    if (!outgoingConnections.has(conn.sourceNodeId)) {
      outgoingConnections.set(conn.sourceNodeId, new Set())
    }
    outgoingConnections.get(conn.sourceNodeId)!.add(conn.targetNodeId)

    // Track incoming
    if (!incomingConnections.has(conn.targetNodeId)) {
      incomingConnections.set(conn.targetNodeId, new Set())
    }
    incomingConnections.get(conn.targetNodeId)!.add(conn.sourceNodeId)

    // Track option connections
    if (conn.sourceOptionId) {
      optionConnections.set(conn.sourceOptionId, conn.targetNodeId)
    }
    if (conn.sourceOutput) {
      optionConnections.set(`${conn.sourceNodeId}-${conn.sourceOutput}`, conn.targetNodeId)
    }
  })

  // Check each node
  quest.nodes.forEach(node => {
    // Check for orphan nodes (no incoming connections, except START)
    if (node.type !== 'START' && !incomingConnections.has(node.id)) {
      issues.push(createIssue(
        'warning',
        'ORPHAN_NODE',
        `Node "${getNodeLabel(node)}" has no incoming connections`,
        node.id
      ))
    }

    // Check options for unconnected outputs
    if ('options' in node && node.options) {
      node.options.forEach(option => {
        if (!optionConnections.has(option.id)) {
          issues.push(createIssue(
            'error',
            'UNCONNECTED_OPTION',
            `Option "${option.label}" in node "${getNodeLabel(node)}" has no connection`,
            node.id,
            option.id
          ))
        }
        if (!option.label || option.label.trim() === '') {
          issues.push(createIssue(
            'warning',
            'EMPTY_OPTION',
            `Option in node "${getNodeLabel(node)}" has no label`,
            node.id,
            option.id
          ))
        }
      })
    }

    // Check IF/EVENT CHECK nodes for true/false outputs
    if (node.type === 'IF' || (node.type === 'EVENT' && node.action === 'CHECK')) {
      const hasTrueOutput = optionConnections.has(`${node.id}-true`)
      const hasFalseOutput = optionConnections.has(`${node.id}-false`)
      
      if (!hasTrueOutput) {
        issues.push(createIssue(
          'error',
          'UNCONNECTED_OUTPUT',
          `"True" output of "${getNodeLabel(node)}" has no connection`,
          node.id
        ))
      }
      if (!hasFalseOutput) {
        issues.push(createIssue(
          'error',
          'UNCONNECTED_OUTPUT',
          `"False" output of "${getNodeLabel(node)}" has no connection`,
          node.id
        ))
      }
    }

    // Check AND/OR/EVENT TRIGGER nodes for output
    if (node.type === 'AND' || node.type === 'OR' || (node.type === 'EVENT' && node.action === 'TRIGGER')) {
      if (!outgoingConnections.has(node.id) || outgoingConnections.get(node.id)!.size === 0) {
        issues.push(createIssue(
          'error',
          'DEAD_END',
          `Node "${getNodeLabel(node)}" has no outgoing connection`,
          node.id
        ))
      }
    }
  })

  // Check for dead ends using DFS from START
  if (startNodes.length === 1) {
    const reachable = new Set<string>()
    const visited = new Set<string>()
    const deadEnds: string[] = []

    function dfs(nodeId: string, path: string[]) {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      reachable.add(nodeId)

      const node = quest.nodes.find(n => n.id === nodeId)
      if (!node) return

      // END and EVENT TRIGGER are valid termination points
      if (node.type === 'END' || (node.type === 'EVENT' && node.action === 'TRIGGER')) {
        return
      }

      const outgoing = outgoingConnections.get(nodeId)
      if (!outgoing || outgoing.size === 0) {
        // This is a dead end (not END or EVENT TRIGGER - those were handled above)
        deadEnds.push(nodeId)
        return
      }

      outgoing.forEach(targetId => {
        if (!path.includes(targetId)) { // Avoid infinite loops
          dfs(targetId, [...path, targetId])
        }
      })
    }

    dfs(startNodes[0].id, [startNodes[0].id])

    // Report unreachable nodes
    quest.nodes.forEach(node => {
      if (!reachable.has(node.id) && node.type !== 'START') {
        issues.push(createIssue(
          'warning',
          'UNREACHABLE',
          `Node "${getNodeLabel(node)}" cannot be reached from START`,
          node.id
        ))
      }
    })
  }

  return issues
}

/**
 * Get a human-readable label for a node
 */
function getNodeLabel(node: QuestNode): string {
  switch (node.type) {
    case 'START':
      return node.title || 'START'
    case 'DIALOGUE':
      return node.speaker ? `Dialogue: ${node.speaker}` : 'Dialogue'
    case 'CHOICE':
      return node.prompt ? `Choice: ${node.prompt.slice(0, 20)}...` : 'Choice'
    case 'EVENT':
      return `Event: ${node.eventName || node.eventId || 'unnamed'}`
    case 'IF':
      return `IF: ${node.condition?.slice(0, 20) || 'no condition'}...`
    case 'AND':
      return 'AND'
    case 'OR':
      return 'OR'
    case 'END':
      return node.title || 'END'
  }
}

/**
 * Check if quest has any errors (not just warnings)
 */
export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some(issue => issue.severity === 'error')
}

/**
 * Check if quest is valid (no errors)
 */
export function isQuestValid(quest: Quest): boolean {
  return !hasErrors(validateQuest(quest))
}


import type { Quest, QuestNode } from '@/types'

interface SearchResult {
  nodeId: string
  matchType: 'name' | 'speaker' | 'content' | 'eventName' | 'choice' | 'option'
  matchedText: string
}

/**
 * Search nodes in a quest by query string
 * Returns matching node IDs with their match types
 */
export function searchNodes(quest: Quest, query: string): SearchResult[] {
  if (!query.trim()) return []
  
  const normalizedQuery = query.toLowerCase().trim()
  const results: SearchResult[] = []
  
  for (const node of quest.nodes) {
    const nodeMatches = getNodeMatches(node, normalizedQuery)
    results.push(...nodeMatches)
  }
  
  return results
}

/**
 * Get all matches for a single node
 */
function getNodeMatches(node: QuestNode, query: string): SearchResult[] {
  const matches: SearchResult[] = []
  
  // Check node name (may be undefined for some nodes)
  const nodeName = (node as { name?: string }).name
  if (nodeName && nodeName.toLowerCase().includes(query)) {
    matches.push({
      nodeId: node.id,
      matchType: 'name',
      matchedText: nodeName,
    })
  }
  
  switch (node.type) {
    case 'START': {
      const startNode = node as { title?: string; description?: string }
      if (startNode.title?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'name',
          matchedText: startNode.title,
        })
      }
      if (startNode.description?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'content',
          matchedText: startNode.description,
        })
      }
      break
    }
    
    case 'DIALOGUE': {
      const dialogueNode = node as { speaker?: string; text?: string; options?: { label?: string }[] }
      if (dialogueNode.speaker?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'speaker',
          matchedText: dialogueNode.speaker,
        })
      }
      if (dialogueNode.text?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'content',
          matchedText: dialogueNode.text,
        })
      }
      // Check options
      dialogueNode.options?.forEach((option) => {
        if (option.label?.toLowerCase().includes(query)) {
          matches.push({
            nodeId: node.id,
            matchType: 'option',
            matchedText: option.label,
          })
        }
      })
      break
    }
    
    case 'CHOICE': {
      const choiceNode = node as { prompt?: string; options?: { label?: string }[] }
      if (choiceNode.prompt?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'content',
          matchedText: choiceNode.prompt,
        })
      }
      choiceNode.options?.forEach((option) => {
        if (option.label?.toLowerCase().includes(query)) {
          matches.push({
            nodeId: node.id,
            matchType: 'choice',
            matchedText: option.label,
          })
        }
      })
      break
    }
    
    case 'EVENT': {
      const eventNode = node as { eventName?: string }
      if (eventNode.eventName?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'eventName',
          matchedText: eventNode.eventName,
        })
      }
      break
    }
    
    case 'END': {
      const endNode = node as { title?: string; description?: string }
      if (endNode.title?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'name',
          matchedText: endNode.title,
        })
      }
      if (endNode.description?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'content',
          matchedText: endNode.description,
        })
      }
      break
    }
    
    case 'IF': {
      const ifNode = node as { condition?: string }
      if (ifNode.condition?.toLowerCase().includes(query)) {
        matches.push({
          nodeId: node.id,
          matchType: 'content',
          matchedText: ifNode.condition,
        })
      }
      break
    }
  }
  
  return matches
}

/**
 * Get unique node IDs from search results
 */
export function getUniqueNodeIds(results: SearchResult[]): string[] {
  return [...new Set(results.map((r) => r.nodeId))]
}

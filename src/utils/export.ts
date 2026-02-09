import { v4 as uuid } from 'uuid'
import type { Project, Quest, QuestNode, Connection, Viewport } from '@/types'

export interface ExportedQuest {
  version: string
  exportedAt: string
  quest: {
    id: string
    name: string
    description?: string
    nodes: Array<{
      id: string
      type: string
      position: { x: number; y: number }
      [key: string]: unknown
    }>
    connections: Array<{
      id: string
      sourceNodeId: string
      sourceOptionId?: string
      sourceOutput?: string
      targetNodeId: string
    }>
  }
}

export interface ExportedProject {
  version: string
  exportedAt: string
  project: {
    name: string
    quests: ExportedQuest['quest'][]
    events: Array<{
      id: string
      name: string
      description?: string
      parameters?: Array<{
        name: string
        type: string
        defaultValue?: unknown
        description?: string
      }>
    }>
  }
}

/**
 * Export a single quest to JSON format
 */
export function exportQuest(quest: Quest): ExportedQuest {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    quest: {
      id: quest.id,
      name: quest.name,
      description: quest.description,
      nodes: quest.nodes.map(node => ({
        ...node,
        // Remove internal position tracking, keep only x/y
        position: { x: node.position.x, y: node.position.y },
      })),
      connections: quest.connections.map(conn => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        sourceOptionId: conn.sourceOptionId,
        sourceOutput: conn.sourceOutput,
        targetNodeId: conn.targetNodeId,
      })),
    },
  }
}

/**
 * Export entire project to JSON format
 */
export function exportProject(project: Project): ExportedProject {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      quests: project.quests.map(quest => ({
        id: quest.id,
        name: quest.name,
        description: quest.description,
        nodes: quest.nodes.map(node => ({
          ...node,
          position: { x: node.position.x, y: node.position.y },
        })),
        connections: quest.connections.map(conn => ({
          id: conn.id,
          sourceNodeId: conn.sourceNodeId,
          sourceOptionId: conn.sourceOptionId,
          sourceOutput: conn.sourceOutput,
          targetNodeId: conn.targetNodeId,
        })),
      })),
      events: project.events.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        parameters: event.parameters,
      })),
    },
  }
}

/**
 * Convert export data to formatted JSON string
 */
export function toJsonString(data: ExportedQuest | ExportedProject): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Download JSON as file (browser fallback)
 */
export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Parse and validate an imported quest JSON
 * Returns the parsed quest or null if invalid
 */
export function parseImportedQuest(jsonString: string): Quest | null {
  try {
    const data = JSON.parse(jsonString)
    
    // Check if it's an exported quest format
    if (data.quest) {
      return convertExportedQuestToQuest(data.quest)
    }
    
    // Check if it's a raw quest format (from project file)
    if (data.nodes && data.connections && data.name) {
      return convertExportedQuestToQuest(data)
    }
    
    return null
  } catch (e) {
    console.error('Failed to parse imported quest:', e)
    return null
  }
}

/**
 * Convert exported quest format to internal Quest format
 */
function convertExportedQuestToQuest(exportedQuest: ExportedQuest['quest']): Quest {
  // Generate new IDs to avoid conflicts with existing quests
  const idMap = new Map<string, string>()
  
  // Map old node IDs to new ones
  exportedQuest.nodes.forEach((node) => {
    idMap.set(node.id, uuid())
  })
  
  // Convert nodes with new IDs
  const nodes: QuestNode[] = exportedQuest.nodes.map((node) => {
    const newNode: QuestNode = {
      ...node,
      id: idMap.get(node.id) || uuid(),
      type: node.type as QuestNode['type'],
      position: { x: node.position.x, y: node.position.y },
    } as QuestNode
    
    // Update option IDs if the node has options
    if ('options' in newNode && Array.isArray((newNode as { options?: unknown[] }).options)) {
      const optionsNode = newNode as { options: Array<{ id: string; label: string }> }
      const newOptionIdMap = new Map<string, string>()
      optionsNode.options = optionsNode.options.map((opt) => {
        const newOptId = uuid()
        newOptionIdMap.set(opt.id, newOptId)
        return { ...opt, id: newOptId }
      })
      // Store option ID mapping for connections
      idMap.set(`options:${node.id}`, JSON.stringify(Object.fromEntries(newOptionIdMap)))
    }
    
    return newNode
  })
  
  // Convert connections with new IDs
  const connections: Connection[] = exportedQuest.connections.map((conn) => {
    let sourceOptionId = conn.sourceOptionId
    
    // Update source option ID if present
    if (sourceOptionId) {
      const optionMapJson = idMap.get(`options:${conn.sourceNodeId}`)
      if (optionMapJson) {
        const optionMap = JSON.parse(optionMapJson)
        sourceOptionId = optionMap[sourceOptionId] || sourceOptionId
      }
    }
    
    return {
      id: uuid(),
      sourceNodeId: idMap.get(conn.sourceNodeId) || conn.sourceNodeId,
      sourceOptionId,
      sourceOutput: conn.sourceOutput,
      targetNodeId: idMap.get(conn.targetNodeId) || conn.targetNodeId,
      targetHandle: (conn as { targetHandle?: string }).targetHandle,
    }
  })
  
  const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 }
  
  return {
    id: uuid(),
    name: `${exportedQuest.name} (Imported)`,
    description: exportedQuest.description,
    nodes,
    connections,
    viewport: defaultViewport,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

import type { Project, Quest } from '@/types'

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


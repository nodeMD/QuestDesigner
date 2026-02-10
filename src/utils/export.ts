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
      nodes: quest.nodes.map((node) => ({
        ...node,
        // Remove internal position tracking, keep only x/y
        position: { x: node.position.x, y: node.position.y },
      })),
      connections: quest.connections.map((conn) => ({
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
      quests: project.quests.map((quest) => ({
        id: quest.id,
        name: quest.name,
        description: quest.description,
        nodes: quest.nodes.map((node) => ({
          ...node,
          position: { x: node.position.x, y: node.position.y },
        })),
        connections: quest.connections.map((conn) => ({
          id: conn.id,
          sourceNodeId: conn.sourceNodeId,
          sourceOptionId: conn.sourceOptionId,
          sourceOutput: conn.sourceOutput,
          targetNodeId: conn.targetNodeId,
          targetHandle: conn.targetHandle,
        })),
      })),
      events: project.events.map((event) => ({
        id: event.id,
        name: event.name,
        description: event.description,
        parameters: event.parameters,
      })),
    },
  }
}

const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 }
const defaultProjectSettings = {
  autoSave: false,
  autoSaveInterval: 40,
  gridSnap: true,
  gridSize: 20,
}

/**
 * Convert exported project JSON (from "Export Entire Project") into a full Project
 * so it can be opened with "Open Project".
 */
export function convertExportedProjectToProject(exported: ExportedProject): Project {
  const now = new Date()
  const p = exported.project
  const project: Project = {
    id: uuid(),
    name: p.name,
    version: exported.version || '1.0.0',
    createdAt: now,
    updatedAt: now,
    settings: defaultProjectSettings,
    quests: (p.quests || []).map((q) => ({
      id: q.id,
      name: q.name,
      description: q.description,
      nodes: q.nodes || [],
      connections: (q.connections || []).map((c) => ({
        id: c.id,
        sourceNodeId: c.sourceNodeId,
        sourceOptionId: c.sourceOptionId,
        sourceOutput: c.sourceOutput,
        targetNodeId: c.targetNodeId,
        targetHandle: (c as { targetHandle?: string }).targetHandle,
      })),
      viewport: (q as { viewport?: Viewport }).viewport || defaultViewport,
      createdAt: now,
      updatedAt: now,
      tags: (q as { tags?: string[] }).tags,
    })) as unknown as Project['quests'],
    events: (p.events || []).map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      parameters: e.parameters,
      usedInQuests: (e as { usedInQuests?: string[] }).usedInQuests || [],
      createdAt: now,
      updatedAt: now,
    })) as unknown as Project['events'],
  }
  return project
}

/**
 * Parse a project file (JSON string) and return a Project.
 * Supports both exported format (from "Export Entire Project") and internal format (from "Save Project").
 * @throws Error if JSON is invalid or missing quests/events
 */
export function parseProjectFile(data: string): Project {
  const parsed = JSON.parse(data)

  // Exported format: { version, exportedAt, project: { name, quests, events } }
  if (
    parsed.project &&
    Array.isArray(parsed.project.quests) &&
    Array.isArray(parsed.project.events)
  ) {
    return convertExportedProjectToProject({
      version: parsed.version ?? '1.0.0',
      exportedAt: parsed.exportedAt ?? new Date().toISOString(),
      project: parsed.project,
    })
  }

  // Internal format: { id, name, version, quests, events, settings, createdAt, updatedAt }
  const project = parsed
  if (!Array.isArray(project.quests) || !Array.isArray(project.events)) {
    throw new Error('Invalid project file: missing quests or events')
  }
  const now = Date.now()
  return {
    ...project,
    createdAt: new Date(project.createdAt || now),
    updatedAt: new Date(project.updatedAt || now),
    quests: project.quests.map(
      (q: { createdAt?: string; updatedAt?: string; [k: string]: unknown }) => ({
        ...q,
        createdAt: new Date(q.createdAt || now),
        updatedAt: new Date(q.updatedAt || now),
      })
    ),
    events: project.events.map(
      (e: { createdAt?: string; updatedAt?: string; [k: string]: unknown }) => ({
        ...e,
        createdAt: new Date(e.createdAt || now),
        updatedAt: new Date(e.updatedAt || now),
      })
    ),
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

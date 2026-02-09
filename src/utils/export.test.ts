import { describe, it, expect, vi } from 'vitest'
import { exportQuest, exportProject, toJsonString, parseImportedQuest } from './export'
import type { Quest, Project, StartNode, EndNode } from '@/types'

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).slice(2, 11)),
}))

// Helper to create a minimal quest
function createQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    name: 'Test Quest',
    description: 'A test quest',
    nodes: [],
    connections: [],
    viewport: { x: 100, y: 200, zoom: 1.5 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    ...overrides,
  }
}

function createStartNode(): StartNode {
  return {
    id: 'start-1',
    type: 'START',
    position: { x: 0, y: 0 },
    title: 'Quest Start',
    description: 'Begin the quest',
    options: [{ id: 'opt-1', label: 'Continue' }],
  }
}

function createEndNode(): EndNode {
  return {
    id: 'end-1',
    type: 'END',
    position: { x: 200, y: 0 },
    title: 'Quest End',
    outcome: 'SUCCESS',
  }
}

function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'Test Project',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    quests: [],
    events: [],
    settings: {
      autoSave: false,
      autoSaveInterval: 30000,
      gridSnap: true,
      gridSize: 20,
    },
    ...overrides,
  }
}

describe('exportQuest', () => {
  it('should export quest with version and timestamp', () => {
    const quest = createQuest()
    
    const exported = exportQuest(quest)
    
    expect(exported.version).toBe('1.0.0')
    expect(exported.exportedAt).toBeDefined()
    expect(new Date(exported.exportedAt).getTime()).not.toBeNaN()
  })

  it('should export quest basic properties', () => {
    const quest = createQuest({
      id: 'my-quest',
      name: 'My Quest',
      description: 'Description here',
    })
    
    const exported = exportQuest(quest)
    
    expect(exported.quest.id).toBe('my-quest')
    expect(exported.quest.name).toBe('My Quest')
    expect(exported.quest.description).toBe('Description here')
  })

  it('should export nodes with position', () => {
    const quest = createQuest({
      nodes: [
        createStartNode(),
        createEndNode(),
      ],
    })
    
    const exported = exportQuest(quest)
    
    expect(exported.quest.nodes).toHaveLength(2)
    expect(exported.quest.nodes[0].position).toEqual({ x: 0, y: 0 })
    expect(exported.quest.nodes[1].position).toEqual({ x: 200, y: 0 })
  })

  it('should export connections', () => {
    const quest = createQuest({
      nodes: [createStartNode(), createEndNode()],
      connections: [
        {
          id: 'conn-1',
          sourceNodeId: 'start-1',
          sourceOptionId: 'opt-1',
          targetNodeId: 'end-1',
        },
      ],
    })
    
    const exported = exportQuest(quest)
    
    expect(exported.quest.connections).toHaveLength(1)
    expect(exported.quest.connections[0]).toEqual({
      id: 'conn-1',
      sourceNodeId: 'start-1',
      sourceOptionId: 'opt-1',
      sourceOutput: undefined,
      targetNodeId: 'end-1',
    })
  })
})

describe('exportProject', () => {
  it('should export project with version and timestamp', () => {
    const project = createProject()
    
    const exported = exportProject(project)
    
    expect(exported.version).toBe('1.0.0')
    expect(exported.exportedAt).toBeDefined()
  })

  it('should export project name', () => {
    const project = createProject({ name: 'My Game Quests' })
    
    const exported = exportProject(project)
    
    expect(exported.project.name).toBe('My Game Quests')
  })

  it('should export multiple quests', () => {
    const project = createProject({
      quests: [
        createQuest({ id: 'quest-1', name: 'Quest 1' }),
        createQuest({ id: 'quest-2', name: 'Quest 2' }),
      ],
    })
    
    const exported = exportProject(project)
    
    expect(exported.project.quests).toHaveLength(2)
    expect(exported.project.quests[0].name).toBe('Quest 1')
    expect(exported.project.quests[1].name).toBe('Quest 2')
  })

  it('should export events with parameters', () => {
    const project = createProject({
      events: [
        {
          id: 'event-1',
          name: 'PlayerLevelUp',
          description: 'Triggered when player levels up',
          parameters: [
            { name: 'newLevel', type: 'number', defaultValue: 1, description: 'The new level' },
          ],
          usedInQuests: ['quest-1'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })
    
    const exported = exportProject(project)
    
    expect(exported.project.events).toHaveLength(1)
    expect(exported.project.events[0].name).toBe('PlayerLevelUp')
    expect(exported.project.events[0].parameters).toHaveLength(1)
    expect(exported.project.events[0].parameters![0].name).toBe('newLevel')
  })
})

describe('toJsonString', () => {
  it('should convert exported quest to formatted JSON', () => {
    const quest = createQuest({ name: 'Test' })
    const exported = exportQuest(quest)
    
    const jsonString = toJsonString(exported)
    
    expect(jsonString).toContain('"name": "Test"')
    expect(jsonString).toContain('\n') // Should be formatted with newlines
  })

  it('should produce valid JSON', () => {
    const quest = createQuest()
    const exported = exportQuest(quest)
    const jsonString = toJsonString(exported)
    
    expect(() => JSON.parse(jsonString)).not.toThrow()
  })
})

describe('parseImportedQuest', () => {
  it('should parse exported quest format', () => {
    const exportedJson = JSON.stringify({
      version: '1.0.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      quest: {
        id: 'original-id',
        name: 'Imported Quest',
        description: 'A quest to import',
        nodes: [
          {
            id: 'node-1',
            type: 'START',
            position: { x: 0, y: 0 },
            title: 'Start',
            description: 'Begin',
            options: [{ id: 'opt-1', label: 'Go' }],
          },
        ],
        connections: [],
      },
    })
    
    const quest = parseImportedQuest(exportedJson)
    
    expect(quest).not.toBeNull()
    expect(quest!.name).toBe('Imported Quest (Imported)')
    expect(quest!.nodes).toHaveLength(1)
    expect(quest!.id).not.toBe('original-id') // Should have new ID
  })

  it('should parse raw quest format', () => {
    const rawQuestJson = JSON.stringify({
      id: 'raw-quest',
      name: 'Raw Quest',
      nodes: [
        {
          id: 'node-1',
          type: 'END',
          position: { x: 100, y: 100 },
          title: 'End',
          outcome: 'SUCCESS',
        },
      ],
      connections: [],
    })
    
    const quest = parseImportedQuest(rawQuestJson)
    
    expect(quest).not.toBeNull()
    expect(quest!.name).toBe('Raw Quest (Imported)')
  })

  it('should generate new IDs for nodes', () => {
    const exportedJson = JSON.stringify({
      quest: {
        id: 'quest-1',
        name: 'Quest',
        nodes: [
          { id: 'old-node-1', type: 'START', position: { x: 0, y: 0 }, title: 'Start', description: '', options: [] },
          { id: 'old-node-2', type: 'END', position: { x: 100, y: 0 }, title: 'End', outcome: 'SUCCESS' },
        ],
        connections: [
          { id: 'old-conn-1', sourceNodeId: 'old-node-1', targetNodeId: 'old-node-2' },
        ],
      },
    })
    
    const quest = parseImportedQuest(exportedJson)
    
    expect(quest).not.toBeNull()
    expect(quest!.nodes[0].id).not.toBe('old-node-1')
    expect(quest!.nodes[1].id).not.toBe('old-node-2')
    // Connection should be updated to use new node IDs
    expect(quest!.connections[0].sourceNodeId).toBe(quest!.nodes[0].id)
    expect(quest!.connections[0].targetNodeId).toBe(quest!.nodes[1].id)
  })

  it('should return null for invalid JSON', () => {
    const result = parseImportedQuest('not valid json')
    
    expect(result).toBeNull()
  })

  it('should return null for JSON without quest data', () => {
    const result = parseImportedQuest(JSON.stringify({ foo: 'bar' }))
    
    expect(result).toBeNull()
  })

  it('should set viewport and timestamps', () => {
    const exportedJson = JSON.stringify({
      quest: {
        id: 'quest-1',
        name: 'Quest',
        nodes: [],
        connections: [],
      },
    })
    
    const quest = parseImportedQuest(exportedJson)
    
    expect(quest).not.toBeNull()
    expect(quest!.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    expect(quest!.createdAt).toBeInstanceOf(Date)
    expect(quest!.updatedAt).toBeInstanceOf(Date)
  })
})

import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { 
  Project, 
  Quest, 
  QuestNode, 
  Connection, 
  GlobalEvent,
  NodeType,
  Option,
  Position
} from '@/types'

interface ProjectState {
  // Project data
  project: Project | null
  currentQuestId: string | null
  selectedNodeId: string | null
  
  // File state
  filePath: string | null
  isDirty: boolean
  
  // Actions
  createProject: (name: string) => void
  setProject: (project: Project) => void
  setFilePath: (path: string | null) => void
  setDirty: (dirty: boolean) => void
  
  // Quest actions
  createQuest: (name: string) => void
  selectQuest: (questId: string) => void
  updateQuest: (questId: string, updates: Partial<Quest>) => void
  deleteQuest: (questId: string) => void
  
  // Node actions
  addNode: (type: NodeType, position: Position) => QuestNode | null
  updateNode: (nodeId: string, updates: Partial<QuestNode>) => void
  deleteNode: (nodeId: string) => void
  selectNode: (nodeId: string | null) => void
  
  // Connection actions
  addConnection: (connection: Omit<Connection, 'id'>) => void
  deleteConnection: (connectionId: string) => void
  
  // Event actions
  createEvent: (name: string, description?: string) => GlobalEvent
  updateEvent: (eventId: string, updates: Partial<GlobalEvent>) => void
  deleteEvent: (eventId: string) => void
  
  // Helpers
  getCurrentQuest: () => Quest | null
  getNode: (nodeId: string) => QuestNode | undefined
}

const createDefaultProject = (name: string): Project => ({
  id: uuid(),
  name,
  version: '1.0.0',
  createdAt: new Date(),
  updatedAt: new Date(),
  quests: [],
  events: [],
  settings: {
    autoSave: true,
    autoSaveInterval: 30,
    gridSnap: true,
    gridSize: 20,
  },
})

const createDefaultQuest = (name: string): Quest => ({
  id: uuid(),
  name,
  description: '',
  nodes: [],
  connections: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
})

const createDefaultNode = (type: NodeType, position: Position): QuestNode => {
  const baseNode = {
    id: uuid(),
    position,
  }

  switch (type) {
    case 'START':
      return {
        ...baseNode,
        type: 'START',
        title: 'Quest Start',
        description: 'Enter quest description...',
        options: [{ id: uuid(), label: 'Accept' }],
      }
    case 'DIALOGUE':
      return {
        ...baseNode,
        type: 'DIALOGUE',
        speaker: '',
        text: 'Enter dialogue text...',
        options: [{ id: uuid(), label: 'Continue' }],
      }
    case 'CHOICE':
      return {
        ...baseNode,
        type: 'CHOICE',
        prompt: 'What do you do?',
        options: [
          { id: uuid(), label: 'Option 1' },
          { id: uuid(), label: 'Option 2' },
        ],
      }
    case 'EVENT':
      return {
        ...baseNode,
        type: 'EVENT',
        eventId: '',
        action: 'TRIGGER',
      }
    case 'IF':
      return {
        ...baseNode,
        type: 'IF',
        condition: '',
      }
    case 'AND':
      return {
        ...baseNode,
        type: 'AND',
        inputCount: 2,
      }
    case 'OR':
      return {
        ...baseNode,
        type: 'OR',
        inputCount: 2,
      }
    case 'END':
      return {
        ...baseNode,
        type: 'END',
        title: 'Quest Complete',
        outcome: 'SUCCESS',
        description: '',
      }
  }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  currentQuestId: null,
  selectedNodeId: null,
  filePath: null,
  isDirty: false,

  createProject: (name) => {
    const project = createDefaultProject(name)
    set({ project, currentQuestId: null, selectedNodeId: null, isDirty: true })
  },

  setProject: (project) => {
    set({ 
      project, 
      currentQuestId: project.quests[0]?.id ?? null,
      selectedNodeId: null,
      isDirty: false,
    })
  },

  setFilePath: (path) => set({ filePath: path }),
  setDirty: (dirty) => set({ isDirty: dirty }),

  createQuest: (name) => {
    const { project } = get()
    if (!project) return

    const quest = createDefaultQuest(name)
    set({
      project: {
        ...project,
        quests: [...project.quests, quest],
        updatedAt: new Date(),
      },
      currentQuestId: quest.id,
      isDirty: true,
    })
  },

  selectQuest: (questId) => {
    set({ currentQuestId: questId, selectedNodeId: null })
  },

  updateQuest: (questId, updates) => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === questId ? { ...q, ...updates, updatedAt: new Date() } : q
        ),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  deleteQuest: (questId) => {
    const { project, currentQuestId } = get()
    if (!project) return

    const newQuests = project.quests.filter((q) => q.id !== questId)
    set({
      project: {
        ...project,
        quests: newQuests,
        updatedAt: new Date(),
      },
      currentQuestId: currentQuestId === questId ? (newQuests[0]?.id ?? null) : currentQuestId,
      isDirty: true,
    })
  },

  addNode: (type, position) => {
    const { project, currentQuestId } = get()
    if (!project || !currentQuestId) return null

    const node = createDefaultNode(type, position)
    
    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === currentQuestId
            ? { ...q, nodes: [...q.nodes, node], updatedAt: new Date() }
            : q
        ),
        updatedAt: new Date(),
      },
      selectedNodeId: node.id,
      isDirty: true,
    })

    return node
  },

  updateNode: (nodeId, updates) => {
    const { project, currentQuestId } = get()
    if (!project || !currentQuestId) return

    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === currentQuestId
            ? {
                ...q,
                nodes: q.nodes.map((n) =>
                  n.id === nodeId ? { ...n, ...updates } as QuestNode : n
                ),
                updatedAt: new Date(),
              }
            : q
        ),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  deleteNode: (nodeId) => {
    const { project, currentQuestId, selectedNodeId } = get()
    if (!project || !currentQuestId) return

    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === currentQuestId
            ? {
                ...q,
                nodes: q.nodes.filter((n) => n.id !== nodeId),
                connections: q.connections.filter(
                  (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
                ),
                updatedAt: new Date(),
              }
            : q
        ),
        updatedAt: new Date(),
      },
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
      isDirty: true,
    })
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  addConnection: (connection) => {
    const { project, currentQuestId } = get()
    if (!project || !currentQuestId) return

    const newConnection: Connection = {
      ...connection,
      id: uuid(),
    }

    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === currentQuestId
            ? { ...q, connections: [...q.connections, newConnection], updatedAt: new Date() }
            : q
        ),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  deleteConnection: (connectionId) => {
    const { project, currentQuestId } = get()
    if (!project || !currentQuestId) return

    set({
      project: {
        ...project,
        quests: project.quests.map((q) =>
          q.id === currentQuestId
            ? {
                ...q,
                connections: q.connections.filter((c) => c.id !== connectionId),
                updatedAt: new Date(),
              }
            : q
        ),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  createEvent: (name, description) => {
    const { project } = get()
    if (!project) throw new Error('No project')

    const event: GlobalEvent = {
      id: uuid(),
      name,
      description,
      usedInQuests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    set({
      project: {
        ...project,
        events: [...project.events, event],
        updatedAt: new Date(),
      },
      isDirty: true,
    })

    return event
  },

  updateEvent: (eventId, updates) => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        events: project.events.map((e) =>
          e.id === eventId ? { ...e, ...updates, updatedAt: new Date() } : e
        ),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  deleteEvent: (eventId) => {
    const { project } = get()
    if (!project) return

    set({
      project: {
        ...project,
        events: project.events.filter((e) => e.id !== eventId),
        updatedAt: new Date(),
      },
      isDirty: true,
    })
  },

  getCurrentQuest: () => {
    const { project, currentQuestId } = get()
    if (!project || !currentQuestId) return null
    return project.quests.find((q) => q.id === currentQuestId) ?? null
  },

  getNode: (nodeId) => {
    const quest = get().getCurrentQuest()
    return quest?.nodes.find((n) => n.id === nodeId)
  },
}))


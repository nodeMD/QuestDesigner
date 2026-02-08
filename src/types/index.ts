// Position type for canvas placement
export interface Position {
  x: number
  y: number
}

// Location in game world
export interface Location {
  name?: string
  x?: number
  y?: number
  z?: number
}

// NPC definition
export interface NPC {
  id?: string
  name: string
  type?: string
}

// Option for player choices
export interface Option {
  id: string
  label: string
  shortLabel?: string
}

// Connection between nodes
export interface Connection {
  id: string
  sourceNodeId: string
  sourceOptionId?: string
  sourceOutput?: string // For IF nodes: 'true' | 'false'
  targetNodeId: string
  targetHandle?: string // For nodes with multiple inputs like AND/OR
}

// Viewport state
export interface Viewport {
  x: number
  y: number
  zoom: number
}

// Base node interface
export interface BaseNode {
  id: string
  type: NodeType
  position: Position
  width?: number
  height?: number
}

// Node types
export type NodeType = 'START' | 'DIALOGUE' | 'CHOICE' | 'EVENT' | 'IF' | 'AND' | 'OR' | 'END'

// START node
export interface StartNode extends BaseNode {
  type: 'START'
  title: string
  location?: Location
  npc?: NPC
  description: string
  options: Option[]
}

// DIALOGUE node
export interface DialogueNode extends BaseNode {
  type: 'DIALOGUE'
  speaker?: string
  text: string
  options: Option[]
}

// CHOICE node
export interface ChoiceNode extends BaseNode {
  type: 'CHOICE'
  prompt?: string
  options: Option[]
}

// EVENT node
export interface EventNode extends BaseNode {
  type: 'EVENT'
  eventId: string
  eventName?: string
  action: 'TRIGGER' | 'CHECK'
  parameters?: Record<string, unknown>
}

// IF node
export interface IfNode extends BaseNode {
  type: 'IF'
  condition: string
}

// AND node
export interface AndNode extends BaseNode {
  type: 'AND'
  inputCount: number
}

// OR node
export interface OrNode extends BaseNode {
  type: 'OR'
  inputCount: number
}

// Reward type
export interface Reward {
  type: 'ITEM' | 'GOLD' | 'EXPERIENCE' | 'CUSTOM'
  value: string | number
  quantity?: number
}

// Faction change
export interface FactionChange {
  factionId: string
  factionName: string
  change: number
}

// END node
export interface EndNode extends BaseNode {
  type: 'END'
  title: string
  outcome: 'SUCCESS' | 'FAILURE' | 'NEUTRAL'
  description?: string
  rewards?: Reward[]
  factionChanges?: FactionChange[]
  triggeredEvents?: string[]
}

// Union of all node types
export type QuestNode = 
  | StartNode 
  | DialogueNode 
  | ChoiceNode 
  | EventNode 
  | IfNode 
  | AndNode 
  | OrNode 
  | EndNode

// Quest definition
export interface Quest {
  id: string
  name: string
  description?: string
  nodes: QuestNode[]
  connections: Connection[]
  viewport: Viewport
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

// Global event definition
export interface GlobalEvent {
  id: string
  name: string
  description?: string
  parameters?: EventParameter[]
  usedInQuests: string[]
  createdAt: Date
  updatedAt: Date
}

export interface EventParameter {
  name: string
  type: 'string' | 'number' | 'boolean'
  defaultValue?: unknown
  description?: string
}

// Project settings
export interface ProjectSettings {
  autoSave: boolean
  autoSaveInterval: number
  gridSnap: boolean
  gridSize: number
}

// Project definition
export interface Project {
  id: string
  name: string
  version: string
  createdAt: Date
  updatedAt: Date
  quests: Quest[]
  events: GlobalEvent[]
  settings: ProjectSettings
}

// Validation types
export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  type: string
  message: string
  nodeId?: string
  optionId?: string
}


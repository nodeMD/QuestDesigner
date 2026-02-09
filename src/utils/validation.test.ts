import { describe, it, expect } from 'vitest'
import { validateQuest, hasErrors, isQuestValid } from './validation'
import type { Quest, StartNode, EndNode, DialogueNode, ChoiceNode, EventNode, IfNode, AndNode } from '@/types'

// Helper to create a minimal quest
function createQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    name: 'Test Quest',
    nodes: [],
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// Helper to create nodes
function createStartNode(overrides: Partial<StartNode> = {}): StartNode {
  return {
    id: 'start-1',
    type: 'START',
    position: { x: 0, y: 0 },
    title: 'Quest Start',
    description: 'Begin the quest',
    options: [{ id: 'opt-1', label: 'Continue' }],
    ...overrides,
  }
}

function createEndNode(overrides: Partial<EndNode> = {}): EndNode {
  return {
    id: 'end-1',
    type: 'END',
    position: { x: 200, y: 0 },
    title: 'Quest End',
    outcome: 'SUCCESS',
    ...overrides,
  }
}

function createDialogueNode(overrides: Partial<DialogueNode> = {}): DialogueNode {
  return {
    id: 'dialogue-1',
    type: 'DIALOGUE',
    position: { x: 100, y: 0 },
    speaker: 'NPC',
    text: 'Hello traveler',
    options: [{ id: 'opt-d1', label: 'Goodbye' }],
    ...overrides,
  }
}

function createChoiceNode(overrides: Partial<ChoiceNode> = {}): ChoiceNode {
  return {
    id: 'choice-1',
    type: 'CHOICE',
    position: { x: 100, y: 0 },
    prompt: 'What do you want to do?',
    options: [
      { id: 'opt-c1', label: 'Option A' },
      { id: 'opt-c2', label: 'Option B' },
    ],
    ...overrides,
  }
}

function createEventNode(overrides: Partial<EventNode> = {}): EventNode {
  return {
    id: 'event-1',
    type: 'EVENT',
    position: { x: 100, y: 0 },
    eventId: 'event-global-1',
    eventName: 'TestEvent',
    action: 'TRIGGER',
    ...overrides,
  }
}

function createIfNode(overrides: Partial<IfNode> = {}): IfNode {
  return {
    id: 'if-1',
    type: 'IF',
    position: { x: 100, y: 0 },
    condition: 'playerLevel > 5',
    ...overrides,
  }
}

function createAndNode(overrides: Partial<AndNode> = {}): AndNode {
  return {
    id: 'and-1',
    type: 'AND',
    position: { x: 100, y: 0 },
    inputCount: 2,
    ...overrides,
  }
}

describe('validateQuest', () => {
  describe('START node validation', () => {
    it('should return error when quest has no START node', () => {
      const quest = createQuest({
        nodes: [createEndNode()],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'MISSING_START',
        })
      )
    })

    it('should return error when quest has multiple START nodes', () => {
      const quest = createQuest({
        nodes: [
          createStartNode({ id: 'start-1' }),
          createStartNode({ id: 'start-2' }),
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'MULTIPLE_START',
        })
      )
    })

    it('should not return START errors for valid single START node', () => {
      const quest = createQuest({
        nodes: [createStartNode(), createEndNode()],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).not.toContainEqual(
        expect.objectContaining({ type: 'MISSING_START' })
      )
      expect(issues).not.toContainEqual(
        expect.objectContaining({ type: 'MULTIPLE_START' })
      )
    })
  })

  describe('Orphan node validation', () => {
    it('should return warning for nodes without incoming connections', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createEndNode({ id: 'end-1' }),
          createEndNode({ id: 'end-2' }), // Orphan - no incoming connection
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'warning',
          type: 'ORPHAN_NODE',
          nodeId: 'end-2',
        })
      )
    })

    it('should not flag START node as orphan', () => {
      const quest = createQuest({
        nodes: [createStartNode(), createEndNode()],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      const orphanIssues = issues.filter(i => i.type === 'ORPHAN_NODE' && i.nodeId === 'start-1')
      expect(orphanIssues).toHaveLength(0)
    })
  })

  describe('Option connection validation', () => {
    it('should return error for unconnected options', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createDialogueNode({
            options: [
              { id: 'opt-d1', label: 'Connected' },
              { id: 'opt-d2', label: 'Unconnected' },
            ],
          }),
          createEndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'dialogue-1' },
          { id: 'conn-2', sourceNodeId: 'dialogue-1', sourceOptionId: 'opt-d1', targetNodeId: 'end-1' },
          // opt-d2 has no connection
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'UNCONNECTED_OPTION',
          nodeId: 'dialogue-1',
          optionId: 'opt-d2',
        })
      )
    })

    it('should return warning for options with empty labels', () => {
      const quest = createQuest({
        nodes: [
          createStartNode({
            options: [{ id: 'opt-1', label: '' }],
          }),
          createEndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'warning',
          type: 'EMPTY_OPTION',
          nodeId: 'start-1',
          optionId: 'opt-1',
        })
      )
    })
  })

  describe('IF/EVENT CHECK node validation', () => {
    it('should return error for IF node without true output', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createIfNode(),
          createEndNode({ id: 'end-false' }),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'if-1' },
          { id: 'conn-2', sourceNodeId: 'if-1', sourceOutput: 'false', targetNodeId: 'end-false' },
          // Missing true output
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'UNCONNECTED_OUTPUT',
          nodeId: 'if-1',
        })
      )
    })

    it('should return error for IF node without false output', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createIfNode(),
          createEndNode({ id: 'end-true' }),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'if-1' },
          { id: 'conn-2', sourceNodeId: 'if-1', sourceOutput: 'true', targetNodeId: 'end-true' },
          // Missing false output
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'UNCONNECTED_OUTPUT',
          nodeId: 'if-1',
        })
      )
    })

    it('should return error for EVENT CHECK node without both outputs', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createEventNode({ id: 'event-check', action: 'CHECK' }),
          createEndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'event-check' },
          // Missing both true and false outputs
        ],
      })
      
      const issues = validateQuest(quest)
      
      const outputIssues = issues.filter(i => i.type === 'UNCONNECTED_OUTPUT' && i.nodeId === 'event-check')
      expect(outputIssues.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('AND/OR/EVENT TRIGGER node validation', () => {
    it('should return error for AND node without outgoing connection', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createAndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'and-1' },
          // AND node has no outgoing connection
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'DEAD_END',
          nodeId: 'and-1',
        })
      )
    })

    it('should return error for EVENT TRIGGER without outgoing connection', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createEventNode({ action: 'TRIGGER' }),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'event-1' },
          // EVENT TRIGGER has no outgoing connection
        ],
      })
      
      const issues = validateQuest(quest)
      
      // EVENT TRIGGER should have an outgoing connection
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          type: 'DEAD_END',
          nodeId: 'event-1',
        })
      )
    })

    it('should not return error for EVENT TRIGGER with outgoing connection', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createEventNode({ action: 'TRIGGER' }),
          createEndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'event-1' },
          { id: 'conn-2', sourceNodeId: 'event-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).not.toContainEqual(
        expect.objectContaining({
          type: 'DEAD_END',
          nodeId: 'event-1',
        })
      )
    })
  })

  describe('Unreachable nodes', () => {
    it('should return warning for unreachable nodes', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createEndNode({ id: 'end-1' }),
          createDialogueNode({ id: 'unreachable' }), // Not connected to anything
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      
      expect(issues).toContainEqual(
        expect.objectContaining({
          severity: 'warning',
          type: 'UNREACHABLE',
          nodeId: 'unreachable',
        })
      )
    })
  })

  describe('Valid quest', () => {
    it('should return no errors for a valid simple quest', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createDialogueNode(),
          createEndNode(),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'dialogue-1' },
          { id: 'conn-2', sourceNodeId: 'dialogue-1', sourceOptionId: 'opt-d1', targetNodeId: 'end-1' },
        ],
      })
      
      const issues = validateQuest(quest)
      const errors = issues.filter(i => i.severity === 'error')
      
      expect(errors).toHaveLength(0)
    })

    it('should return no errors for a quest with branching', () => {
      const quest = createQuest({
        nodes: [
          createStartNode(),
          createChoiceNode(),
          createEndNode({ id: 'end-a' }),
          createEndNode({ id: 'end-b' }),
        ],
        connections: [
          { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'choice-1' },
          { id: 'conn-2', sourceNodeId: 'choice-1', sourceOptionId: 'opt-c1', targetNodeId: 'end-a' },
          { id: 'conn-3', sourceNodeId: 'choice-1', sourceOptionId: 'opt-c2', targetNodeId: 'end-b' },
        ],
      })
      
      const issues = validateQuest(quest)
      const errors = issues.filter(i => i.severity === 'error')
      
      expect(errors).toHaveLength(0)
    })
  })
})

describe('hasErrors', () => {
  it('should return true when there are error issues', () => {
    const issues = [
      { id: '1', severity: 'error' as const, type: 'TEST', message: 'Test error' },
      { id: '2', severity: 'warning' as const, type: 'TEST', message: 'Test warning' },
    ]
    
    expect(hasErrors(issues)).toBe(true)
  })

  it('should return false when there are only warnings', () => {
    const issues = [
      { id: '1', severity: 'warning' as const, type: 'TEST', message: 'Test warning' },
    ]
    
    expect(hasErrors(issues)).toBe(false)
  })

  it('should return false when there are no issues', () => {
    expect(hasErrors([])).toBe(false)
  })
})

describe('isQuestValid', () => {
  it('should return true for a valid quest', () => {
    const quest = createQuest({
      nodes: [
        createStartNode(),
        createEndNode(),
      ],
      connections: [
        { id: 'conn-1', sourceNodeId: 'start-1', sourceOptionId: 'opt-1', targetNodeId: 'end-1' },
      ],
    })
    
    expect(isQuestValid(quest)).toBe(true)
  })

  it('should return false for an invalid quest', () => {
    const quest = createQuest({
      nodes: [createEndNode()], // No START node
    })
    
    expect(isQuestValid(quest)).toBe(false)
  })
})

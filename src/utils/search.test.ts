import { describe, it, expect } from 'vitest'
import { searchNodes, getUniqueNodeIds } from './search'
import type {
  Quest,
  StartNode,
  DialogueNode,
  ChoiceNode,
  EventNode,
  EndNode,
  IfNode,
} from '@/types'

// Helper to create a minimal quest
function createQuest(nodes: Quest['nodes']): Quest {
  return {
    id: 'quest-1',
    name: 'Test Quest',
    nodes,
    connections: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

function createStartNode(overrides: Partial<StartNode> = {}): StartNode {
  return {
    id: 'start-1',
    type: 'START',
    position: { x: 0, y: 0 },
    title: 'Quest Start',
    description: 'Begin the adventure',
    options: [{ id: 'opt-1', label: 'Continue' }],
    ...overrides,
  }
}

function createDialogueNode(overrides: Partial<DialogueNode> = {}): DialogueNode {
  return {
    id: 'dialogue-1',
    type: 'DIALOGUE',
    position: { x: 100, y: 0 },
    speaker: 'Gandalf',
    text: 'You shall not pass!',
    options: [{ id: 'opt-d1', label: 'Okay' }],
    ...overrides,
  }
}

function createChoiceNode(overrides: Partial<ChoiceNode> = {}): ChoiceNode {
  return {
    id: 'choice-1',
    type: 'CHOICE',
    position: { x: 100, y: 0 },
    prompt: 'What will you do?',
    options: [
      { id: 'opt-c1', label: 'Fight' },
      { id: 'opt-c2', label: 'Flee' },
    ],
    ...overrides,
  }
}

function createEventNode(overrides: Partial<EventNode> = {}): EventNode {
  return {
    id: 'event-1',
    type: 'EVENT',
    position: { x: 100, y: 0 },
    eventId: 'global-event-1',
    eventName: 'PlayerVictory',
    action: 'TRIGGER',
    ...overrides,
  }
}

function createEndNode(overrides: Partial<EndNode> = {}): EndNode {
  return {
    id: 'end-1',
    type: 'END',
    position: { x: 200, y: 0 },
    title: 'Victory',
    outcome: 'SUCCESS',
    description: 'You have won the battle!',
    ...overrides,
  }
}

function createIfNode(overrides: Partial<IfNode> = {}): IfNode {
  return {
    id: 'if-1',
    type: 'IF',
    position: { x: 100, y: 0 },
    condition: 'playerLevel > 10',
    ...overrides,
  }
}

describe('searchNodes', () => {
  describe('empty query handling', () => {
    it('should return empty array for empty query', () => {
      const quest = createQuest([createStartNode()])

      const results = searchNodes(quest, '')

      expect(results).toEqual([])
    })

    it('should return empty array for whitespace-only query', () => {
      const quest = createQuest([createStartNode()])

      const results = searchNodes(quest, '   ')

      expect(results).toEqual([])
    })
  })

  describe('START node search', () => {
    it('should find START node by title', () => {
      const quest = createQuest([createStartNode({ title: 'The Beginning' })])

      const results = searchNodes(quest, 'beginning')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'start-1',
          matchType: 'name',
          matchedText: 'The Beginning',
        })
      )
    })

    it('should find START node by description', () => {
      const quest = createQuest([createStartNode({ description: 'Your journey starts here' })])

      const results = searchNodes(quest, 'journey')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'start-1',
          matchType: 'content',
          matchedText: 'Your journey starts here',
        })
      )
    })
  })

  describe('DIALOGUE node search', () => {
    it('should find DIALOGUE node by speaker', () => {
      const quest = createQuest([createDialogueNode({ speaker: 'Gandalf' })])

      const results = searchNodes(quest, 'gandalf')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'dialogue-1',
          matchType: 'speaker',
          matchedText: 'Gandalf',
        })
      )
    })

    it('should find DIALOGUE node by text', () => {
      const quest = createQuest([createDialogueNode({ text: 'Hello adventurer' })])

      const results = searchNodes(quest, 'adventurer')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'dialogue-1',
          matchType: 'content',
          matchedText: 'Hello adventurer',
        })
      )
    })

    it('should find DIALOGUE node by option label', () => {
      const quest = createQuest([
        createDialogueNode({
          options: [{ id: 'opt-1', label: 'Goodbye friend' }],
        }),
      ])

      const results = searchNodes(quest, 'goodbye')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'dialogue-1',
          matchType: 'option',
          matchedText: 'Goodbye friend',
        })
      )
    })
  })

  describe('CHOICE node search', () => {
    it('should find CHOICE node by prompt', () => {
      const quest = createQuest([createChoiceNode({ prompt: 'Choose your destiny' })])

      const results = searchNodes(quest, 'destiny')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'choice-1',
          matchType: 'content',
          matchedText: 'Choose your destiny',
        })
      )
    })

    it('should find CHOICE node by option label', () => {
      const quest = createQuest([
        createChoiceNode({
          options: [
            { id: 'opt-1', label: 'Attack the dragon' },
            { id: 'opt-2', label: 'Run away' },
          ],
        }),
      ])

      const results = searchNodes(quest, 'dragon')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'choice-1',
          matchType: 'choice',
          matchedText: 'Attack the dragon',
        })
      )
    })
  })

  describe('EVENT node search', () => {
    it('should find EVENT node by event name', () => {
      const quest = createQuest([createEventNode({ eventName: 'BossDefeated' })])

      const results = searchNodes(quest, 'boss')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'event-1',
          matchType: 'eventName',
          matchedText: 'BossDefeated',
        })
      )
    })
  })

  describe('END node search', () => {
    it('should find END node by title', () => {
      const quest = createQuest([createEndNode({ title: 'Victory Achieved' })])

      const results = searchNodes(quest, 'victory')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'end-1',
          matchType: 'name',
          matchedText: 'Victory Achieved',
        })
      )
    })

    it('should find END node by description', () => {
      const quest = createQuest([createEndNode({ description: 'The kingdom is saved' })])

      const results = searchNodes(quest, 'kingdom')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'end-1',
          matchType: 'content',
          matchedText: 'The kingdom is saved',
        })
      )
    })
  })

  describe('IF node search', () => {
    it('should find IF node by condition', () => {
      const quest = createQuest([createIfNode({ condition: 'hasItem("sword")' })])

      const results = searchNodes(quest, 'sword')

      expect(results).toContainEqual(
        expect.objectContaining({
          nodeId: 'if-1',
          matchType: 'content',
          matchedText: 'hasItem("sword")',
        })
      )
    })
  })

  describe('case insensitivity', () => {
    it('should match regardless of case', () => {
      const quest = createQuest([createDialogueNode({ speaker: 'GANDALF' })])

      const results = searchNodes(quest, 'gandalf')

      expect(results).toHaveLength(1)
      expect(results[0].matchedText).toBe('GANDALF')
    })

    it('should find with uppercase query', () => {
      const quest = createQuest([createDialogueNode({ speaker: 'gandalf' })])

      const results = searchNodes(quest, 'GANDALF')

      expect(results).toHaveLength(1)
    })
  })

  describe('multiple matches', () => {
    it('should find multiple matches in same node', () => {
      const quest = createQuest([
        createDialogueNode({
          speaker: 'Quest Giver',
          text: 'Complete the quest for a reward',
        }),
      ])

      const results = searchNodes(quest, 'quest')

      // Should match both speaker and text
      expect(results.length).toBeGreaterThanOrEqual(2)
    })

    it('should find matches across multiple nodes', () => {
      const quest = createQuest([
        createStartNode({ title: 'Dragon Quest' }),
        createDialogueNode({ speaker: 'Dragon' }),
        createEndNode({ title: 'Dragon Defeated' }),
      ])

      const results = searchNodes(quest, 'dragon')

      expect(results.length).toBe(3)
    })
  })

  describe('partial matches', () => {
    it('should find partial word matches', () => {
      const quest = createQuest([createDialogueNode({ speaker: 'Adventurer' })])

      const results = searchNodes(quest, 'advent')

      expect(results).toHaveLength(1)
    })
  })
})

describe('getUniqueNodeIds', () => {
  it('should return unique node IDs', () => {
    const results = [
      { nodeId: 'node-1', matchType: 'name' as const, matchedText: 'Test' },
      { nodeId: 'node-1', matchType: 'content' as const, matchedText: 'Test content' },
      { nodeId: 'node-2', matchType: 'name' as const, matchedText: 'Another' },
    ]

    const uniqueIds = getUniqueNodeIds(results)

    expect(uniqueIds).toHaveLength(2)
    expect(uniqueIds).toContain('node-1')
    expect(uniqueIds).toContain('node-2')
  })

  it('should return empty array for empty results', () => {
    const uniqueIds = getUniqueNodeIds([])

    expect(uniqueIds).toEqual([])
  })
})

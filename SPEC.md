# Quest Designer - Technical Specification

> A visual node-based quest design tool for game developers

---

## Table of Contents

1. [Overview](#overview)
2. [User Interface](#user-interface)
3. [Node System](#node-system)
4. [Connection System](#connection-system)
5. [Event System](#event-system)
6. [Condition System](#condition-system)
7. [Data Models](#data-models)
8. [Export Format](#export-format)
9. [Technical Architecture](#technical-architecture)
10. [Visual Design](#visual-design)
11. [Testing & CI](#testing--ci)

---

## Overview

### Purpose

Quest Designer is a desktop application that enables game designers to create complex, branching quest narratives using a visual node-based editor. The tool supports:

- **Multi-quest projects** with interconnected storylines
- **Branching dialogues** with player choices
- **Cross-quest events** that affect game state
- **Conditional logic** for dynamic quest flows
- **JSON export** for game engine integration
- **Quest simulation/preview** for testing quest flows
- **Node search** for navigating large quests
- **Auto-layout** for automatic node arrangement

### Target Users

- Game designers
- Narrative designers
- Writers working on interactive fiction
- Indie developers building RPGs

---

## User Interface

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  Toolbar: Save | Auto-save | Import | Export | Validate | Layout    │
│           | Search | Preview                              Project   │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│   SIDEBAR    │                    CANVAS                            │
│              │                                                      │
│  ┌─────────┐ │     ┌─────────┐         ┌─────────┐                  │
│  │ Quests  │ │     │  START  │────────▶│ CHOICE  │                  │
│  ├─────────┤ │     └─────────┘         └─────────┘                  │
│  │ Quest 1 │ │                              │                       │
│  │ Quest 2 │ │                              ▼                       │
│  │ Quest 3 │ │                         ┌─────────┐                  │
│  └─────────┘ │                         │   END   │                  │
│              │                         └─────────┘                  │
│  ┌─────────┐ │                                                      │
│  │ Events  │ │                                                      │
│  ├─────────┤ │                                      ┌───────────┐   │
│  │ Event A │ │                                      │  Controls │   │
│  │ Event B │ │                                      │  + - ⛶    │   │
│  └─────────┘ │                    ┌─────────┐       └───────────┘   │
│              │                    │ MiniMap │                       │
│              │                    └─────────┘                       │
├──────────────┴──────────────────────────────────────────────────────┤
│  Status Bar: ● Saved | Zoom: 100% | Nodes: 12 | Connections: 8      │
└─────────────────────────────────────────────────────────────────────┘
```

### Welcome Screen

When no project is loaded, a welcome screen is displayed with options to:
- **Create a new project** — prompts for project name
- **Open an existing project** — file picker for `.json` files
- **Open recent project** — loads last opened project (stored in localStorage)

### Toolbar

A horizontal button bar at the top of the window. On macOS, includes a drag region with traffic light spacer.

| Button | Description | Shortcut |
|--------|-------------|----------|
| **Save** | Save project to file | `Cmd/Ctrl + S` |
| **Auto-save** | Toggle auto-save on/off (2s debounce) | — |
| **Import** | Import a quest from JSON | — |
| **Export** | Dropdown: Export Current Quest / Export Entire Project | `Cmd/Ctrl + E` |
| **Validate** | Run quest validation, open results panel | `Cmd/Ctrl + T` |
| **Auto Layout** | Auto-arrange nodes using hierarchical layout | — |
| **Search** | Open node search panel | `Cmd/Ctrl + F` |
| **Preview** | Start quest simulation from START node | — |

### Sidebar

Two tabs: **Quests** and **Events**.

**Quests Tab:**
- List of all quests in the project
- Add new quest button (+)
- Click to open quest in canvas
- Right-click context menu: Rename, Delete
- Visual indicator for currently edited quest (highlighted row)

**Events Tab:**
- List of all global events
- Add new event button (+)
- Click to open event edit panel
- Right-click context menu: Edit Parameters, Rename, Delete

### Canvas

**Interactions:**
- **Pan**: Middle-mouse drag or Space + Left-drag
- **Zoom**: Scroll wheel or trackpad pinch (0.1x–2x range, capped at 1x on fitView)
- **Select node**: Left-click
- **Move node**: Drag selected node(s)
- **Delete**: Select + Delete/Backspace key (opens confirmation modal)
- **Context menu**: Right-click on empty canvas

**Context Menu (Right-click on empty canvas):**
```
┌──────────────────┐
│ Add Node         │
├──────────────────┤
│   ▸ Start        │
│   ▸ Dialogue     │
│   ▸ Choice       │
│   ▸ Event        │
│   ▸ Condition    │
│   ▸ End          │
└──────────────────┘
```

**Canvas Controls (bottom-right):**
- Zoom in / Zoom out buttons
- Fit to view button

**MiniMap (bottom-left):**
- Color-coded node overview of the full quest graph

### Status Bar

Bottom bar showing live information:
- **Save indicator**: Green dot (saved) or orange dot (unsaved changes)
- **Zoom level**: Updates in real time as viewport changes
- **Node count** and **Connection count** for current quest
- **Current quest name** (right-aligned)

### Node Edit Panel

Opens as a slide-in panel from the right side when a node is double-clicked.

```
┌─────────────────────────────────────┐
│  ✓  START NODE                   ✕  │
├─────────────────────────────────────┤
│                                     │
│  Node ID: start_001                 │
│                                     │
│  Title                              │
│  ┌─────────────────────────────────┐│
│  │ Quest Start                     ││
│  └─────────────────────────────────┘│
│                                     │
│  Location Name                      │
│  ┌─────────────────────────────────┐│
│  │ Rivenhold                       ││
│  └─────────────────────────────────┘│
│  X        Y        Z                │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ 125  │ │ 340  │ │      │         │
│  └──────┘ └──────┘ └──────┘         │
│                                     │
│  NPC Name          NPC Type         │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Glosnar      │  │ Orc          │ │
│  └──────────────┘  └──────────────┘ │
│                                     │
│  Description                        │
│  ┌─────────────────────────────────┐│
│  │ Wolves are killing merchants.   ││
│  │ Get rid of them!                ││
│  └─────────────────────────────────┘│
│                                     │
│  Options                    + Add   │
│  ┌─────────────────────────────────┐│
│  │ ≡ Accept                    🗑  ││
│  ├─────────────────────────────────┤│
│  │ ≡ Tell me more              🗑  ││
│  ├─────────────────────────────────┤│
│  │ ≡ Reject                    🗑  ││
│  └─────────────────────────────────┘│
│                                     │
│          [Cancel]  [Save Changes]   │
└─────────────────────────────────────┘
```

### Search Panel

Floating panel activated by `Cmd/Ctrl + F`. Searches node text, speakers, titles, and descriptions. Results are clickable — selecting a result focuses and pans the canvas to that node. Matching nodes are highlighted with a pulsing animation on the canvas.

### Simulation Panel

Activated from the Preview toolbar button. Provides a step-through simulation of the quest flow:
- Starts from the START node (or first node if no START exists)
- Displays current node content (text, speaker, options)
- Clicking an option advances to the connected node
- Condition nodes (IF/AND/OR) show true/false branch options
- EVENT CHECK nodes show triggered/not-triggered branches
- Back button to retrace steps
- Active simulation node is highlighted on the canvas with a glow animation
- Canvas pans to follow the current node

### Node Actions

Each node shows action buttons on hover (top-right corner):
- **Edit** (pencil icon) — opens the edit panel
- **Delete** (trash icon) — opens delete confirmation modal

---

## Node System

### Node Types

#### 1. START Node

The entry point of a quest. Each quest should have one START node.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "START" | ✓ | Node type constant |
| `title` | string | ✓ | Display title |
| `location` | Location | ✗ | World coordinates |
| `npc` | NPC | ✗ | Quest giver NPC |
| `description` | string | ✓ | Quest hook/introduction |
| `options` | Option[] | ✓ | Player response options |
| `position` | Position | ✓ | Canvas position |

**Visual:**
```
┌─────────────────────────────────────┐
│ ▶ START                             │
├─────────────────────────────────────┤
│ 📍 Rivenhold (125, _, 340)          │
│ 👤 Glosnar (Orc)                    │
├─────────────────────────────────────┤
│ "Wolves are killing merchants..."   │
├─────────────────────────────────────┤
│                         ○ Accept    │
│                         ○ Tell more │
│                         ○ Reject    │
└─────────────────────────────────────┘
```

#### 2. DIALOGUE Node

Represents NPC dialogue or narrative text.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "DIALOGUE" | ✓ | Node type constant |
| `speaker` | string | ✗ | Who is speaking |
| `text` | string | ✓ | Dialogue content |
| `options` | Option[] | ✓ | Player response options |
| `position` | Position | ✓ | Canvas position |

**Visual:**
```
┌─────────────────────────────────────┐
│ 💬 DIALOGUE                         │
├─────────────────────────────────────┤
│ 👤 Glosnar                          │
├─────────────────────────────────────┤
│ "The wolves den is north of here,   │
│  past the old mill..."              │
├─────────────────────────────────────┤
│ ○─────────────────────── Continue ○ │
└─────────────────────────────────────┘
```

#### 3. CHOICE Node

A decision point where player must choose between options.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "CHOICE" | ✓ | Node type constant |
| `prompt` | string | ✗ | Optional prompt text |
| `options` | Option[] | ✓ | Available choices |
| `position` | Position | ✓ | Canvas position |

**Visual:**
```
┌─────────────────────────────────────┐
│ ◆ CHOICE                            │
│ ○────────────────────────────────── │
├─────────────────────────────────────┤
│ What do you do with the ember?      │
├─────────────────────────────────────┤
│               ○ Give to Iron Crown  │
│               ○ Give to Conclave    │
│               ○ Keep it             │
└─────────────────────────────────────┘
```

#### 4. EVENT Node

Triggers or checks a global event that can affect other quests.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "EVENT" | ✓ | Node type constant |
| `eventId` | string | ✓ | Reference to global event |
| `eventName` | string | ✗ | Display name for the event |
| `action` | "TRIGGER" \| "CHECK" | ✓ | Trigger event or check if triggered |
| `parameters` | Record<string, unknown> | ✗ | Optional event parameters |
| `position` | Position | ✓ | Canvas position |

**Visual (TRIGGER):**
```
┌─────────────────────────────────────┐
│ ⚡ EVENT: Trigger                    │
│ ○────────────────────────────────── │
├─────────────────────────────────────┤
│ 🎯 ember_given_to_crown             │
│ Params: { recipient: "Iron Crown" } │
├─────────────────────────────────────┤
│ ──────────────────────────────── ○  │
└─────────────────────────────────────┘
```

**Visual (CHECK):**
```
┌─────────────────────────────────────┐
│ ⚡ EVENT: Check                      │
│ ○────────────────────────────────── │
├─────────────────────────────────────┤
│ 🔍 player_betrayed_king             │
├─────────────────────────────────────┤
│                      ○ Triggered    │
│                      ○ Not triggered│
└─────────────────────────────────────┘
```

#### 5. CONDITION Nodes (IF / AND / OR)

Logic gates for conditional branching.

**IF Node:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "IF" | ✓ | Node type constant |
| `condition` | string | ✓ | Free-text condition expression |
| `position` | Position | ✓ | Canvas position |

**Visual:**
```
┌─────────────────────────────────────┐
│ ❓ IF                               │
│ ○────────────────────────────────── │
├─────────────────────────────────────┤
│ player.hasItem("ember")             │
├─────────────────────────────────────┤
│                           ○ True    │
│                           ○ False   │
└─────────────────────────────────────┘
```

**AND Node:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "AND" | ✓ | Node type constant |
| `inputCount` | number | ✓ | Number of inputs (default 2) |
| `position` | Position | ✓ | Canvas position |

```
┌─────────────────────────────────────┐
│ & AND                               │
├─────────────────────────────────────┤
│ Input 1 ○                           │
│ Input 2 ○         (all must pass)   │
│ Input 3 ○                           │
├─────────────────────────────────────┤
│                           ○ True    │
│                           ○ False   │
└─────────────────────────────────────┘
```

**OR Node:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "OR" | ✓ | Node type constant |
| `inputCount` | number | ✓ | Number of inputs (default 2) |
| `position` | Position | ✓ | Canvas position |

```
┌─────────────────────────────────────┐
│ | OR                                │
├─────────────────────────────────────┤
│ Input 1 ○                           │
│ Input 2 ○         (any can pass)    │
│ Input 3 ○                           │
├─────────────────────────────────────┤
│                           ○ True    │
│                           ○ False   │
└─────────────────────────────────────┘
```

#### 6. END Node

Quest conclusion with outcome details.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier |
| `type` | "END" | ✓ | Node type constant |
| `title` | string | ✓ | Ending name |
| `outcome` | "SUCCESS" \| "FAILURE" \| "NEUTRAL" | ✓ | Outcome type |
| `description` | string | ✗ | Ending narrative |
| `rewards` | Reward[] | ✗ | Quest rewards |
| `factionChanges` | FactionChange[] | ✗ | Reputation changes |
| `triggeredEvents` | string[] | ✗ | Events to trigger on completion |
| `position` | Position | ✓ | Canvas position |

**Visual:**
```
┌─────────────────────────────────────┐
│ ■ END: Success                      │
│ ○────────────────────────────────── │
├─────────────────────────────────────┤
│ "The Ember's Light"                 │
├─────────────────────────────────────┤
│ 🎁 +500 Gold                        │
│ 🎁 Forgemaster's Blade              │
├─────────────────────────────────────┤
│ ⚔️ Iron Crown: +20                  │
│ 😠 Conclave: -10                    │
├─────────────────────────────────────┤
│ ⚡ Triggers: ember_delivered         │
└─────────────────────────────────────┘
```

---

## Connection System

### Connection Types

Connections link node **outputs** (options, true/false handles) to node **inputs**.

```
┌──────────────┐                    ┌──────────────┐
│    NODE A    │                    │    NODE B    │
│              │                    │              │
│      Option1 ○────────────────────○              │
│      Option2 ○──────┐             └──────────────┘
│      Option3 ○──┐   │             ┌──────────────┐
└──────────────┘  │   │             │    NODE C    │
                  │   └─────────────○              │
                  │                 └──────────────┘
                  │                 ┌──────────────┐
                  │                 │    NODE D    │
                  └─────────────────○              │
                                    └──────────────┘
```

### Creating Connections

1. **Hover** over a node option → connection handle (○) becomes visible
2. **Click and drag** from the handle
3. **Drag** toward target node → target node highlights when valid
4. **Release** on target node's input → connection created
5. Connection line animates into place

### Connection Data

```typescript
interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOptionId?: string;  // Which option (for nodes with options)
  sourceOutput?: string;    // "true" | "false" for IF/AND/OR/EVENT CHECK
  targetNodeId: string;
  targetHandle?: string;    // For nodes with multiple inputs (AND/OR)
}
```

### Connection Visual States

| State | Appearance |
|-------|------------|
| Default | Bezier curve, animated flow, color matching source node type |
| Hover | Line brightens, "✕" delete button appears at midpoint |

### Deleting Connections

- **Hover** over connection line → "✕" button appears at the midpoint
- **Click "✕"** → connection is immediately removed

### Connection Rules

| From Node Type | Can Connect To |
|----------------|----------------|
| START | DIALOGUE, CHOICE, EVENT, IF, AND, OR, END |
| DIALOGUE | DIALOGUE, CHOICE, EVENT, IF, AND, OR, END |
| CHOICE | DIALOGUE, CHOICE, EVENT, IF, AND, OR, END |
| EVENT (TRIGGER) | DIALOGUE, CHOICE, EVENT, IF, AND, OR, END |
| EVENT (CHECK) | Via True/False outputs to any node |
| IF | Via True/False outputs to any node |
| AND | Via True/False outputs to any node |
| OR | Via True/False outputs to any node |
| END | ✗ (terminal node) |

### Loop Connections

Connections are **unidirectional** but can point to **any node**, including earlier nodes in the flow. This enables:

- **Hub conversations**: Return to main dialogue menu after sub-topics
- **Retry scenarios**: "Let me think about it" → loops back
- **Negotiation flows**: Back-and-forth until agreement

**Validation Note**: The validation system handles loops correctly — it tracks visited nodes to avoid infinite traversal while still detecting true dead ends.

---

## Event System

### Global Events

Events are project-wide flags that can:
- Be **triggered** in one quest
- Be **checked** in any quest

### Event Definition

```typescript
interface GlobalEvent {
  id: string;
  name: string;
  description?: string;
  parameters?: EventParameter[];
  usedInQuests: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventParameter {
  name: string;
  type: "string" | "number" | "boolean";
  defaultValue?: unknown;
  description?: string;
}
```

### Event Usage Flow

**Quest A (Trigger):**
```
[CHOICE: What to do with ember?]
         │
         ├──"Give to Iron Crown"──▶ [EVENT: TRIGGER ember_decision]
         │                          params: { recipient: "iron_crown" }
         │
         ├──"Give to Conclave"────▶ [EVENT: TRIGGER ember_decision]
         │                          params: { recipient: "conclave" }
         │
         └──"Keep it"─────────────▶ [EVENT: TRIGGER ember_decision]
                                    params: { recipient: "self" }
```

**Quest B (Check):**
```
[START: The Aftermath]
         │
         ▼
[EVENT: CHECK ember_decision]
         │
         ├──Triggered────▶ [DIALOGUE: Continue story]
         │
         └──Not triggered─▶ [DIALOGUE: Different path]
```

### Event Management

Events are managed from the **Events** tab in the sidebar:
- Create new events with the **+** button
- Click an event to edit its parameters in a slide-in panel
- Right-click context menu: Edit Parameters, Rename, Delete
- Event edit panel allows adding/removing typed parameters

---

## Condition System

### Overview

Conditions in Quest Designer use a **free-text expression** approach. The IF node stores a single `condition` string that the game engine evaluates at runtime.

### IF Node Condition

The condition is a free-text string entered by the designer:

```
player.hasItem("ember")
faction.reputation("dwarves") > 50
event.triggered("ember_delivered")
custom.check("player_level") >= 10
```

The tool does not validate or parse these expressions — they are passed as-is in the exported JSON for the game engine to interpret.

### Compound Conditions

For complex conditions, use AND/OR nodes to combine multiple IF checks:

```
                    ┌─────────────────────────┐
[IF: hasItem]──────▶│                         │
                    │         AND             │────▶ [Continue quest]
[IF: reputation]───▶│                         │
                    └─────────────────────────┘
```

AND/OR nodes accept multiple inputs via configurable `inputCount` handles and output True/False.

---

## Data Models

### Project Structure

```typescript
interface Project {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  quests: Quest[];
  events: GlobalEvent[];
  settings: ProjectSettings;
}

interface ProjectSettings {
  autoSave: boolean;
  autoSaveInterval: number; // seconds
  gridSnap: boolean;
  gridSize: number;
}
```

### Quest Structure

```typescript
interface Quest {
  id: string;
  name: string;
  description?: string;
  nodes: QuestNode[];
  connections: Connection[];
  viewport: Viewport;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}
```

### Node Types (TypeScript)

```typescript
type QuestNode =
  | StartNode
  | DialogueNode
  | ChoiceNode
  | EventNode
  | IfNode
  | AndNode
  | OrNode
  | EndNode;

interface BaseNode {
  id: string;
  type: NodeType;
  position: Position;
  width?: number;
  height?: number;
}

type NodeType = "START" | "DIALOGUE" | "CHOICE" | "EVENT" | "IF" | "AND" | "OR" | "END";

interface Position {
  x: number;
  y: number;
}

interface StartNode extends BaseNode {
  type: "START";
  title: string;
  location?: Location;
  npc?: NPC;
  description: string;
  options: Option[];
}

interface DialogueNode extends BaseNode {
  type: "DIALOGUE";
  speaker?: string;
  text: string;
  options: Option[];
}

interface ChoiceNode extends BaseNode {
  type: "CHOICE";
  prompt?: string;
  options: Option[];
}

interface EventNode extends BaseNode {
  type: "EVENT";
  eventId: string;
  eventName?: string;
  action: "TRIGGER" | "CHECK";
  parameters?: Record<string, unknown>;
}

interface IfNode extends BaseNode {
  type: "IF";
  condition: string;
}

interface AndNode extends BaseNode {
  type: "AND";
  inputCount: number;
}

interface OrNode extends BaseNode {
  type: "OR";
  inputCount: number;
}

interface EndNode extends BaseNode {
  type: "END";
  title: string;
  outcome: "SUCCESS" | "FAILURE" | "NEUTRAL";
  description?: string;
  rewards?: Reward[];
  factionChanges?: FactionChange[];
  triggeredEvents?: string[];
}
```

### Supporting Types

```typescript
interface Option {
  id: string;
  label: string;
  shortLabel?: string;
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOptionId?: string;  // Which option (for nodes with options)
  sourceOutput?: string;    // "true" | "false" for IF/AND/OR/EVENT CHECK
  targetNodeId: string;
  targetHandle?: string;    // For nodes with multiple inputs (AND/OR)
}

interface Location {
  name?: string;
  x?: number;
  y?: number;
  z?: number;
}

interface NPC {
  id?: string;
  name: string;
  type?: string; // e.g., "Orc", "Human", "Elf"
}

interface Reward {
  type: "ITEM" | "GOLD" | "EXPERIENCE" | "CUSTOM";
  value: string | number;
  quantity?: number;
}

interface FactionChange {
  factionId: string;
  factionName: string;
  change: number; // Positive or negative
}
```

---

## Export Format

### Basic JSON Export

```json
{
  "version": "1.0.0",
  "exportedAt": "2026-02-08T15:30:00Z",
  "project": {
    "name": "The Ember Chronicles",
    "quests": [
      {
        "id": "quest_001",
        "name": "The Ember of the Forgotten Forge",
        "nodes": [
          {
            "id": "start_001",
            "type": "START",
            "title": "The Battered Caravan",
            "location": {
              "name": "Rivenhold",
              "x": 125,
              "z": 340
            },
            "npc": {
              "name": "Marcus",
              "type": "Human"
            },
            "description": "A battered caravan arrives at the frontier town...",
            "options": [
              { "id": "opt_001", "label": "Accept the quest" },
              { "id": "opt_002", "label": "Ask for more details" },
              { "id": "opt_003", "label": "Decline" }
            ],
            "position": { "x": 100, "y": 100 }
          },
          {
            "id": "choice_001",
            "type": "CHOICE",
            "prompt": "What do you do with the Ember?",
            "options": [
              { "id": "opt_010", "label": "Give to Iron Crown" },
              { "id": "opt_011", "label": "Give to Conclave" },
              { "id": "opt_012", "label": "Keep it" }
            ],
            "position": { "x": 400, "y": 300 }
          }
        ],
        "connections": [
          {
            "id": "conn_001",
            "sourceNodeId": "start_001",
            "sourceOptionId": "opt_001",
            "targetNodeId": "dialogue_001"
          }
        ]
      }
    ],
    "events": [
      {
        "id": "evt_ember_decision",
        "name": "ember_decision",
        "description": "Tracks what the player did with the Ember",
        "parameters": [
          {
            "name": "recipient",
            "type": "string",
            "description": "Who received the ember"
          }
        ]
      }
    ]
  }
}
```

---

## Technical Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Desktop Shell | **Electron** | Cross-platform desktop app |
| Frontend | **React 18+ with TypeScript** | UI components |
| Canvas | **React Flow (@xyflow/react)** | Node-based editor |
| Styling | **Tailwind CSS** | Utility-first CSS |
| State | **Zustand** | Lightweight state management |
| Build | **Vite + electron-builder** | Fast bundling & packaging |
| Unit Tests | **Vitest** | Fast unit testing |
| E2E Tests | **Playwright** | Electron end-to-end testing |
| CI/CD | **GitHub Actions** | Automated testing & builds |

### Project Structure

```
quest-designer/
├── .github/
│   └── workflows/
│       └── ci.yml               # CI pipeline (tests, lint, build)
├── build/
│   └── icon.png                 # App icon
├── demo/
│   ├── README.md                # Demo project documentation
│   └── quest-designer-demo.json # Demo project
├── e2e/
│   └── app.spec.ts              # End-to-end Playwright tests
├── electron/
│   ├── main.ts                  # Electron main process + IPC handlers
│   └── preload.ts               # Preload script (contextBridge)
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root component (ReactFlowProvider)
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── WelcomeScreen.tsx    # Initial project creation / loading
│   │   ├── edges/
│   │   │   └── DeletableEdge.tsx  # Edge with hover delete button
│   │   ├── layout/
│   │   │   ├── Canvas.tsx       # React Flow canvas wrapper
│   │   │   ├── Sidebar.tsx      # Quests & Events tabs
│   │   │   ├── StatusBar.tsx    # Bottom status bar
│   │   │   └── Toolbar.tsx      # Top button toolbar
│   │   ├── nodes/
│   │   │   ├── index.ts
│   │   │   ├── NodeActions.tsx  # Hover action buttons (edit/delete)
│   │   │   ├── StartNode.tsx
│   │   │   ├── DialogueNode.tsx
│   │   │   ├── ChoiceNode.tsx
│   │   │   ├── EventNode.tsx
│   │   │   ├── ConditionNode.tsx
│   │   │   └── EndNode.tsx
│   │   ├── panels/
│   │   │   ├── NodeEditPanel.tsx     # Node property editor
│   │   │   ├── EventEditPanel.tsx    # Event property editor
│   │   │   ├── SearchPanel.tsx       # Node search overlay
│   │   │   ├── SimulationPanel.tsx   # Quest preview/simulation
│   │   │   └── ValidationPanel.tsx   # Validation results
│   │   └── ui/
│   │       ├── ContextMenu.tsx  # Right-click context menu
│   │       └── DeleteModal.tsx  # Delete confirmation dialog
│   ├── hooks/
│   │   ├── useAutoSave.ts       # Auto-save with debounce
│   │   └── useKeyboardShortcuts.ts  # Global keyboard shortcuts
│   ├── stores/
│   │   ├── projectStore.ts      # Project data + settings state
│   │   └── uiStore.ts           # UI state (panels, menus, search, simulation)
│   ├── styles/
│   │   └── globals.css          # Tailwind + custom node styles
│   ├── test/
│   │   └── setup.ts             # Vitest setup
│   ├── types/
│   │   ├── index.ts             # All TypeScript interfaces
│   │   └── electron.d.ts        # Window.electronAPI type declarations
│   └── utils/
│       ├── autoLayout.ts        # Hierarchical node auto-arrangement
│       ├── export.ts            # Export + import utilities
│       ├── search.ts            # Node search logic
│       ├── validation.ts        # Quest validation rules
│       ├── export.test.ts
│       ├── search.test.ts
│       └── validation.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.mjs
├── .prettierrc
└── .prettierignore
```

### IPC Communication

File operations are handled via Electron IPC with `contextIsolation: true`:

```typescript
// preload.ts — exposed via contextBridge as window.electronAPI
electronAPI = {
  saveFile: (data, filePath?) => ipcRenderer.invoke('file:save', data, filePath),
  loadFile: () => ipcRenderer.invoke('file:load'),
  loadFromPath: (filePath) => ipcRenderer.invoke('file:loadFromPath', filePath),
  exportFile: (data, defaultName) => ipcRenderer.invoke('file:export', data, defaultName),
  platform: process.platform,
}
```

| IPC Channel | Description |
|-------------|-------------|
| `file:save` | Save project JSON (show Save dialog if no path) |
| `file:load` | Open file picker, read and return JSON |
| `file:loadFromPath` | Load directly from a known path (recent projects) |
| `file:export` | Export with Save-As dialog |

### State Management

**projectStore** (Zustand) manages:
- Project data, current quest, selected node, clipboard
- CRUD operations for quests, nodes, connections, events
- Auto-save toggle, dirty state, file path
- Auto-layout application
- Copy/paste nodes

**uiStore** (Zustand) manages:
- Edit panel state (node and event)
- Context menu state
- Delete modal state
- Sidebar tab selection
- Validation state
- Search state (query, results, open/close)
- Simulation state (current node, history, navigation)
- Canvas focus (pan-to-node)

### Auto Layout

The auto-layout feature uses a hierarchical BFS algorithm:
1. Builds a directed graph from quest connections
2. Assigns levels via BFS from root nodes (nodes with no parents)
3. Reads **actual DOM-measured node dimensions** from React Flow for pixel-perfect spacing
4. Falls back to content-based height estimation when measurements aren't available
5. Computes cumulative Y offsets per level based on the tallest node in each row
6. Centers nodes horizontally within each level

---

## Visual Design

### Theme: Unreal Blueprints Inspired

**Color Palette:**

| Element | Color | Hex |
|---------|-------|-----|
| Background (main) | Dark charcoal | `#1a1a1a` |
| Background (sidebar) | Darker charcoal | `#141414` |
| Background (panels) | Slate | `#252525` |
| Grid dots | Subtle gray | `#2a2a2a` |
| Primary accent | Blueprint blue | `#4a9eff` |
| Node: START | Green | `#22c55e` |
| Node: DIALOGUE | Blue | `#3b82f6` |
| Node: CHOICE | Purple | `#a855f7` |
| Node: EVENT | Orange | `#f97316` |
| Node: IF/AND/OR | Cyan | `#06b6d4` |
| Node: END | Red/Rose | `#f43f5e` |
| Text primary | Off-white | `#e5e5e5` |
| Text secondary | Gray | `#a3a3a3` |
| Connection lines | Node color (muted) | varies |

### Node Visual Style

```
     ╭──────────────────────────────────────╮
     │ ▶ START                              │  ← Header with type icon + color
     ├──────────────────────────────────────┤
     │ 📍 Rivenhold                         │  ← Meta info (subtle)
     │ 👤 Glosnar the Orc                   │
     ├──────────────────────────────────────┤
     │                                      │
     │ "Wolves are killing merchants..."    │  ← Main content
     │                                      │
     ├──────────────────────────────────────┤
     │                          ◉ Accept    │  ← Options with connection handles
     │                          ◉ Tell more │     (handles on right side)
     │                          ◉ Reject    │
     ╰──────────────────────────────────────╯
          ↑
          Input handle (left side, centered)
```

Node dimensions: `min-width: 140px`, `max-width: 280px`.

### Connection Style

- **Bezier curves** with smooth animation
- **Color** matches source node type (muted)
- **Animated flow** dots moving along path
- **Hover state**: Line glows, delete button (✕) appears at midpoint

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Node headers | System monospace (`font-mono`) | 14px | 600 |
| Node content | Inter / system sans-serif | 14px (`text-sm`) | 400 |
| Sidebar titles | Inter / system sans-serif | 11px | 600 |
| Input labels | Inter / system sans-serif | 12px | 500 |

### Iconography

Using **Lucide Icons** (open source, consistent style):
- `Play` → START
- `MessageSquare` → DIALOGUE
- `GitBranch` → CHOICE
- `Zap` → EVENT
- `HelpCircle` → IF
- `GitMerge` → AND
- `GitPullRequest` → OR
- `Square` → END

---

## Quest Validation

### Purpose

Allow designers to validate quest integrity by checking that all branches lead to proper endings.

### Triggering Validation

- **Validate button** (🧪) in the toolbar
- **Keyboard shortcut**: `Cmd/Ctrl + T`

### Validation Rules

| Rule | Description | Severity |
|------|-------------|----------|
| **Dead End** | Option/branch doesn't lead to END or EVENT node | 🔴 Error |
| **Orphan Node** | Node has no incoming connections (except START) | 🟡 Warning |
| **Missing START** | Quest has no START node | 🔴 Error |
| **Multiple START** | Quest has more than one START node | 🔴 Error |
| **Unreachable Node** | Node cannot be reached from START | 🟡 Warning |
| **Empty Option** | Option has no label text | 🟡 Warning |
| **Unconnected Option** | Option has no outgoing connection | 🔴 Error |

### Validation Algorithm

```
1. Find START node
2. Traverse all possible paths using DFS/BFS
3. For each path:
   - Track visited nodes to handle loops
   - Continue until reaching END, EVENT (trigger), or dead end
4. Mark dead ends (nodes/options that don't terminate properly)
5. Find orphan nodes (not visited during traversal)
6. Generate validation report
```

### Validation Panel

Shows summary of all issues with **[Go to]** buttons that pan the canvas to the problematic node:

```
┌─────────────────────────────────────────────────────────────┐
│  🧪 VALIDATION RESULTS                               ✕      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ 2 Errors   ⚠️ 1 Warning                                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🔴 ERRORS                                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Dead End                                    [Go to] │    │
│  │ CHOICE "What do you do?" → Option "Keep it"         │    │
│  │ This option doesn't lead to an END or EVENT node    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🟡 WARNINGS                                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Orphan Node                                 [Go to] │    │
│  │ DIALOGUE "Unused conversation"                      │    │
│  │ This node cannot be reached from START              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### "Go to" Functionality

Clicking **[Go to]** on any issue:
1. Pans canvas to center the problematic node
2. Uses smooth animation with appropriate zoom level

### Clearing Validation State

- **Close panel**: Click ✕ or press Escape
- **Re-run**: Click Validate again

---

## Testing & CI

### Unit Tests

Unit tests use **Vitest** and cover utility functions:
- `validation.test.ts` — quest validation rules
- `export.test.ts` — export/import functionality
- `search.test.ts` — node search logic

Run with: `npm run test` or `npm run test:coverage`

### End-to-End Tests

E2E tests use **Playwright** with Electron:
- Located in `e2e/app.spec.ts`
- Tests run against the built Electron application
- Sequential execution (single worker for Electron)
- 2 retries on CI, 0 locally

**Playwright configuration:**
- Traces: retained on failure
- Screenshots: captured on failure
- Video: retained on failure

Run with: `npm run test:e2e`

### CI Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push to `main` and on PRs:

| Job | Runs on | Description |
|-----|---------|-------------|
| **Unit Tests** | ubuntu-latest | Runs unit tests with coverage |
| **E2E Tests** | ubuntu, macOS, Windows | Builds app, runs Playwright tests |
| **Lint & Type Check** | ubuntu-latest | Prettier, ESLint, TypeScript |
| **Build** | ubuntu, macOS, Windows | Verifies production build |

E2E test artifacts (traces, screenshots, reports) are uploaded for debugging failures.

---

## Appendix: Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Export | `Cmd/Ctrl + E` |
| **Validate Quest** | `Cmd/Ctrl + T` |
| **Search** | `Cmd/Ctrl + F` |
| Copy node | `Cmd/Ctrl + C` |
| Paste node | `Cmd/Ctrl + V` |
| Delete selected | `Delete` / `Backspace` |
| Close panels | `Escape` |
| Pan | `Space + Drag` |

---

*Document Version: 2.0*
*Last Updated: February 10, 2026*

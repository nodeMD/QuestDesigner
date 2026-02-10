# Quest Designer – Demo docs

## Demo project

**`quest-designer-demo.json`** is a full Quest Designer project you can open to see all features in one place.

### How to use

1. Open Quest Designer.
2. Click **Open Project** (or **Open Recent** if you opened it before).
3. Choose `docs/quest-designer-demo.json`.

### What’s in the demo

- **Two quests**
  - **Feature Showcase: The Ember Quest** – One quest that uses every node type and connection pattern.
  - **Follow-up: After the Wolves** – A short quest that checks a global event set in the first quest (cross-quest events).

- **Node types**
  - **START** – Title, location, NPC, description, several options (Accept / Details / Decline).
  - **DIALOGUE** – Speaker, text, Continue-style options.
  - **CHOICE** – Prompt and multiple options (e.g. Kill / Spare / Take ember).
  - **EVENT (Trigger)** – Fires `evt-wolf-alpha-killed` with a parameter.
  - **EVENT (Check)** – Branches on “Triggered” vs “Not triggered”.
  - **IF** – Condition string and True/False outputs.
  - **AND** – Multiple inputs (`inputCount: 3`), single output.
  - **OR** – Two inputs, single output.
  - **END** – Success (rewards, faction changes, triggered events), Failure, and Neutral outcomes.

- **Connections**
  - Option → node (e.g. Accept → first dialogue).
  - Event Trigger → next node (single output).
  - Event Check → two branches (sourceOutput `"true"` / `"false"`).
  - IF → True/False (sourceOutput `"true"` / `"false"`).
  - AND/OR → one output each; connections **to** AND use `targetHandle`: `"input-0"`, `"input-1"`, etc.

- **Global events**
  - **evt-wolf-alpha-killed** – Triggered in the first quest, checked in both.
  - **evt-ember-delivered** – Referenced in the first quest’s END node (`triggeredEvents`).

- **Other**
  - **Validation** – Run **Validate** to see how the tool reports issues (e.g. one AND input is left unconnected on purpose).
  - **Search** – Use **Search** (⌘F) to find text in nodes.
  - **Preview** – Use **Preview** to step through the first quest from START.
  - **Auto Layout** – Use **Auto Layout** to rearrange the first quest’s nodes.

This file is in the same format as “Save Project” and “Open Project” in the app.

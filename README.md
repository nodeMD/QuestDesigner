# Quest Designer

A visual node-based quest design tool for game developers. Create complex, branching quest narratives with an intuitive drag-and-drop interface inspired by Unreal Engine Blueprints.

[![CI](https://github.com/nodeMD/QuestDesigner/actions/workflows/ci.yml/badge.svg)](https://github.com/nodeMD/QuestDesigner/actions/workflows/ci.yml)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)](#installation)
[![License](https://img.shields.io/badge/License-Quest%20Designer%20License-green)](LICENSE.md)

## Features

### Node-Based Editor
- **Visual Quest Creation** - Design quests using a node-based canvas with drag-and-drop functionality
- **Multiple Node Types** - START, DIALOGUE, CHOICE, EVENT, IF/AND/OR conditions, and END nodes
- **Smart Connections** - Connect nodes by dragging from options to create branching narratives
- **Auto-Layout** - Automatically arrange nodes in a clean hierarchical layout

### Quest Management
- **Project Organization** - Manage multiple quests within a single project
- **Global Events** - Create events that can be shared across quests with customizable parameters
- **Validation System** - Detect issues like dead ends, unreachable nodes, and missing connections
- **Quest Preview** - Simulate and playtest your quests directly in the editor

### Import/Export
- **JSON Export** - Export individual quests or entire projects to JSON
- **JSON Import** - Import quests from JSON files
- **Auto-Save** - Optional auto-save feature (off by default)

### Developer Experience
- **Dark Theme** - Beautiful dark interface designed for extended use
- **Keyboard Shortcuts** - Comprehensive shortcuts for efficient workflow
- **Search** - Find nodes quickly by name, speaker, or content
- **Copy/Paste** - Duplicate nodes with Cmd/Ctrl+C and Cmd/Ctrl+V

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/nodeMD/QuestDesigner.git
cd QuestDesigner

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:mac      # Creates .dmg for macOS
npm run build:win      # Creates .exe installer for Windows
npm run build:linux    # Creates AppImage for Linux
```

> **Note:** You can only build for your current operating system by default. To build for other platforms:
> - **macOS** can build for macOS only
> - **Windows** can build for Windows only  
> - **Linux** can build for Linux and Windows
>
> For cross-platform builds, use CI/CD (like GitHub Actions) or tools like [electron-builder's remote build](https://www.electron.build/multi-platform-build).

Built packages are output to the `release/` directory.

### Running Tests

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:run

# Run unit tests with coverage report
npm run test:coverage

# Run E2E tests (requires built app)
npm run build:app && npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Check formatting with Prettier
npm run format:check

# Format code with Prettier
npm run format

# Type check with TypeScript
npm run typecheck
```

## Usage

### Creating a New Quest

1. Click **New Project** on the welcome screen
2. Enter a project name
3. Click **Add Quest** in the sidebar
4. Right-click on the canvas to add nodes
5. Connect nodes by dragging from output handles to input handles

### Node Types

| Node | Purpose |
|------|---------|
| **START** | Entry point of a quest with initial dialogue/description |
| **DIALOGUE** | NPC dialogue with optional player response options |
| **CHOICE** | Player decision point with multiple options |
| **EVENT** | Trigger or check global events across quests |
| **IF** | Conditional branching based on game state |
| **AND/OR** | Logic gates for combining conditions |
| **END** | Quest conclusion with outcome and rewards |

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Search | `Cmd/Ctrl + F` |
| Validate | `Cmd/Ctrl + T` |
| Export | `Cmd/Ctrl + E` |
| Copy | `Cmd/Ctrl + C` |
| Paste | `Cmd/Ctrl + V` |
| Delete | `Delete` / `Backspace` |
| Close Panel | `Escape` |

### Exporting Quests

1. Click **Export** in the toolbar
2. Choose **Export Current Quest** or **Export Entire Project**
3. Select a save location
4. The quest data is saved as formatted JSON

## Technology Stack

- **Electron** - Cross-platform desktop application
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **React Flow** - Node-based editor library
- **Zustand** - State management
- **Tailwind CSS** - Utility-first styling

## Project Structure

```
QuestDesigner/
├── electron/           # Electron main process
│   ├── main.ts        # Main process entry
│   └── preload.ts     # Preload scripts
├── src/
│   ├── components/    # React components
│   │   ├── layout/    # Layout components (Canvas, Sidebar, Toolbar)
│   │   ├── nodes/     # Node type components
│   │   ├── panels/    # Side panels (Edit, Validation, Search)
│   │   └── ui/        # UI components (Modals, Context Menu)
│   ├── hooks/         # Custom React hooks
│   ├── stores/        # Zustand state stores
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── styles/        # Global styles
├── CONTRIBUTING.md    # Contribution guidelines
└── LICENSE.md         # License information
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the Quest Designer License. See [LICENSE.md](LICENSE.md) for details.

## Acknowledgments

- Inspired by Unreal Engine Blueprints and Miro
- Built with [React Flow](https://reactflow.dev/)
- UI design inspired by modern dark-themed IDEs

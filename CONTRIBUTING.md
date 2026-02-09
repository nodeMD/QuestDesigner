# Contributing to Quest Designer

Thank you for your interest in contributing to Quest Designer! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Search the issue tracker to see if the bug has already been reported
2. **Create a new issue** - If not found, open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected behavior vs actual behavior
   - Screenshots if applicable
   - Your OS and app version

### Suggesting Features

1. **Check existing issues** - Your idea might already be proposed
2. **Open a feature request** - Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions you've considered
   - Any relevant mockups or examples

### Contributing Code

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/QuestDesigner.git
   cd QuestDesigner
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update types as needed

3. **Test your changes**
   - Manually test in the Electron app
   - Ensure no TypeScript errors (`npm run build`)
   - Check for linting issues

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

5. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a PR on GitHub.

#### Pull Request Guidelines

- **Keep PRs focused** - One feature or fix per PR
- **Write a clear description** - Explain what and why
- **Reference related issues** - Use "Fixes #123" or "Relates to #123"
- **Include screenshots** - For UI changes
- **Update documentation** - If needed

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Export types from `src/types/index.ts`

### React

- Use functional components with hooks
- Use `memo()` for performance-critical components
- Keep components focused and reusable
- Colocate related files (component, styles, tests)

### Styling

- Use Tailwind CSS for styling
- Follow the existing color scheme (defined in `tailwind.config.js`)
- Use semantic class names from `globals.css`

### File Organization

```
src/
├── components/
│   ├── layout/      # Main layout components
│   ├── nodes/       # Node type components
│   ├── panels/      # Side panels
│   └── ui/          # Reusable UI components
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── utils/           # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (`NodeEditPanel.tsx`)
- **Hooks**: camelCase with `use` prefix (`useKeyboardShortcuts.ts`)
- **Utils**: camelCase (`validation.ts`)
- **Types**: PascalCase (`QuestNode`, `Connection`)
- **Constants**: UPPER_SNAKE_CASE (`AUTO_SAVE_DELAY`)

## Project Architecture

### State Management

We use **Zustand** for state management with two main stores:

- `projectStore` - Project data, quests, nodes, connections
- `uiStore` - UI state (panels, modals, selection)

### Key Components

- `Canvas` - React Flow canvas for node editing
- `Sidebar` - Quest and event list
- `Toolbar` - Action buttons
- `NodeEditPanel` - Node property editor
- `SimulationPanel` - Quest preview/playtest

### Node System

Each node type has:
- A component in `src/components/nodes/`
- Type definition in `src/types/index.ts`
- Rendering in `NodeEditPanel.tsx`
- Export handling in `src/utils/export.ts`

## Questions?

If you have questions, feel free to:
- Open a discussion on GitHub
- Comment on related issues
- Reach out to maintainers

Thank you for contributing!

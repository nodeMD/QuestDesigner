import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.electronAPI for tests
Object.defineProperty(window, 'electronAPI', {
  value: {
    saveFile: vi.fn().mockResolvedValue({ success: true, filePath: '/test/path.json' }),
    loadFile: vi.fn().mockResolvedValue({ success: true, data: null }),
    loadFromPath: vi.fn().mockResolvedValue({ success: true, data: null }),
    exportFile: vi.fn().mockResolvedValue({ success: true }),
    showConfirmDialog: vi.fn().mockResolvedValue({ response: 0 }),
  },
  writable: true,
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

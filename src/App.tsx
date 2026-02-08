import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Canvas } from '@/components/layout/Canvas'
import { StatusBar } from '@/components/layout/StatusBar'
import { NodeEditPanel } from '@/components/panels/NodeEditPanel'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { DeleteModal } from '@/components/ui/DeleteModal'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'

import '@xyflow/react/dist/style.css'

function App() {
  const { project } = useProjectStore()
  const { contextMenu, closeContextMenu } = useUIStore()

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.isOpen) {
        closeContextMenu()
      }
    }
    
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [contextMenu.isOpen, closeContextMenu])

  // Show welcome screen if no project
  if (!project) {
    return <WelcomeScreen />
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-canvas-bg">
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Canvas area */}
          <div className="flex-1 relative">
            <Canvas />
          </div>
          
          {/* Edit panel (slide-in from right) */}
          <NodeEditPanel />
        </div>
        
        {/* Status bar */}
        <StatusBar />
        
        {/* Context menu */}
        <ContextMenu />
        
        {/* Delete confirmation modal */}
        <DeleteModal />
      </div>
    </ReactFlowProvider>
  )
}

export default App


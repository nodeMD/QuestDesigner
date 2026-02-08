import { useState, useRef, useCallback } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'
import { X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { openDeleteModal } = useUIStore()
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    openDeleteModal('connection', id)
  }

  // Use timeout-based hover to prevent flickering when moving between path and button
  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 100) // Small delay to allow mouse to move to button
  }, [])

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={24}
        stroke="transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Visible edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isHovered ? 3 : 2,
          transition: 'stroke-width 0.15s ease',
        }}
      />
      
      {/* Delete button - always rendered but visibility controlled */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: isHovered ? 'all' : 'none',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
          className="nodrag nopan"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center bg-validation-error text-white 
                       rounded-full shadow-lg hover:bg-red-600 hover:scale-110 transition-all"
            title="Remove connection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}


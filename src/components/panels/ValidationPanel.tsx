import { useEffect, useState } from 'react'
import { X, AlertTriangle, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/uiStore'
import { validateQuest } from '@/utils/validation'
import type { ValidationIssue } from '@/types'

export function ValidationPanel() {
  const { getCurrentQuest, selectNode } = useProjectStore()
  const { validationPanelOpen, setValidationPanelOpen, isValidating, setValidating, focusOnNode } = useUIStore()
  
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const currentQuest = getCurrentQuest()

  // Run validation when panel opens
  useEffect(() => {
    if (validationPanelOpen && currentQuest) {
      runValidation()
    }
  }, [validationPanelOpen, currentQuest?.id])

  const runValidation = () => {
    if (!currentQuest) return
    
    setValidating(true)
    setTimeout(() => {
      const result = validateQuest(currentQuest)
      setIssues(result)
      setValidating(false)
    }, 200)
  }

  const handleGoTo = (nodeId: string) => {
    selectNode(nodeId)
    focusOnNode(nodeId) // This will trigger canvas panning
  }

  const handleClear = () => {
    setIssues([])
  }

  if (!validationPanelOpen) return null

  const errors = issues.filter(i => i.severity === 'error')
  const warnings = issues.filter(i => i.severity === 'warning')
  const isValid = errors.length === 0 && warnings.length === 0

  return (
    <div className="absolute bottom-12 right-4 w-96 max-h-96 bg-panel-bg border border-panel-border rounded-lg shadow-panel z-40 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
        <div className="flex items-center gap-2">
          <FlaskConicalIcon className="w-5 h-5 text-accent-blue" />
          <h3 className="font-semibold text-text-primary">Validation Results</h3>
        </div>
        <button
          onClick={() => setValidationPanelOpen(false)}
          className="p-1 text-text-secondary hover:text-text-primary hover:bg-sidebar-hover rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 py-2 border-b border-panel-border flex items-center gap-4">
        {isValidating ? (
          <span className="text-sm text-text-secondary">Validating...</span>
        ) : isValid ? (
          <div className="flex items-center gap-2 text-node-start">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Quest is valid!</span>
          </div>
        ) : (
          <>
            {errors.length > 0 && (
              <div className="flex items-center gap-1.5 text-validation-error">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{errors.length} Error{errors.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {warnings.length > 0 && (
              <div className="flex items-center gap-1.5 text-validation-warning">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{warnings.length} Warning{warnings.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto">
        {!isValid && issues.length > 0 ? (
          <div className="divide-y divide-panel-border">
            {/* Errors first */}
            {errors.map(issue => (
              <IssueItem key={issue.id} issue={issue} onGoTo={handleGoTo} />
            ))}
            {/* Then warnings */}
            {warnings.map(issue => (
              <IssueItem key={issue.id} issue={issue} onGoTo={handleGoTo} />
            ))}
          </div>
        ) : !isValidating && isValid ? (
          <div className="px-4 py-8 text-center text-text-secondary">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-node-start opacity-50" />
            <p>All branches lead to proper endings.</p>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 px-4 py-2 border-t border-panel-border">
        <button
          onClick={handleClear}
          className="btn btn-ghost text-xs py-1"
        >
          Clear
        </button>
        <button
          onClick={runValidation}
          disabled={isValidating}
          className="btn btn-secondary text-xs py-1 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
          Re-test
        </button>
      </div>
    </div>
  )
}

function IssueItem({ 
  issue, 
  onGoTo 
}: { 
  issue: ValidationIssue
  onGoTo: (nodeId: string) => void 
}) {
  const isError = issue.severity === 'error'
  
  return (
    <div className="px-4 py-3 hover:bg-sidebar-hover/50">
      <div className="flex items-start gap-2">
        {isError ? (
          <AlertCircle className="w-4 h-4 text-validation-error mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-validation-warning mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${isError ? 'text-validation-error' : 'text-validation-warning'}`}>
              {issue.type.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">{issue.message}</p>
        </div>
        {issue.nodeId && (
          <button
            onClick={() => onGoTo(issue.nodeId!)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-accent-blue hover:bg-accent-blue/10 rounded"
          >
            <ExternalLink className="w-3 h-3" />
            Go to
          </button>
        )}
      </div>
    </div>
  )
}

function FlaskConicalIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  )
}


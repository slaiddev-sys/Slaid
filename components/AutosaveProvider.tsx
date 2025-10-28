/**
 * AutosaveProvider - Complete autosave integration for the presentation editor
 * 
 * This component integrates with the existing editor to provide:
 * - Automatic detection and saving of changes
 * - State restoration on page load
 * - Enhanced universal autosave with proper debouncing
 * - Visual feedback for save status
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import useAutosave, { extractPresentationState, type PresentationState } from './hooks/useAutosave';
import { setGlobalAutosaveContext, setupUniversalAutosave } from '../utils/universalAutosaveSimple';

interface AutosaveProviderProps {
  presentationId: number;
  workspace: string;
  messages: any[];
  activeSlide: number;
  presentationTitle?: string;
  onStateRestored?: (state: PresentationState) => void;
  setPresentationMessages?: (messages: any) => void;
  children: React.ReactNode;
}

interface AutosaveStatus {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  error: string | null;
  hasUnsavedChanges: boolean;
}

export function AutosaveProvider({
  presentationId,
  workspace,
  messages,
  activeSlide,
  presentationTitle,
  onStateRestored,
  setPresentationMessages,
  children
}: AutosaveProviderProps) {
  const [status, setStatus] = useState<AutosaveStatus>({
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    error: null,
    hasUnsavedChanges: false
  });

  const lastStateRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const pendingChangesRef = useRef(false);

  const {
    savePresentation,
    loadPresentation,
    isLoading,
    isSaving,
    lastSaved,
    error,
    clearError
  } = useAutosave({
    presentationId,
    workspace,
    debounceDelay: 2000,
    enabled: true
  });

  // Update status when autosave hook state changes
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      isSaving,
      isLoading,
      lastSaved,
      error
    }));
  }, [isSaving, isLoading, lastSaved, error]);

  // Extract and track current state
  const getCurrentState = useCallback((): PresentationState | null => {
    return extractPresentationState(
      presentationId,
      workspace,
      messages,
      activeSlide,
      presentationTitle
    );
  }, [presentationId, workspace, messages, activeSlide, presentationTitle]);

  // Debounced autosave function
  const triggerAutosave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      
      return (force = false) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const delay = force ? 0 : 2000;
        
        timeoutId = setTimeout(async () => {
          const currentState = getCurrentState();
          if (!currentState) {
            console.log('🔄 Autosave: No valid state to save');
            return;
          }

          const currentStateString = JSON.stringify(currentState);
          
          // Check if state has actually changed
          if (!force && currentStateString === lastStateRef.current) {
            console.log('🔄 Autosave: No changes detected, skipping save');
            return;
          }

          try {
            console.log('💾 Autosave: Saving changes...', {
              presentationId: currentState.id,
              slidesCount: currentState.slides.length,
              force
            });

            await savePresentation(currentState);
            lastStateRef.current = currentStateString;
            pendingChangesRef.current = false;
            
            setStatus(prev => ({
              ...prev,
              hasUnsavedChanges: false,
              error: null
            }));

          } catch (err) {
            console.error('❌ Autosave: Failed to save:', err);
            setStatus(prev => ({
              ...prev,
              error: err instanceof Error ? err.message : 'Save failed',
              hasUnsavedChanges: true
            }));
          }
        }, delay);
      };
    })(),
    [getCurrentState, savePresentation]
  );

  // Load saved state on mount or when presentation/workspace changes
  const loadSavedState = useCallback(async () => {
    if (!isInitialLoadRef.current) return;
    
    try {
      console.log('📥 Autosave: Loading saved state...', { presentationId, workspace });
      
      const savedState = await loadPresentation(presentationId, workspace);
      
      if (savedState && savedState.slides && savedState.slides.length > 0) {
        console.log('✅ Autosave: Restored saved state', {
          slidesCount: savedState.slides.length,
          messagesCount: savedState.messages?.length || 0,
          lastModified: savedState.lastModified
        });

        // Update the editor state with restored data
        if (onStateRestored) {
          onStateRestored(savedState);
        }

        // Restore messages if available and callback provided
        if (savedState.messages && setPresentationMessages) {
          setPresentationMessages((prev: any) => ({
            ...prev,
            [presentationId]: savedState.messages
          }));
        }

        lastStateRef.current = JSON.stringify(savedState);
      } else {
        console.log('📥 Autosave: No saved state found or empty state');
      }
    } catch (err) {
      console.error('❌ Autosave: Failed to load saved state:', err);
      setStatus(prev => ({
        ...prev,
        error: 'Failed to load saved state'
      }));
    } finally {
      isInitialLoadRef.current = false;
    }
  }, [presentationId, workspace, loadPresentation, onStateRestored, setPresentationMessages]);

  // Track changes in messages and trigger autosave
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const currentState = getCurrentState();
    if (!currentState) return;

    const currentStateString = JSON.stringify(currentState);
    
    if (currentStateString !== lastStateRef.current) {
      console.log('🔄 Autosave: State change detected, scheduling save...');
      pendingChangesRef.current = true;
      setStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
      triggerAutosave();
    }
  }, [messages, activeSlide, getCurrentState, triggerAutosave]);

  // Set up universal autosave integration
  useEffect(() => {
    const handleEdit = (patch: any) => {
      console.log('🎯 Autosave: Universal edit detected:', patch);
      pendingChangesRef.current = true;
      setStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
      triggerAutosave();
    };

    setGlobalAutosaveContext({
      trackEdit: handleEdit,
      slideId: `slide-${activeSlide + 1}`,
      presentationId
    });

    setupUniversalAutosave();
  }, [presentationId, activeSlide, triggerAutosave]);

  // Load saved state on mount
  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  // Force save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (pendingChangesRef.current) {
        event.preventDefault();
        triggerAutosave(true); // Force immediate save
        return event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    const handleUnload = () => {
      if (pendingChangesRef.current) {
        triggerAutosave(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [triggerAutosave]);

  // Manual save function for external use
  const manualSave = useCallback(() => {
    triggerAutosave(true);
  }, [triggerAutosave]);

  // Clear error function
  const handleClearError = useCallback(() => {
    clearError();
    setStatus(prev => ({ ...prev, error: null }));
  }, [clearError]);

  return (
    <AutosaveContext.Provider value={{
      status,
      manualSave,
      clearError: handleClearError,
      isEnabled: true
    }}>
      {children}
      <AutosaveStatusIndicator status={status} onClearError={handleClearError} />
    </AutosaveContext.Provider>
  );
}

// Context for accessing autosave functionality
interface AutosaveContextType {
  status: AutosaveStatus;
  manualSave: () => void;
  clearError: () => void;
  isEnabled: boolean;
}

const AutosaveContext = React.createContext<AutosaveContextType | null>(null);

export function useAutosaveContext(): AutosaveContextType {
  const context = React.useContext(AutosaveContext);
  if (!context) {
    throw new Error('useAutosaveContext must be used within AutosaveProvider');
  }
  return context;
}

// Visual status indicator component
interface AutosaveStatusIndicatorProps {
  status: AutosaveStatus;
  onClearError: () => void;
}

function AutosaveStatusIndicator({ status, onClearError }: AutosaveStatusIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (status.isSaving || status.error || status.hasUnsavedChanges) {
      setShowIndicator(true);
    } else if (status.lastSaved) {
      // Show "saved" indicator briefly
      setShowIndicator(true);
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-4 py-2 rounded-lg shadow-lg border transition-all duration-300 flex items-center gap-2
        ${status.error 
          ? 'bg-red-50 border-red-200 text-red-700' 
          : status.isSaving 
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : status.hasUnsavedChanges
              ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
              : 'bg-green-50 border-green-200 text-green-700'
        }
      `}>
        {status.error ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Save failed</span>
            <button 
              onClick={onClearError}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </>
        ) : status.isSaving ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Saving...</span>
          </>
        ) : status.hasUnsavedChanges ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Unsaved changes</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">
              Saved {status.lastSaved ? new Date(status.lastSaved).toLocaleTimeString() : ''}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default AutosaveProvider;

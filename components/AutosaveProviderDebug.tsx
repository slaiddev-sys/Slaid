/**
 * DEBUG AutosaveProvider - Enhanced with extensive logging
 * 
 * This debug version will help us see exactly where the autosave is failing
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
  console.log('🚨 DEBUG AutosaveProvider: Component mounted/updated', {
    presentationId,
    workspace,
    messagesCount: messages.length,
    activeSlide,
    presentationTitle
  });

  const [status, setStatus] = useState<AutosaveStatus>({
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    error: null,
    hasUnsavedChanges: false
  });

  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const lastStateRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const pendingChangesRef = useRef(false);
  const changeCountRef = useRef(0);

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🐛 AUTOSAVE DEBUG:', logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  }, []);

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
    const newStatus = {
      isSaving,
      isLoading,
      lastSaved,
      error,
      hasUnsavedChanges: pendingChangesRef.current
    };
    
    addDebugLog(`Status updated: ${JSON.stringify(newStatus)}`);
    setStatus(newStatus);
  }, [isSaving, isLoading, lastSaved, error, addDebugLog]);

  // Extract and track current state
  const getCurrentState = useCallback((): PresentationState | null => {
    addDebugLog(`Getting current state for presentation ${presentationId}`);
    
    const state = extractPresentationState(
      presentationId,
      workspace,
      messages,
      activeSlide,
      presentationTitle
    );
    
    if (state) {
      addDebugLog(`✅ State extracted: ${state.slides.length} slides, ${state.messages?.length || 0} messages`);
    } else {
      addDebugLog(`❌ No state extracted - messages: ${messages.length}, activeSlide: ${activeSlide}`);
    }
    
    return state;
  }, [presentationId, workspace, messages, activeSlide, presentationTitle, addDebugLog]);

  // Debounced autosave function
  const triggerAutosave = useCallback((state: PresentationState) => {
    if (!getCurrentState()) {
      addDebugLog('❌ No valid state to save');
      return;
    }

    changeCountRef.current++;
    addDebugLog(`🔄 Triggering autosave (change #${changeCountRef.current})`);
    
    // Use the hook's built-in debounced save
    const { savePresentation } = useAutosave({
      presentationId,
      workspace,
      debounceDelay: 2000,
      enabled: true
    });
    
    // Create a simple timeout for debouncing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      addDebugLog(`⏰ Cleared previous timeout`);
    }

    timeoutRef.current = setTimeout(async () => {
      const currentState = getCurrentState();
      if (!currentState) {
        addDebugLog('❌ No state available for save');
        return;
      }

      try {
        addDebugLog(`💾 Executing save after delay`);
        await savePresentation(currentState);
        addDebugLog('✅ Save completed successfully');
        
        lastStateRef.current = JSON.stringify(currentState);
        pendingChangesRef.current = false;
        setStatus(prev => ({ ...prev, hasUnsavedChanges: false, error: null }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Save failed';
        addDebugLog(`❌ Save failed: ${errorMsg}`);
        setStatus(prev => ({ ...prev, error: errorMsg, hasUnsavedChanges: true }));
      }
    }, 2000);
    
    addDebugLog(`⏳ Set 2000ms delay for save`);
  }, [getCurrentState, presentationId, workspace, addDebugLog]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state on mount
  const loadSavedState = useCallback(async () => {
    if (!isInitialLoadRef.current) return;
    
    addDebugLog(`📥 Loading saved state for presentation ${presentationId} in workspace "${workspace}"`);
    
    try {
      const savedState = await loadPresentation(presentationId, workspace);
      
      if (savedState && savedState.slides && savedState.slides.length > 0) {
        addDebugLog(`✅ Restored state: ${savedState.slides.length} slides, ${savedState.messages?.length || 0} messages`);

        if (onStateRestored) {
          onStateRestored(savedState);
        }

        if (savedState.messages && setPresentationMessages) {
          setPresentationMessages((prev: any) => ({
            ...prev,
            [presentationId]: savedState.messages
          }));
        }

        lastStateRef.current = JSON.stringify(savedState);
      } else {
        addDebugLog('📥 No saved state found or empty state');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Load failed';
      addDebugLog(`❌ Load failed: ${errorMsg}`);
    } finally {
      isInitialLoadRef.current = false;
      addDebugLog('🏁 Initial load completed');
    }
  }, [presentationId, workspace, loadPresentation, onStateRestored, setPresentationMessages, addDebugLog]);

  // Track changes in messages and trigger autosave
  useEffect(() => {
    if (isInitialLoadRef.current) {
      addDebugLog('⏭️ Skipping change detection during initial load');
      return;
    }

    addDebugLog(`🔍 Checking for changes: ${messages.length} messages, slide ${activeSlide}`);

    const currentState = getCurrentState();
    if (!currentState) {
      addDebugLog('❌ No current state for change detection');
      return;
    }

    const currentStateString = JSON.stringify(currentState);
    
    if (currentStateString !== lastStateRef.current) {
      addDebugLog('🔄 STATE CHANGE DETECTED! Scheduling save...');
      pendingChangesRef.current = true;
      setStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
      triggerAutosave();
    } else {
      addDebugLog('✅ No state changes detected');
    }
  }, [messages, activeSlide, getCurrentState, triggerAutosave, addDebugLog]);

  // Set up universal autosave integration
  useEffect(() => {
    addDebugLog('🔧 Setting up universal autosave integration');
    
    const handleEdit = (patch: any) => {
      addDebugLog(`🎯 Universal edit detected: ${JSON.stringify(patch)}`);
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
    addDebugLog('✅ Universal autosave setup completed');
  }, [presentationId, activeSlide, triggerAutosave, addDebugLog]);

  // Load saved state on mount
  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  // Force save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (pendingChangesRef.current) {
        addDebugLog('⚠️ Page unload with unsaved changes - forcing save');
        event.preventDefault();
        triggerAutosave(true);
        return event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [triggerAutosave, addDebugLog]);

  // Manual save function
  const manualSave = useCallback(() => {
    addDebugLog('🔧 Manual save triggered');
    triggerAutosave(true);
  }, [triggerAutosave, addDebugLog]);

  // Clear error function
  const handleClearError = useCallback(() => {
    addDebugLog('🧹 Clearing error');
    clearError();
    setStatus(prev => ({ ...prev, error: null }));
  }, [clearError, addDebugLog]);

  return (
    <AutosaveContext.Provider value={{
      status,
      manualSave,
      clearError: handleClearError,
      isEnabled: true
    }}>
      {children}
      <DebugAutosaveIndicator 
        status={status} 
        debugInfo={debugInfo}
        onClearError={handleClearError}
        onManualSave={manualSave}
      />
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

// Enhanced debug status indicator
interface DebugAutosaveIndicatorProps {
  status: AutosaveStatus;
  debugInfo: string[];
  onClearError: () => void;
  onManualSave: () => void;
}

function DebugAutosaveIndicator({ status, debugInfo, onClearError, onManualSave }: DebugAutosaveIndicatorProps) {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <>
      {/* Main status indicator */}
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
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Saving...</span>
            </>
          ) : status.hasUnsavedChanges ? (
            <>
              <span className="text-sm font-medium">Unsaved changes</span>
              <button 
                onClick={onManualSave}
                className="text-xs underline hover:no-underline"
              >
                Save now
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-medium">
                Saved {status.lastSaved ? new Date(status.lastSaved).toLocaleTimeString() : ''}
              </span>
            </>
          )}
          
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Debug
          </button>
        </div>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-80 bg-black text-green-400 p-4 rounded-lg shadow-xl border border-gray-600 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Autosave Debug Log</h3>
            <button 
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs font-mono">
            {debugInfo.length === 0 ? (
              <div className="text-gray-500">No debug info yet...</div>
            ) : (
              debugInfo.map((log, index) => (
                <div key={index} className="break-words">
                  {log}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-600">
            <button 
              onClick={onManualSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
            >
              Force Save Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AutosaveProvider;

/**
 * Simple, Direct Autosave System
 * 
 * This version directly calls the API without complex hook dependencies
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { extractPresentationState, type PresentationState } from './hooks/useAutosave';
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
  console.log('🔄 AUTOSAVE: AutosaveProvider mounted with props:', {
    presentationId,
    workspace,
    messagesCount: messages.length,
    activeSlide,
    presentationTitle,
    hasOnStateRestored: !!onStateRestored,
    hasSetPresentationMessages: !!setPresentationMessages
  });

  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const lastStateRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const changeCountRef = useRef(0);

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log('🐛 AUTOSAVE DEBUG:', logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]);
  }, []);

  // Direct save function
  const directSave = useCallback(async (state: PresentationState) => {
    try {
      setIsSaving(true);
      setError(null);
      
      addDebugLog(`💾 Starting direct save: ${state.slides.length} slides`);

      const saveData = {
        presentationId: state.id,
        workspace,
        state: {
          ...state,
          lastModified: new Date().toISOString()
        }
      };

      addDebugLog(`🌐 Making fetch request to /api/presentations/save`);

      const response = await fetch('/api/presentations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
      });

      addDebugLog(`📡 Fetch response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save: ${response.status}`);
      }

      const result = await response.json();
      setLastSaved(new Date());
      lastStateRef.current = JSON.stringify(state);
      
      addDebugLog('✅ Save completed successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      addDebugLog(`❌ Save failed: ${errorMessage}`);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [workspace, addDebugLog]);

  // Get current state
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
      addDebugLog(`❌ No state extracted`);
    }
    
    return state;
  }, [presentationId, workspace, messages, activeSlide, presentationTitle, addDebugLog]);

  // Trigger autosave with debounce
  const triggerAutosave = useCallback(() => {
    changeCountRef.current++;
    addDebugLog(`🔄 Autosave triggered (change #${changeCountRef.current})`);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      addDebugLog(`⏰ Cleared previous timeout`);
    }

    addDebugLog(`⏳ Setting 2000ms delay for save`);
    
    saveTimeoutRef.current = setTimeout(async () => {
      addDebugLog(`🚀 Executing autosave after delay`);
      
      const currentState = getCurrentState();
      if (!currentState) {
        addDebugLog('❌ No valid state to save');
        return;
      }

      const currentStateString = JSON.stringify(currentState);
      
      // Check if state has actually changed
      if (currentStateString === lastStateRef.current) {
        addDebugLog('🔄 No changes detected, skipping save');
        return;
      }

      try {
        await directSave(currentState);
      } catch (err) {
        // Error already logged in directSave
      }
    }, 2000);
  }, [getCurrentState, directSave, addDebugLog]);

  // Track changes in messages and trigger autosave
  useEffect(() => {
    if (isInitialLoadRef.current) {
      addDebugLog('⏭️ Skipping change detection during initial load');
      return;
    }

    addDebugLog(`🔍 Checking for changes: ${messages.length} messages`);

    const currentState = getCurrentState();
    if (!currentState) {
      addDebugLog('❌ No current state for change detection');
      return;
    }

    const currentStateString = JSON.stringify(currentState);
    
    if (currentStateString !== lastStateRef.current) {
      addDebugLog('🔄 STATE CHANGE DETECTED! Scheduling save...');
      triggerAutosave();
    } else {
      addDebugLog('✅ No state changes detected');
    }
  }, [messages, activeSlide, getCurrentState, triggerAutosave, addDebugLog]);

  // Set up universal autosave integration
  useEffect(() => {
    addDebugLog('🔧 Setting up universal autosave integration');
    
    const handleEdit = (patch: any) => {
      console.log('🚨 HANDLEEDIT CALLED - START');
      console.log('🚨 HANDLEEDIT - patch received:', patch);
      
      addDebugLog(`🎯 Universal edit detected: ${JSON.stringify(patch)}`);
      
      console.log('🚨 HANDLEEDIT - about to call getCurrentState');
      const currentState = getCurrentState();
      console.log('🚨 HANDLEEDIT - getCurrentState result:', currentState ? 'VALID' : 'NULL');
      
      if (!currentState) {
        console.log('🚨 HANDLEEDIT - NO STATE, ABORTING');
        addDebugLog('❌ No current state available for edit patch');
        return;
      }
      
      console.log('🚨 HANDLEEDIT - STATE OK, PROCEEDING');
      
      // Apply the patch to the current state
      console.log('🚨 APPLYING PATCH TO STATE');
      const updatedState = applyPatchToState(currentState, patch);
      console.log('🚨 PATCH APPLIED SUCCESSFULLY');
      
      addDebugLog('🚀 About to save with patched state');
      
      // Save the updated state with the patch applied
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        console.log('🚨 SAVE TIMEOUT TRIGGERED');
        addDebugLog('🚀 Saving state after edit');
        
        try {
          setIsSaving(true);
          
          const response = await fetch('/api/presentations/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              presentationId,
              workspace,
              state: { ...updatedState, lastModified: new Date().toISOString() }
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
          }
          
          setLastSaved(new Date());
          addDebugLog('✅ Save completed successfully');
        } catch (error) {
          console.error('❌ Save failed:', error);
          setError(error instanceof Error ? error.message : 'Save failed');
          addDebugLog(`❌ Save failed: ${error}`);
        } finally {
          setIsSaving(false);
        }
      }, 2000);
    };
    
    // Helper function to apply patch to presentation state
    const applyPatchToState = (state: PresentationState, patch: any): PresentationState => {
      console.log('🔧 AUTOSAVE: applyPatchToState called with:', {
        stateSlides: state.slides?.length,
        activeSlide,
        patchBlocks: patch.blocks ? Object.keys(patch.blocks) : 'none'
      });
      
      try {
        const updatedState = { ...state };
        
        console.log('🔧 AUTOSAVE: Checking patch conditions:', {
          hasPatchBlocks: !!patch.blocks,
          hasSlides: !!updatedState.slides,
          activeSlideIndex: activeSlide,
          slideExists: updatedState.slides && updatedState.slides[activeSlide],
          totalSlides: updatedState.slides?.length
        });
        
        // Apply block patches
        console.log('🔧 AUTOSAVE: About to check if condition - patch.blocks:', !!patch.blocks, 'updatedState.slides:', !!updatedState.slides, 'activeSlide exists:', !!(updatedState.slides && updatedState.slides[activeSlide]));
        
        console.log('🔧 AUTOSAVE: Raw condition check:', {
          patchBlocks: patch.blocks,
          updatedStateSlides: updatedState.slides,
          activeSlideValue: activeSlide,
          slideAtIndex: updatedState.slides?.[activeSlide]
        });
        
        if (patch.blocks && updatedState.slides && updatedState.slides[activeSlide]) {
          console.log('🔧 AUTOSAVE: ✅ INSIDE IF BLOCK - Applying patch to slide', activeSlide);
          console.log('🔧 AUTOSAVE: Current slide has', updatedState.slides[activeSlide].blocks?.length, 'blocks');
          const currentSlide = { ...updatedState.slides[activeSlide] };
          
          Object.entries(patch.blocks).forEach(([blockIndexStr, blockPatch]: [string, any]) => {
            const blockIndex = parseInt(blockIndexStr);
            console.log('🔧 AUTOSAVE: Processing block', blockIndex, 'with patch:', blockPatch);
            
            if (currentSlide.blocks && currentSlide.blocks[blockIndex]) {
              console.log('🔧 AUTOSAVE: Block exists, current props:', currentSlide.blocks[blockIndex].props);
              console.log('🔧 AUTOSAVE: Applying patch props:', blockPatch.props);
              
              currentSlide.blocks[blockIndex] = {
                ...currentSlide.blocks[blockIndex],
                props: {
                  ...currentSlide.blocks[blockIndex].props,
                  ...blockPatch.props
                }
              };
              console.log('🔧 AUTOSAVE: Block patched, new props:', currentSlide.blocks[blockIndex].props);
            } else {
              console.log('❌ AUTOSAVE: Block', blockIndex, 'not found in slide. Available blocks:', currentSlide.blocks?.length);
              console.log('❌ AUTOSAVE: Slide blocks structure:', currentSlide.blocks);
            }
          });
          
          updatedState.slides[activeSlide] = currentSlide;
          console.log('✅ AUTOSAVE: Patch applied successfully to slide', activeSlide);
        } else {
          console.log('❌ AUTOSAVE: Cannot apply patch - missing data:', {
            hasPatchBlocks: !!patch.blocks,
            hasSlides: !!updatedState.slides,
            hasActiveSlide: updatedState.slides && updatedState.slides[activeSlide],
            activeSlideIndex: activeSlide,
            totalSlides: updatedState.slides?.length
          });
        }
        
        console.log('🔧 AUTOSAVE: Returning updated state');
        return updatedState;
      } catch (error) {
        console.error('🚨 AUTOSAVE: Error in applyPatchToState:', error);
        return state; // Return original state on error
      }
    };

    setGlobalAutosaveContext({
      trackEdit: handleEdit,
      slideId: `slide-${activeSlide + 1}`,
      presentationId
    });

    setupUniversalAutosave();
    addDebugLog('✅ Universal autosave setup completed');
  }, [presentationId, activeSlide, getCurrentState, addDebugLog]);

  // Load saved state on mount
  useEffect(() => {
    console.log('🔄 AUTOSAVE: useEffect for loadSavedState triggered', {
      presentationId,
      workspace
    });
    
    // Always try to load on mount - remove the isInitialLoad check
    const doLoad = async () => {
      console.log('🔄 AUTOSAVE: Starting load for presentation', presentationId, 'workspace', workspace);
      
      try {
        addDebugLog(`📥 Loading saved state for presentation ${presentationId}`);
        
        const response = await fetch(
          `/api/presentations/load?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}`
        );

        console.log('🔄 AUTOSAVE: Load response received', {
          status: response.status,
          ok: response.ok
        });

        if (!response.ok) {
          if (response.status === 404) {
            addDebugLog('📥 No saved state found');
            console.log('🔄 AUTOSAVE: No saved state found (404)');
            return;
          }
          throw new Error(`Load failed: ${response.status}`);
        }

        const result = await response.json();
        const savedState = result.state as PresentationState;
        
        console.log('🔄 AUTOSAVE: Parsed saved state:', {
          slidesCount: savedState?.slides?.length,
          messagesCount: savedState?.messages?.length,
          hasOnStateRestored: !!onStateRestored
        });
        
        if (savedState && savedState.slides && savedState.slides.length > 0) {
          addDebugLog(`✅ Restored state: ${savedState.slides.length} slides`);

          if (onStateRestored) {
            addDebugLog(`🔄 CALLING onStateRestored with ${savedState.slides.length} slides`);
            console.log('🔄 AUTOSAVE: Calling onStateRestored callback with state:', savedState);
            onStateRestored(savedState);
            addDebugLog(`✅ onStateRestored callback completed`);
            console.log('🔄 AUTOSAVE: onStateRestored callback completed');
          } else {
            addDebugLog(`❌ No onStateRestored callback provided`);
            console.log('🔄 AUTOSAVE: ERROR - No onStateRestored callback provided!');
          }

          if (savedState.messages && setPresentationMessages) {
            setPresentationMessages((prev: any) => ({
              ...prev,
              [presentationId]: savedState.messages
            }));
          }

          lastStateRef.current = JSON.stringify(savedState);
          setLastSaved(new Date(savedState.lastModified || Date.now()));
        } else {
          console.log('🔄 AUTOSAVE: No valid slides data in saved state');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Load failed';
        addDebugLog(`❌ Load failed: ${errorMsg}`);
        console.error('🔄 AUTOSAVE: Load failed:', err);
        setError(errorMsg);
      }
    };
    
    doLoad();
  }, [presentationId, workspace]); // Only depend on presentationId and workspace

  // Manual save function
  const manualSave = useCallback(async () => {
    addDebugLog('🔧 Manual save triggered');
    
    const currentState = getCurrentState();
    if (!currentState) {
      addDebugLog('❌ No state for manual save');
      return;
    }

    try {
      await directSave(currentState);
    } catch (err) {
      // Error already logged
    }
  }, [getCurrentState, directSave, addDebugLog]);

  // Clear error
  const clearError = useCallback(() => {
    addDebugLog('🧹 Clearing error');
    setError(null);
  }, [addDebugLog]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const status = {
    isSaving,
    isLoading: false,
    lastSaved,
    error,
    hasUnsavedChanges: false
  };

  return (
    <>
      {children}
      <DebugAutosaveIndicator 
        status={status} 
        debugInfo={debugInfo}
        onClearError={clearError}
        onManualSave={manualSave}
      />
    </>
  );
}

// Debug indicator component (same as before)
interface DebugAutosaveIndicatorProps {
  status: any;
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
          ) : (
            <>
              <span className="text-sm font-medium">
                {status.lastSaved ? `Saved ${status.lastSaved.toLocaleTimeString()}` : 'Ready'}
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

/**
 * useAutosave Hook - Complete autosave system for presentation editor
 * 
 * Features:
 * - Automatic detection of meaningful changes
 * - Debounced saving (2 second delay after last change)
 * - Prevents saving unchanged data
 * - Async persistence to backend
 * - State restoration on load
 */

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { supabase } from '../../lib/supabase';

export interface PresentationState {
  id: number;
  title: string;
  slides: Array<{
    id: string;
    blocks: Array<{
      type: string;
      props: any;
    }>;
  }>;
  messages?: Array<{
    role: string;
    text: string;
    version?: number;
    userMessage?: string;
    image?: string;
    file?: { url: string; name: string; type: string };
    attachments?: Array<{ url: string; type: string; name: string }>;
    isLoading?: boolean;
    presentationData?: any;
  }>;
  activeSlide?: number;
  lastModified?: string;
  workspace?: string;
}

export interface AutosaveOptions {
  presentationId: number;
  workspace: string;
  debounceDelay?: number;
  enabled?: boolean;
}

export interface AutosaveHookReturn {
  savePresentation: (state: PresentationState) => Promise<void>;
  loadPresentation: (presentationId: number, workspace: string) => Promise<PresentationState | null>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  clearError: () => void;
}

export function useAutosave(options: AutosaveOptions): AutosaveHookReturn {
  const {
    presentationId,
    workspace,
    debounceDelay = 2000,
    enabled = true
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSavedState = useRef<string | null>(null);

  // Simple save function without debounce complications
  const actualSaveFunction = useCallback(async (state: PresentationState) => {
    if (!enabled) return;

    try {
      setIsSaving(true);
      setError(null);

      // Check if state has actually changed
      const currentStateString = JSON.stringify(state);
      if (currentStateString === lastSavedState.current) {
        console.log('🔄 Autosave: No changes detected, skipping save');
        return;
      }

      console.log('💾 Autosave: Saving presentation...', {
        presentationId: state.id,
        workspace,
        slidesCount: state.slides.length,
        messagesCount: state.messages?.length || 0,
        title: state.title,
        enabled
      });

      const saveData = {
        presentationId: state.id,
        workspace,
        state: {
          ...state,
          lastModified: new Date().toISOString()
        }
      };

      console.log('🌐 Autosave: Making fetch request to /api/presentations/save', saveData);

      // Get authentication headers if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          console.log('🔐 Autosave: Adding auth header for user');
        }
      } catch (authError) {
        console.warn('⚠️ Autosave: Could not get auth session, saving without auth:', authError);
      }

      const response = await fetch('/api/presentations/save', {
        method: 'POST',
        headers,
        body: JSON.stringify(saveData),
      });

      console.log('📡 Autosave: Fetch response received', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save: ${response.status}`);
      }

      const result = await response.json();
      setLastSaved(new Date());
      lastSavedState.current = currentStateString;

      console.log('✅ Autosave: Successfully saved presentation', {
        presentationId: state.id,
        savedAt: new Date().toISOString()
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Autosave: Failed to save presentation:', errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [enabled, presentationId, workspace]);

  // Debounced save using lodash debounce
  const debouncedSave = useMemo(
    () => debounce(actualSaveFunction, debounceDelay),
    [actualSaveFunction, debounceDelay]
  );

  // Manual save function (immediate)
  const savePresentation = useCallback(async (state: PresentationState): Promise<void> => {
    // Cancel any pending debounced save
    debouncedSave.cancel();
    
    // Execute save immediately
    return actualSaveFunction(state);
  }, [actualSaveFunction, debouncedSave]);

  // Trigger autosave function
  const triggerAutosave = useCallback((state: PresentationState) => {
    if (!enabled) return;
    
    console.log('🔄 Autosave: Change detected, scheduling save...', {
      presentationId: state.id,
      debounceDelay
    });
    
    debouncedSave(state);
  }, [enabled, debounceDelay, debouncedSave]);

  // Load presentation function
  const loadPresentation = useCallback(async (
    loadPresentationId: number, 
    loadWorkspace: string
  ): Promise<PresentationState | null> => {
    if (!enabled) return null;

    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Autosave: Loading presentation...', {
        presentationId: loadPresentationId,
        workspace: loadWorkspace
      });

      // Get authentication headers if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          console.log('🔐 Autosave: Adding auth header for load');
        }
      } catch (authError) {
        console.warn('⚠️ Autosave: Could not get auth session for load, loading without auth:', authError);
      }

      const response = await fetch(
        `/api/presentations/load?presentationId=${loadPresentationId}&workspace=${encodeURIComponent(loadWorkspace)}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📥 Autosave: No saved state found, returning null');
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to load: ${response.status}`);
      }

      const result = await response.json();
      const loadedState = result.state as PresentationState;

      // Update our tracking
      lastSavedState.current = JSON.stringify(loadedState);
      setLastSaved(loadedState.lastModified ? new Date(loadedState.lastModified) : new Date());

      console.log('✅ Autosave: Successfully loaded presentation', {
        presentationId: loadedState.id,
        slidesCount: loadedState.slides.length,
        messagesCount: loadedState.messages?.length || 0,
        lastModified: loadedState.lastModified
      });

      return loadedState;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Autosave: Failed to load presentation:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    savePresentation,
    loadPresentation,
    isLoading,
    isSaving,
    lastSaved,
    error,
    clearError
  };
}

// Helper function to extract presentation state from editor state
export function extractPresentationState(
  presentationId: number,
  workspace: string,
  messages: any[],
  activeSlide: number,
  presentationTitle?: string
): PresentationState | null {
  // Find the latest presentation data from messages
  const presentationData = [...messages].reverse().find(
    msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
  )?.presentationData;

  if (!presentationData || !presentationData.slides) {
    console.log('🔍 No presentation data found in messages');
    return null;
  }

  // CRITICAL FIX: Capture live DOM content and merge it into the presentation slides
  const slidesWithLiveContent = presentationData.slides.map((slide: any, slideIndex: number) => {
    console.log(`🔍 AUTOSAVE: Extracting live content from slide ${slideIndex}`);
    
    const updatedSlide = { ...slide };
    if (slide.blocks) {
      updatedSlide.blocks = slide.blocks.map((block: any, blockIndex: number) => {
        // Skip background blocks
        if (block.type === 'BackgroundBlock') {
          return block;
        }
        
        console.log(`🔍 AUTOSAVE: Checking block ${blockIndex} of type ${block.type} for live content`);
        
        // Only capture content for the currently active slide to avoid conflicts
        if (slideIndex !== activeSlide) {
          return block;
        }
        
        // Try to find contentEditable elements and capture their current text
        const contentElements = document.querySelectorAll(`[data-block-index="${blockIndex}"] [contenteditable="true"]`);
        
        if (contentElements.length > 0) {
          const updatedProps = { ...block.props };
          
          contentElements.forEach((element: any) => {
            const currentText = element.textContent || element.innerText || '';
            
            // Determine which prop this element represents
            let propName = 'text';
            if (element.hasAttribute('data-prop')) {
              propName = element.getAttribute('data-prop') || 'text';
            } else if (element.hasAttribute('data-field')) {
              propName = element.getAttribute('data-field') || 'text';
            } else {
              // Guess based on content and classes
              const classes = element.className.toLowerCase();
              if (classes.includes('title') || element.tagName === 'H1' || element.tagName === 'H2') {
                propName = 'title';
              } else if (classes.includes('paragraph') || classes.includes('description')) {
                propName = 'paragraph';
              } else if (classes.includes('quote')) {
                propName = 'quote';
              } else if (classes.includes('author')) {
                propName = 'author';
              }
            }
            
            if (currentText && currentText.trim() !== '') {
              console.log(`🔍 AUTOSAVE: Captured live text for ${propName}:`, currentText.substring(0, 50) + '...');
              updatedProps[propName] = currentText;
            }
          });
          
          return { ...block, props: updatedProps };
        }
        
        return block;
      });
    }
    
    return updatedSlide;
  });

  return {
    id: presentationId,
    title: presentationData.title || presentationTitle || `Presentation ${presentationId}`,
    slides: slidesWithLiveContent,
    messages: messages,
    activeSlide,
    workspace,
    lastModified: new Date().toISOString()
  };
}

export default useAutosave;

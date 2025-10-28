import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

// Debug log to confirm this file loads
console.log('🔥 SupabaseAutosaveProvider.tsx file loaded successfully')

interface SupabaseAutosaveContextType {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  saveNow: () => Promise<void>
}

const SupabaseAutosaveContext = createContext<SupabaseAutosaveContextType>({
  isSaving: false,
  lastSaved: null,
  error: null,
  saveNow: async () => {}
})

export const useSupabaseAutosave = () => useContext(SupabaseAutosaveContext)

interface SupabaseAutosaveProviderProps {
  presentationId: number
  workspace: string
  messages: any[]
  activeSlide: number
  presentationTitle?: string
  workspaceTitle?: string  // The title from the sidebar (workspacePresentations)
  onStateRestored?: (state: any) => void
  children: React.ReactNode
}

export function SupabaseAutosaveProvider({
  presentationId,
  workspace,
  messages,
  activeSlide,
  presentationTitle,
  workspaceTitle,
  onStateRestored,
  children
}: SupabaseAutosaveProviderProps) {
  
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedTitle, setLoadedTitle] = useState<string | null>(null)  // Track the title loaded from DB
  const [isLoading, setIsLoading] = useState(true)  // Prevent autosave during initial load
  const [loadStartTime, setLoadStartTime] = useState<number>(Date.now())  // Track when loading started
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastStateRef = useRef<string | null>(null)

  // Update loaded title when workspace title changes (user edits title)
  useEffect(() => {
    if (workspaceTitle && workspaceTitle !== loadedTitle) {
      console.log('🏷️ User changed title, updating loaded title:', workspaceTitle)
      setLoadedTitle(workspaceTitle)
    }
  }, [workspaceTitle, loadedTitle])

  // Get current state and capture live DOM content
  const getCurrentStateWithPatches = useCallback(() => {
    const presentationData = [...messages].reverse().find(
      msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
    )?.presentationData

    if (!presentationData?.slides) {
      return null
    }

    console.log('📝 Capturing current DOM state for saving...')
    
    // Get ALL contentEditable elements and their current text (for active editing)
    const contentEditableElements = document.querySelectorAll('[contenteditable="true"]')
    console.log(`🔍 Found ${contentEditableElements.length} contentEditable elements (actively being edited):`)
    
    contentEditableElements.forEach((element, index) => {
      const currentText = element.textContent || element.innerText || ''
      console.log(`  Element ${index}: "${currentText.substring(0, 50)}${currentText.length > 50 ? '...' : ''}"`)
    })

    // BETTER APPROACH: Look for all text elements that could be editable
    // FigmaText renders as divs with specific structure - let's find them by looking for text content
    const allTextElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div')
    console.log(`🎯 Found ${allTextElements.length} potential text elements (h1, h2, p, div):`)
    
    // Filter to only elements that have meaningful text content
    const meaningfulTextElements = Array.from(allTextElements).filter(element => {
      const text = element.textContent || ''
      return text.trim().length > 0 && text.trim().length < 500 // Reasonable text length
    })
    
    console.log(`📝 Filtered to ${meaningfulTextElements.length} meaningful text elements:`)
    meaningfulTextElements.slice(0, 10).forEach((element, index) => {
      const currentText = element.textContent || element.innerText || ''
      console.log(`  Text ${index}: "${currentText.substring(0, 50)}${currentText.length > 50 ? '...' : ''}"`)
    })

    // Create a copy of slides and update with live DOM content
    const updatedSlides = presentationData.slides.map((slide: any, slideIndex: number) => {
      console.log(`🔍 Processing slide ${slideIndex} with ${slide.blocks.length} blocks`)
      
      const updatedBlocks = slide.blocks.map((block: any, blockIndex: number) => {
        if (block.type === 'TextBlock') {
          const originalText = block.props.text || ''
          console.log(`  📝 TextBlock found - Original text: "${originalText.substring(0, 50)}${originalText.length > 50 ? '...' : ''}"`)
          
          // Try to find a matching contentEditable element (currently being edited)
          for (let i = 0; i < contentEditableElements.length; i++) {
            const element = contentEditableElements[i]
            const currentText = element.textContent || element.innerText || ''
            
            // If we find an element with different text, it might be our edited element
            if (currentText.trim() !== '' && currentText !== originalText) {
              console.log(`📝 Found edited text in contentEditable element ${i}:`)
              console.log(`    Original: "${originalText}"`)
              console.log(`    Current:  "${currentText}"`)
              
              return {
                ...block,
                props: {
                  ...block.props,
                  text: currentText
                }
              }
            }
          }

          // Also check all meaningful text elements for matches
          for (let i = 0; i < meaningfulTextElements.length; i++) {
            const element = meaningfulTextElements[i]
            const currentText = element.textContent || element.innerText || ''
            
            // Simple matching: if the original text is contained in the current text or vice versa
            // This handles cases where text was edited but is no longer in contentEditable mode
            const isRelated = originalText.length > 10 && (
              currentText.includes(originalText.substring(0, 20)) ||
              originalText.includes(currentText.substring(0, 20)) ||
              (currentText.trim() !== originalText.trim() && currentText.length > 5)
            )
            
            if (isRelated && currentText !== originalText) {
              console.log(`📝 Found potentially edited text in element ${i}:`)
              console.log(`    Original: "${originalText}"`)
              console.log(`    Current:  "${currentText}"`)
              
              return {
                ...block,
                props: {
                  ...block.props,
                  text: currentText
                }
              }
            }
          }
        }
        
        return block
      })
      
      return {
        ...slide,
        blocks: updatedBlocks
      }
    })

    return {
      slides: updatedSlides,
      messages: messages,
      activeSlide: activeSlide,
      title: workspaceTitle || loadedTitle || presentationTitle || presentationData.title || 'Untitled Presentation'
    }
  }, [messages, activeSlide, presentationTitle, workspaceTitle, loadedTitle])

  // Save to Supabase
  const saveToSupabase = useCallback(async (state: any) => {
    // Don't save if state is invalid
    if (!state || !state.slides || !Array.isArray(state.slides) || state.slides.length === 0) {
      console.log('⚠️ Skipping save - invalid state:', state)
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/presentations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          presentationId,
          workspace,
          state
        })
      })

      if (!response.ok) {
        let errorMessage = `Save failed: ${response.status}`
        
        try {
          const responseText = await response.text()
          
          // Try to parse as JSON first
          if (responseText.startsWith('{')) {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorMessage
          } else if (responseText.includes('<!DOCTYPE')) {
            errorMessage = `API endpoint not found (${response.status})`
          } else {
            errorMessage = responseText || errorMessage
          }
        } catch {
          // If all parsing fails, use the default error message
          errorMessage = `Save failed: ${response.status}`
        }
        
        throw new Error(errorMessage)
      }

      setLastSaved(new Date())
      console.log('✅ Saved to Supabase successfully')
    } catch (error) {
      console.error('❌ Failed to save to Supabase:', error)
      setError(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }, [presentationId, workspace])

  // Debounced autosave
  const triggerAutosave = useCallback(() => {
    const currentState = getCurrentStateWithPatches()
    if (!currentState) return

    const stateString = JSON.stringify(currentState)
    if (stateString === lastStateRef.current) {
      console.log('🔄 No changes detected, skipping save')
      return
    }

    lastStateRef.current = stateString

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Autosave timeout triggered')
      saveToSupabase(currentState)
    }, 2000)

    console.log('🔄 Autosave scheduled in 2 seconds')
  }, [getCurrentStateWithPatches, saveToSupabase])

  // Manual save function
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    const currentState = getCurrentStateWithPatches()
    if (currentState) {
      await saveToSupabase(currentState)
    }
  }, [getCurrentStateWithPatches, saveToSupabase])

  // Load saved state on mount
  useEffect(() => {
    console.log('🚨🚨🚨 SUPABASE AUTOSAVE PROVIDER USEEFFECT IS RUNNING!!! 🚨🚨🚨')
    console.log('🔧 SupabaseAutosaveProvider: Loading effect triggered', { 
      presentationId, 
      workspace,
      presentationIdType: typeof presentationId,
      workspaceType: typeof workspace,
      presentationIdValue: presentationId,
      workspaceValue: workspace
    })
    
    let hasLoaded = false
    
    const loadSavedState = async () => {
      if (hasLoaded) {
        console.log('⚠️ Load already completed, skipping')
        return
      }
      
      // Only proceed if we have valid values - but still run useEffect
      if (!presentationId || !workspace) {
        console.log('⚠️ Skipping load - missing presentationId or workspace:', { presentationId, workspace })
        return
      }
      
      hasLoaded = true
      
      console.log('📥 Starting to load saved state from Supabase...', { presentationId, workspace })
      
      try {
        const response = await fetch(
          `/api/presentations/load?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}`
        )

        console.log('🔍 Response status:', response.status, 'Response OK:', response.ok)
        
        if (response.ok) {
          console.log('✅ Response is OK, parsing JSON...')
          try {
            const result = await response.json()
            console.log('🔍 Raw API result:', result)
            console.log('🔍 Result.state:', result.state)
            console.log('🔍 Result.state.title:', result.state?.title)
            console.log('✅ Loaded saved state from SupabaseAutosaveProvider:', result.state)
            
            // Store the loaded title from database
            if (result.state?.title) {
              setLoadedTitle(result.state.title)
              console.log('💾 Loaded title from database:', result.state.title)
            } else {
              console.log('⚠️ No title found in result.state:', result.state)
            }
            
            console.log('🔍 Checking onStateRestored callback...', { 
              callbackExists: !!onStateRestored,
              callbackType: typeof onStateRestored 
            })
            
            if (onStateRestored) {
              console.log('🔄 Calling onStateRestored callback NOW!')
              try {
                onStateRestored(result.state)
                console.log('✅ onStateRestored callback completed successfully!')
              } catch (callbackError) {
                console.error('❌ Error in onStateRestored callback:', callbackError)
              }
            } else {
              console.log('⚠️ onStateRestored callback not provided')
            }
            
            // Mark loading as complete after a longer delay to allow state to settle
            setTimeout(() => {
              setIsLoading(false)
            }, 5000) // 5 seconds delay
          } catch (jsonError) {
            console.error('❌ Failed to parse JSON response:', jsonError)
            setIsLoading(false)
          }
        } else if (response.status === 404) {
          console.log('📥 No saved state found, starting fresh')
          setIsLoading(false)
          console.log('✅ No saved state, autosave now enabled')
        } else {
          console.error('❌ Failed to load saved state:', response.status)
          setIsLoading(false)
          console.log('⚠️ Load failed, autosave now enabled')
        }
      } catch (error) {
        console.error('❌ Error loading saved state:', error)
        setIsLoading(false)
        console.log('⚠️ Load error, autosave now enabled')
      }
    }

    loadSavedState()
  }, []) // Run once on mount - dependencies were preventing execution

  // Trigger autosave when dependencies change
  useEffect(() => {
    // COMPLETELY DISABLE autosave during loading - no exceptions
    if (isLoading) {
      return
    }
    
    // Additional safety - don't autosave for at least 10 seconds after load started
    const timeSinceLoadStart = Date.now() - loadStartTime
    if (timeSinceLoadStart < 10000) {
      return
    }
    
    triggerAutosave()
  }, [messages, activeSlide, presentationTitle, triggerAutosave, isLoading, loadStartTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const contextValue = {
    isSaving,
    lastSaved,
    error,
    saveNow
  }

  console.log('🚨🚨🚨 SUPABASE AUTOSAVE PROVIDER IS RENDERING!!! 🚨🚨🚨', {
    presentationId,
    workspace,
    messagesCount: messages?.length,
    contextValue
  })

  return (
    <SupabaseAutosaveContext.Provider value={contextValue}>
      {children}
      
      {/* Status notifications */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          💾 Saving...
        </div>
      )}
      
      {lastSaved && !isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 opacity-75">
          ✅ Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ❌ {error}
        </div>
      )}

      {/* Manual save button for testing */}
      <button
        onClick={saveNow}
        className="fixed bottom-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 hover:bg-purple-700"
      >
        🧪 Manual Save Test
      </button>
    </SupabaseAutosaveContext.Provider>
  )
}
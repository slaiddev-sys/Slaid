'use client'

import { useEffect, useRef } from 'react'
import { presentationAPI } from '../lib/api-client'

// Extend Window interface for the new presentation flag
declare global {
  interface Window {
    slaidNewPresentationFlag?: number;
  }
}

interface SimpleAutosaveProps {
  presentationId: number
  workspace: string
  messages: any[]
  activeSlide: number
  presentationTitle?: string
  workspaceTitle?: string
  onStateRestored: (state: any) => void
  onDataLoadComplete?: () => void // Add callback for when loading is complete
  children: React.ReactNode
}

export function SimpleAutosave({
  presentationId,
  workspace,
  messages,
  activeSlide,
  presentationTitle,
  workspaceTitle,
  onStateRestored,
  onDataLoadComplete,
  children
}: SimpleAutosaveProps) {
  console.log('🚀🚀🚀 SIMPLE AUTOSAVE COMPONENT IS MOUNTING!', { 
    presentationId, 
    workspace, 
    messagesLength: messages?.length,
    presentationTitle,
    workspaceTitle 
  })
  
  // Force a console log to ensure this component is being used
  console.log('🚀🚀🚀 SIMPLE AUTOSAVE: Component rendered at', new Date().toISOString())
  
  const hasLoaded = useRef(false)
  const loadTimestamp = useRef<number>(0)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastLoadedKey = useRef<string>('')

  // Load data on mount - ONLY ONCE
  useEffect(() => {
    console.log('🔄🔄🔄 SIMPLE AUTOSAVE: useEffect triggered!', { hasLoaded: hasLoaded.current, presentationId, workspace })
    
    // Create a unique key for this presentation/workspace combination
    const currentKey = `${presentationId}-${workspace}`
    
    if (lastLoadedKey.current === currentKey) {
      console.log('🔄 SIMPLE AUTOSAVE: Already loaded this presentation/workspace, skipping')
      return
    }
    
    lastLoadedKey.current = currentKey
    loadTimestamp.current = Date.now()
    console.log('🔄🔄🔄 SIMPLE AUTOSAVE: Loading data from database...')

    console.log('🚀🚀🚀 SIMPLE AUTOSAVE: Loading data...')
    
    const loadData = async () => {
      try {
        // 🚨 CHECK FOR NEW PRESENTATION FLAG: Skip loading for truly new presentations
        if ((window as any).slaidNewPresentationFlag === presentationId) {
          console.log('🆕 SIMPLE AUTOSAVE: Skipping load for new presentation:', presentationId)
          // Clear the flag and mark as loaded
          delete (window as any).slaidNewPresentationFlag;
          hasLoaded.current = true;
          console.log('✅ SIMPLE AUTOSAVE: New presentation marked as loaded without loading old data')
          onDataLoadComplete?.();
          return;
        }
        
        console.log('🔄🔄🔄 SIMPLE AUTOSAVE: Making API call...')
        const result = await presentationAPI.load(presentationId, workspace)
        console.log('🔄🔄🔄 SIMPLE AUTOSAVE: API response:', result)
        
        if (result.success && result.state) {
          console.log('🔄🔄🔄 SIMPLE AUTOSAVE: Full API response:', result)
          console.log('🔄🔄🔄 SIMPLE AUTOSAVE: State title:', result.state?.title)
          console.log('🔄🔄🔄 SIMPLE AUTOSAVE: CALLING onStateRestored with:', result.state.title)
          onStateRestored(result.state)
          console.log('🔄🔄🔄 SIMPLE AUTOSAVE: onStateRestored COMPLETED!')
        } else {
          console.log('🔄🔄🔄 SIMPLE AUTOSAVE: No valid state in response', { success: result.success, hasState: !!result.state })
          // No data found, notify completion
          onDataLoadComplete?.()
        }
        
        // CRITICAL FIX: Always mark as loaded after attempting to load, regardless of result
        hasLoaded.current = true
        console.log('✅ SIMPLE AUTOSAVE: Marked as loaded, autosave now enabled')
      } catch (error) {
        console.error('❌❌❌ SIMPLE AUTOSAVE: Load error:', error)
        // Even on error, mark as loaded to prevent infinite loading
        hasLoaded.current = true
        console.log('✅ SIMPLE AUTOSAVE: Marked as loaded despite error, autosave now enabled')
        onDataLoadComplete?.()
      }
    }

    console.log('🔄🔄🔄 SIMPLE AUTOSAVE: About to call loadData()')
    loadData()
    console.log('🔄🔄🔄 SIMPLE AUTOSAVE: loadData() called')
  }, [presentationId, workspace, onStateRestored, onDataLoadComplete]) // Add dependencies to ensure it runs when these change

  // Save data when it changes
  useEffect(() => {
    console.log('💾💾💾 SIMPLE AUTOSAVE: Save effect triggered!', {
      hasLoaded: hasLoaded.current,
      messagesLength: messages?.length,
      activeSlide,
      presentationTitle,
      workspaceTitle,
      presentationId,
      workspace
    })
    
    if (!hasLoaded.current) {
      console.log('🔄 SIMPLE AUTOSAVE: Skipping save - not loaded yet')
      return // Don't save during initial load
    }
    
    // Wait 5 seconds after loading before allowing any saves
    const timeSinceLoad = Date.now() - loadTimestamp.current
    if (timeSinceLoad < 5000) {
      console.log('🔄🔄🔄 SIMPLE AUTOSAVE: Skipping save - too soon after load')
      return
    }

    // Clear existing timeout
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    // Debounce save for 500ms (faster for immediate feedback)
    saveTimeout.current = setTimeout(async () => {
      // 🔧 CRITICAL FIX: Use [...messages].reverse() to avoid mutating original array
      const presentationData = [...messages].reverse().find(
        msg => msg.role === 'assistant' && msg.presentationData && !msg.isLoading
      )?.presentationData

      if (!presentationData?.slides) {
        console.log('🔄 SIMPLE AUTOSAVE: No presentation data to save')
        return
      }

      const state = {
        slides: presentationData.slides,
        messages: messages,
        activeSlide: activeSlide,
        title: presentationData.title || workspaceTitle || presentationTitle || 'Untitled presentation'
      }

      console.log('💾💾💾 SIMPLE AUTOSAVE: Saving...', state.title)

      try {
        console.log('💾 SIMPLE AUTOSAVE: About to save with presentationAPI.save')
        const result = await presentationAPI.save(presentationId, workspace, state)
        console.log('✅✅✅ SIMPLE AUTOSAVE: Saved successfully', result)
      } catch (error) {
        console.error('❌❌❌ SIMPLE AUTOSAVE: Save error:', error)
        // Log additional details about the error
        if (error instanceof Error) {
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack
          })
        }
      }
    }, 500)

  }, [messages, activeSlide, presentationTitle, workspaceTitle, presentationId, workspace])

  return <>{children}</>
}

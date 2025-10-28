import { useState, useEffect } from 'react'
import { useAuth } from '../AuthProvider'
import { supabase } from '../../lib/supabase'
import { workspaceAPI } from '../../lib/api-client'

interface Workspace {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export function useUserWorkspaces() {
  const { user, loading: authLoading } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('')

  // Load user workspaces
  useEffect(() => {
    async function loadWorkspaces() {
      if (authLoading) return // Wait for auth to load
      
      if (!user) {
        // User not logged in, use default workspace
        const defaultWorkspace = 'My Workspace'
        setWorkspaces([{ 
          id: 'default', 
          name: defaultWorkspace, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        setCurrentWorkspace(defaultWorkspace)
        setLoading(false)
        return
      }

      try {
        // Get user session token
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          console.warn('⚠️ No session token, using fallback mode')
          const defaultWorkspace = user ? `${user.email?.split('@')[0]}'s Workspace` : 'My Workspace'
          console.log('🏷️ Generated workspace name for user:', user?.email, '->', defaultWorkspace)
          setWorkspaces([{ 
            id: 'fallback', 
            name: defaultWorkspace, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          setCurrentWorkspace(defaultWorkspace)
          setError(null)
          setLoading(false)
          return
        }

        // Try API call first
        const response = await fetch('/api/workspaces/list', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          let apiWorkspaces = []
          try {
            const data = await response.json()
            apiWorkspaces = data.workspaces || []
          } catch (jsonError) {
            console.warn('⚠️ Failed to parse JSON response, using fallback mode')
            throw new Error('Invalid JSON response')
          }
          console.log('✅ Loaded workspaces via API:', apiWorkspaces.length)
          
          if (apiWorkspaces.length > 0) {
            setWorkspaces(apiWorkspaces)
            setCurrentWorkspace(apiWorkspaces[0].name)
            setError(null)
          } else {
            // No workspaces found, create default one
            const defaultWorkspace = user ? `${user.email?.split('@')[0]}'s Workspace` : 'My Workspace'
            console.log('🏷️ Creating default workspace for user:', user?.email, '->', defaultWorkspace)
            await createWorkspace(defaultWorkspace)
          }
        } else {
          console.warn('⚠️ API call failed with status:', response.status, response.statusText)
          // Try to read error message if possible
          let errorMessage = `API error: ${response.status}`
          try {
            const errorText = await response.text()
            console.warn('⚠️ API error response:', errorText.substring(0, 200))
            errorMessage = errorText
          } catch (e) {
            console.warn('⚠️ Could not read error response')
          }
          
          // Check if it's a database table issue
          if (errorMessage.includes('Could not find the table') || errorMessage.includes('workspaces') || response.status === 500) {
            console.log('🔄 Database tables not ready, using fallback workspace mode for user:', user?.email)
          }
          
          const defaultWorkspace = user ? `${user.email?.split('@')[0]}'s Workspace` : 'My Workspace'
          console.log('🏷️ Using fallback workspace for user:', user?.email, '->', defaultWorkspace)
          setWorkspaces([{ 
            id: 'fallback', 
            name: defaultWorkspace, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          setCurrentWorkspace(defaultWorkspace)
          setError(null)
        }
      } catch (error) {
        console.warn('⚠️ Error loading workspaces, using fallback mode:', error)
        const defaultWorkspace = user ? `${user.email?.split('@')[0]}'s Workspace` : 'My Workspace'
        setWorkspaces([{ 
          id: 'fallback', 
          name: defaultWorkspace, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        setCurrentWorkspace(defaultWorkspace)
        setError(null)
      }
      setLoading(false)
    }

    loadWorkspaces()
  }, [user, authLoading])

  // Create new workspace
  const createWorkspace = async (name: string): Promise<boolean> => {
    if (!user) {
      console.warn('Cannot create workspace: user not logged in')
      return false
    }

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.warn('⚠️ No session token, using fallback mode')
        const newWorkspace = {
          id: `fallback-${Date.now()}`,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setWorkspaces(prev => [...prev, newWorkspace])
        setCurrentWorkspace(name)
        return true
      }

      // Try API call first
      const response = await fetch('/api/workspaces/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name })
      })

      if (response.ok) {
        let workspace = null
        try {
          const data = await response.json()
          workspace = data.workspace
        } catch (jsonError) {
          console.warn('⚠️ Failed to parse JSON response, using fallback mode')
          throw new Error('Invalid JSON response')
        }
        console.log('✅ Created workspace via API:', workspace.name)
        setWorkspaces(prev => [...prev, workspace])
        setCurrentWorkspace(name)
        return true
      } else {
        console.warn('⚠️ API call failed, using fallback mode')
        const newWorkspace = {
          id: `fallback-${Date.now()}`,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setWorkspaces(prev => [...prev, newWorkspace])
        setCurrentWorkspace(name)
        return true
      }
    } catch (error) {
      console.warn('⚠️ Error creating workspace, using fallback mode:', error)
      const newWorkspace = {
        id: `fallback-${Date.now()}`,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setWorkspaces(prev => [...prev, newWorkspace])
      setCurrentWorkspace(name)
      return true
    }
  }

  // Rename workspace
  const renameWorkspace = async (oldName: string, newName: string): Promise<boolean> => {
    if (!user) {
      console.warn('Cannot rename workspace: user not logged in')
      return false
    }

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.warn('⚠️ No session token, using fallback mode')
        setWorkspaces(prev => 
          prev.map(ws => 
            ws.name === oldName 
              ? { ...ws, name: newName, updated_at: new Date().toISOString() }
              : ws
          )
        )
        if (currentWorkspace === oldName) {
          setCurrentWorkspace(newName)
        }
        return true
      }

      // Try API call first
      const response = await fetch('/api/workspaces/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ oldName, newName })
      })

      if (response.ok) {
        console.log('✅ Renamed workspace via API:', oldName, '->', newName)
        setWorkspaces(prev => 
          prev.map(ws => 
            ws.name === oldName 
              ? { ...ws, name: newName, updated_at: new Date().toISOString() }
              : ws
          )
        )
        if (currentWorkspace === oldName) {
          setCurrentWorkspace(newName)
        }
        return true
      } else {
        console.warn('⚠️ API call failed, using fallback mode')
        setWorkspaces(prev => 
          prev.map(ws => 
            ws.name === oldName 
              ? { ...ws, name: newName, updated_at: new Date().toISOString() }
              : ws
          )
        )
        if (currentWorkspace === oldName) {
          setCurrentWorkspace(newName)
        }
        return true
      }
    } catch (error) {
      console.warn('⚠️ Error renaming workspace, using fallback mode:', error)
      setWorkspaces(prev => 
        prev.map(ws => 
          ws.name === oldName 
            ? { ...ws, name: newName, updated_at: new Date().toISOString() }
            : ws
        )
      )
      if (currentWorkspace === oldName) {
        setCurrentWorkspace(newName)
      }
      return true
    }
  }

  return {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    loading,
    error,
    createWorkspace,
    renameWorkspace,
    isAuthenticated: !!user
  }
}

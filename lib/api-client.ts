import { supabase } from './supabase'

// Helper function to get auth headers for API calls
export async function getAuthHeaders(): Promise<{ [key: string]: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  
  console.log('🔐 getAuthHeaders: Session check', { 
    hasSession: !!session, 
    hasAccessToken: !!session?.access_token,
    userEmail: session?.user?.email,
    userId: session?.user?.id
  });
  
  if (session?.access_token) {
    console.log('🔐 getAuthHeaders: Including auth header for user:', session.user?.email);
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }
  
  console.log('🔐 getAuthHeaders: No session found, returning headers without auth');
  return {
    'Content-Type': 'application/json'
  }
}

// Authenticated fetch wrapper
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = await getAuthHeaders()
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  })
}

// Workspace API functions
export const workspaceAPI = {
  async list() {
    const response = await authenticatedFetch('/api/workspaces/list')
    return response.json()
  },

  async create(name: string) {
    const response = await authenticatedFetch('/api/workspaces/create', {
      method: 'POST',
      body: JSON.stringify({ name })
    })
    return response.json()
  },

  async rename(oldName: string, newName: string) {
    const response = await authenticatedFetch('/api/workspaces/rename', {
      method: 'POST',
      body: JSON.stringify({ oldName, newName })
    })
    return response.json()
  }
}

// Presentation API functions
export const presentationAPI = {
  async save(presentationId: number, workspace: string, state: any) {
    const response = await authenticatedFetch('/api/presentations/save', {
      method: 'POST',
      body: JSON.stringify({ presentationId, workspace, state })
    })
    return response.json()
  },

  async load(presentationId: number, workspace: string) {
    const response = await authenticatedFetch(
      `/api/presentations/load?presentationId=${presentationId}&workspace=${encodeURIComponent(workspace)}`
    )
    return response.json()
  }
}

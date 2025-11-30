export const testSupabaseConnection = async () => {
  try {
    const response = await fetch('https://xjltxxqkoofrvovymlpg.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbHR4eHFrb29mcnZvdnltbHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjEzNjIsImV4cCI6MjA3NjI5NzM2Mn0.5_qt_WNjKbsHinxVBluoiPtJ7ZlnmF5-DdguFWI1kv0',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbHR4eHFrb29mcnZvdnltbHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjEzNjIsImV4cCI6MjA3NjI5NzM2Mn0.5_qt_WNjKbsHinxVBluoiPtJ7ZlnmF5-DdguFWI1kv0'
      }
    });
    
    if (response.ok) {
      return { success: true, message: 'Connection successful' };
    } else {
      return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Connection failed' };
  }
};

export const createMockUser = () => {
  const mockUser = {
    id: 'mock-user-' + Date.now(),
    email: 'demo@example.com',
    full_name: 'Demo User',
    department: 'IT'
  };
  
  localStorage.setItem('mock-auth', JSON.stringify(mockUser));
  return mockUser;
};

export const getMockUser = () => {
  const stored = localStorage.getItem('mock-auth');
  return stored ? JSON.parse(stored) : null;
};

export const clearMockUser = () => {
  localStorage.removeItem('mock-auth');
};
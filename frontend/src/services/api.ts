const API_BASE_URL = 'http://localhost:8080/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Authentication endpoints
  register: async (payload: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Registration failed');
    }
    return res.json();
  },

  login: async (payload: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Login failed');
    }
    return res.json();
  },

  // User Profile
  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve user profile');
    }
    return res.json();
  },

  // Food Tracking
  logFood: async (payload: { userId: number; rawInput?: string; foodName?: string; calories?: number; protein?: number; fiber?: number; fat?: number }) => {
    const res = await fetch(`${API_BASE_URL}/food`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to log food');
    }
    return res.json();
  },

  getFoodEntries: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/food/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve food logs');
    }
    return res.json();
  },

  // Workout Tracking
  logWorkout: async (userId: number, payload: { workoutType: string; durationMinutes: number; caloriesBurned: number; notes?: string }) => {
    const res = await fetch(`${API_BASE_URL}/workouts/user/${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to log workout');
    }
    return res.json();
  },

  getWorkouts: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/workouts/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve workouts');
    }
    return res.json();
  },
};

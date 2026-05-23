import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { 
  Activity, 
  Flame, 
  Apple, 
  LogOut, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Plus, 
  Loader2, 
  Dumbbell, 
  Sparkles, 
  Calendar,
  Layers
} from 'lucide-react';

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface FoodEntry {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  fiber: number;
  fat: number;
  entryDate: string;
  isAiAnalyzed: boolean;
  rawInput?: string;
}

interface WorkoutEntry {
  id: number;
  workoutType: string;
  durationMinutes: number;
  caloriesBurned: number;
  workoutDate: string;
  notes?: string;
}

export default function App() {
  // Session State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Tab/Forms State
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Error / Loading
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  // App Data
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);

  // Log Food Form
  const [foodLogMode, setFoodLogMode] = useState<'ai' | 'manual'>('ai');
  const [rawInput, setRawInput] = useState('');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fiber, setFiber] = useState('');
  const [fat, setFat] = useState('');
  const [foodLoading, setFoodLoading] = useState(false);

  // Log Workout Form
  const [workoutType, setWorkoutType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [notes, setNotes] = useState('');
  const [workoutLoading, setWorkoutLoading] = useState(false);

  // Load user data on startup or login
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    setAppLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile
      const profile = await api.getProfile();
      setUser(profile);

      // 2. Fetch Diaries
      const foods = await api.getFoodEntries(profile.id);
      setFoodEntries(foods);

      const exercises = await api.getWorkouts(profile.id);
      setWorkouts(exercises);
    } catch (err: any) {
      console.error(err);
      setError('Session expired. Please log in again.');
      handleLogout();
    } finally {
      setAppLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthLoading(true);
    try {
      if (isLoginTab) {
        // Login
        const data = await api.login({ username, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        // Register
        const data = await api.register({ username, email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      // Reset inputs
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setFoodEntries([]);
    setWorkouts([]);
  };

  const handleLogFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setFoodLoading(true);
    try {
      let payload: any = { userId: user.id };
      if (foodLogMode === 'ai') {
        if (!rawInput.trim()) throw new Error('Please type what you ate.');
        payload.rawInput = rawInput;
      } else {
        if (!foodName || !calories) throw new Error('Food Name and Calories are required.');
        payload = {
          ...payload,
          foodName,
          calories: parseInt(calories),
          protein: protein ? parseFloat(protein) : 0,
          fiber: fiber ? parseFloat(fiber) : 0,
          fat: fat ? parseFloat(fat) : 0,
        };
      }

      const newEntry = await api.logFood(payload);
      setFoodEntries(prev => [newEntry, ...prev]);

      // Reset forms
      setRawInput('');
      setFoodName('');
      setCalories('');
      setProtein('');
      setFiber('');
      setFat('');
    } catch (err: any) {
      setError(err.message || 'Failed to log food');
    } finally {
      setFoodLoading(false);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!duration || !caloriesBurned) {
      setError('Workout duration and calories burned are required.');
      return;
    }
    setError(null);
    setWorkoutLoading(true);
    try {
      const payload = {
        workoutType,
        durationMinutes: parseInt(duration),
        caloriesBurned: parseInt(caloriesBurned),
        notes,
      };

      const newWorkout = await api.logWorkout(user.id, payload);
      setWorkouts(prev => [newWorkout, ...prev]);

      // Reset
      setDuration('');
      setCaloriesBurned('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to log workout');
    } finally {
      setWorkoutLoading(false);
    }
  };

  // Daily totals calculations
  const todayEntries = foodEntries.filter(entry => {
    const entryDate = new Date(entry.entryDate).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const todayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.workoutDate).toDateString();
    const today = new Date().toDateString();
    return workoutDate === today;
  });

  const totalCaloriesIn = todayEntries.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = todayEntries.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalFiber = todayEntries.reduce((sum, item) => sum + (item.fiber || 0), 0);
  const totalFat = todayEntries.reduce((sum, item) => sum + (item.fat || 0), 0);

  const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const netCalories = totalCaloriesIn - totalCaloriesBurned;

  // Goals
  const calorieGoal = 2000;
  const proteinGoal = 130; // grams
  const fiberGoal = 30; // grams
  const fatGoal = 70; // grams

  const formatPercentage = (value: number, goal: number) => {
    const percent = Math.round((value / goal) * 100);
    return `${percent}%`;
  };

  // Render Authentication Portal
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <Activity size={36} color="#6366f1" />
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }} className="text-gradient">Health Tracker</h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Log nutrition via AI and track your workouts</p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px', padding: '4px', marginBottom: '24px', border: '1px solid var(--panel-border)' }}>
            <button 
              className={isLoginTab ? "btn-primary" : "btn-secondary"} 
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
              onClick={() => { setIsLoginTab(true); setError(null); }}
            >
              Sign In
            </button>
            <button 
              className={!isLoginTab ? "btn-primary" : "btn-secondary"} 
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
              onClick={() => { setIsLoginTab(false); setError(null); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--color-calories)', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <UserIcon size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ paddingLeft: '48px' }} 
                required 
              />
            </div>

            {!isLoginTab && (
              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ paddingLeft: '48px' }} 
                  required 
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ paddingLeft: '48px' }} 
                required 
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={authLoading}>
              {authLoading ? <Loader2 className="shimmer" size={20} /> : (isLoginTab ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Header Panel */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Activity size={24} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Health+</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome back, <span style={{ color: 'white', fontWeight: 600 }}>{user?.username}</span></p>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem' }}>
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: 'var(--color-calories)', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Dismiss</button>
        </div>
      )}

      {appLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Loader2 className="shimmer" size={48} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Daily Goal Counters (4 Dashboard Meters) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* Calories tracker card */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Today's Net Calories</span>
                <Flame size={20} color="var(--color-calories)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{netCalories}</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {calorieGoal} kcal</span>
              </div>
              
              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((netCalories / calorieGoal) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'var(--color-calories)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(244, 63, 94, 0.4)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                <span>In: {totalCaloriesIn} kcal</span>
                <span>Burned: {totalCaloriesBurned} kcal</span>
              </div>
            </div>

            {/* Protein Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Protein Intake</span>
                <Apple size={20} color="var(--color-protein)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{totalProtein}g</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {proteinGoal}g</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((totalProtein / proteinGoal) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'var(--color-protein)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                <span>Completed</span>
                <span>{formatPercentage(totalProtein, proteinGoal)}</span>
              </div>
            </div>

            {/* Fiber Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dietary Fiber</span>
                <Layers size={20} color="var(--color-fiber)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{totalFiber}g</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {fiberGoal}g</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((totalFiber / fiberGoal) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'var(--color-fiber)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(234, 179, 8, 0.4)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                <span>Completed</span>
                <span>{formatPercentage(totalFiber, fiberGoal)}</span>
              </div>
            </div>

            {/* Fat Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Fat Limit</span>
                <Plus size={20} color="var(--color-fat)" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>{totalFat}g</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {fatGoal}g</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((totalFat / fatGoal) * 100, 100)}%`, 
                  height: '100%', 
                  background: 'var(--color-fat)', 
                  borderRadius: '4px',
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
                  transition: 'width 0.5s ease-out'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '8px', color: 'var(--text-muted)' }}>
                <span>Remaining</span>
                <span>{formatPercentage(totalFat, fatGoal)}</span>
              </div>
            </div>
          </div>

          {/* Double Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            
            {/* Left Column: Logging Activities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* AI Food Analyzer Card */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#6366f1" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Log Food intake</h3>
                  </div>

                  {/* Toggle Log Type */}
                  <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', padding: '2px', border: '1px solid var(--panel-border)' }}>
                    <button 
                      type="button" 
                      onClick={() => setFoodLogMode('ai')}
                      style={{ background: foodLogMode === 'ai' ? '#6366f1' : 'transparent', color: 'white', border: 'none', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    >
                      AI Assistant
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFoodLogMode('manual')}
                      style={{ background: foodLogMode === 'manual' ? '#6366f1' : 'transparent', color: 'white', border: 'none', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLogFood}>
                  {foodLogMode === 'ai' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Type casually what you had. Our AI will automatically analyze your meal and extract nutritional facts (calories, protein, fiber, fat).
                      </p>
                      <textarea 
                        rows={4} 
                        placeholder="Example: I had two poached eggs, a piece of sourdough toast with sliced avocado, and a glass of orange juice..." 
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                        required={foodLogMode === 'ai'}
                        style={{ resize: 'none', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Food Item Name</label>
                        <input type="text" placeholder="e.g. Protein shake" value={foodName} onChange={(e) => setFoodName(e.target.value)} required={foodLogMode === 'manual'} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Calories (kcal)</label>
                        <input type="number" placeholder="e.g. 250" value={calories} onChange={(e) => setCalories(e.target.value)} required={foodLogMode === 'manual'} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Protein (g)</label>
                        <input type="number" step="0.1" placeholder="e.g. 24" value={protein} onChange={(e) => setProtein(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fiber (g)</label>
                        <input type="number" step="0.1" placeholder="e.g. 3" value={fiber} onChange={(e) => setFiber(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Fat (g)</label>
                        <input type="number" step="0.1" placeholder="e.g. 5" value={fat} onChange={(e) => setFat(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={foodLoading}>
                    {foodLoading ? (
                      <>
                        <Loader2 className="shimmer" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Analyzing meal values with AI...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Log Meal Entry
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Workout Logger Card */}
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Dumbbell size={20} color="#6366f1" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Log Workout</h3>
                </div>

                <form onSubmit={handleLogWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Exercise Category</label>
                      <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
                        <option value="Running">Running 🏃</option>
                        <option value="Cycling">Cycling 🚴</option>
                        <option value="Swimming">Swimming 🏊</option>
                        <option value="Weight Training">Weight Training 🏋️</option>
                        <option value="Yoga">Yoga 🧘</option>
                        <option value="HIIT">HIIT 🔥</option>
                        <option value="Walking">Walking 🚶</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Duration (minutes)</label>
                      <input type="number" placeholder="e.g. 45" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Estimated Calories Burned</label>
                    <input type="number" placeholder="e.g. 350" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} required />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Notes / Reflections</label>
                    <input type="text" placeholder="e.g. Felt powerful today, set new PR." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={workoutLoading}>
                    {workoutLoading ? (
                      <Loader2 className="shimmer" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <Plus size={18} />
                        Log Exercise Entry
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* Right Column: History Diaries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Food Diary */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Apple size={20} color="#6366f1" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Food Intake Diary</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {foodEntries.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No food logged yet today. Use the AI Assistant to get started!
                    </div>
                  ) : (
                    foodEntries.map((entry) => (
                      <div key={entry.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{entry.foodName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {new Date(entry.entryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {entry.isAiAnalyzed && (
                              <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, display: 'inline-block' }}>
                                AI Analyzed
                              </span>
                            )}
                          </span>
                          {entry.rawInput && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              "{entry.rawInput}"
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--color-calories)', fontSize: '1.05rem' }}>+{entry.calories} kcal</span>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <span>P: {entry.protein}g</span>
                            <span>F: {entry.fiber}g</span>
                            <span>Fat: {entry.fat}g</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Workout History */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dumbbell size={20} color="#6366f1" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Exercise & Workout Log</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                  {workouts.length === 0 ? (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No workouts tracked yet. Log an exercise to count burned calories!
                    </div>
                  ) : (
                    workouts.map((w) => (
                      <div key={w.id} className="glass-panel" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{w.workoutType}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {new Date(w.workoutDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {w.notes && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Notes: {w.notes}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--color-protein)', fontSize: '1.05rem' }}>-{w.caloriesBurned} kcal</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⏱️ {w.durationMinutes} mins</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}

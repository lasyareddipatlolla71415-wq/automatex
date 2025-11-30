import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { testSupabaseConnection, createMockUser } from '@/utils/connectionTest';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnection = async () => {
      const result = await testSupabaseConnection();
      setConnectionStatus(result.success ? 'connected' : 'disconnected');
      if (!result.success) {
        console.warn('Supabase connection failed:', result.message);
      }
    };
    checkConnection();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Retry function for network issues
    const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error: any) {
          if (i === maxRetries - 1) throw error;
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            continue;
          }
          throw error;
        }
      }
    };

    try {
      if (isLogin) {
        const result = await retryOperation(async () => {
          return await supabase.auth.signInWithPassword({ email, password });
        });
        
        if (result.error) {
          // Handle specific auth errors
          if (result.error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials.');
          }
          throw result.error;
        }
        
        toast({ title: 'Welcome back! 🎉', description: 'Successfully logged in.' });
        window.location.href = '/';
      } else {
        const result = await retryOperation(async () => {
          return await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, department },
              emailRedirectTo: `${window.location.origin}/`
            }
          });
        });
        
        if (result.error) {
          if (result.error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please try signing in instead.');
          }
          throw result.error;
        }
        
        // Try to update profile, but don't fail if it doesn't work
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: fullName,
              department,
              email: user.email
            });
          }
        } catch (profileError) {
          console.warn('Profile update failed:', profileError);
        }
        
        toast({ 
          title: 'Account created! ✨', 
          description: 'Welcome to AIVA. You can now start chatting.' 
        });
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // If Supabase is down, use fallback authentication
      if (connectionStatus === 'disconnected' || error.message?.includes('fetch') || error.message?.includes('network')) {
        try {
          const mockUser = createMockUser();
          toast({ 
            title: 'Demo Mode Activated! 🚀', 
            description: 'Using offline mode. Your data will be stored locally.' 
          });
          window.location.href = '/';
          return;
        } catch (fallbackError) {
          console.error('Fallback auth failed:', fallbackError);
        }
      }
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        errorMessage = 'Network connection failed. Trying demo mode...';
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('already registered')) {
        errorMessage = 'This email is already registered. Please try signing in instead.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Authentication Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    setLoading(true);
    try {
      const mockUser = createMockUser();
      toast({ 
        title: 'Demo Mode! 🎮', 
        description: 'Welcome to AIVA demo. All features available!' 
      });
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start demo mode',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md glass relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center glow animate-float">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold gradient-text">AIVA</CardTitle>
            <CardDescription className="text-lg">AI Complaint Logging Assistant</CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              {connectionStatus === 'checking' && (
                <span className="text-xs text-muted-foreground">Checking connection...</span>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="w-3 h-3" />
                  <span>Online</span>
                </div>
              )}
              {connectionStatus === 'disconnected' && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Mode</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="glass-hover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., IT, HR, Sales"
                    className="glass-hover"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-hover"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-hover"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all glow"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </Button>
            
            {connectionStatus === 'disconnected' && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={handleDemoMode}
                disabled={loading}
              >
                <Bot className="w-4 h-4 mr-2" />
                Try Demo Mode
              </Button>
            )}
          </form>
          
          <div className="mt-4 space-y-2 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors block w-full"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
            
            {connectionStatus === 'connected' && (
              <button
                onClick={handleDemoMode}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Or try demo mode
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, LayoutDashboard, Ticket as TicketIcon, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import TicketForm from '@/components/TicketForm';
import TicketWidget from '@/components/TicketWidget';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          return;
        }
      } catch (error) {
        console.warn('Supabase auth check failed:', error);
      }
      
      // Check mock user
      const mockUser = JSON.parse(localStorage.getItem('mock-auth') || 'null');
      if (mockUser) {
        setUserEmail(mockUser.email || 'Demo User');
      } else {
        navigate('/auth');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase logout failed:', error);
    }
    localStorage.removeItem('mock-auth');
    toast({ title: 'Logged out successfully' });
    window.location.href = '/auth';
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">AIVA Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, {userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="glass-hover"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button
                onClick={() => navigate('/tickets')}
                variant="outline"
                className="glass-hover"
              >
                <TicketIcon className="w-4 h-4 mr-2" />
                My Tickets
              </Button>
              <Button
                onClick={() => navigate('/analytics')}
                variant="outline"
                className="glass-hover"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="glass-hover"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 h-[calc(100vh-200px)]">
          <ChatInterface />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Quick Actions
            </h3>
            <Button
              onClick={() => setShowTicketForm(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="w-full glass-hover"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>

          {/* Ticket Widget */}
          <TicketWidget />

          {/* Help Card */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-3">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              AIVA is here 24/7 to assist you with any technical issues. Just start chatting!
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>✨ AI-powered troubleshooting</p>
              <p>🎟️ Automatic ticket creation</p>
              <p>⚡ Real-time support</p>
            </div>
          </div>
        </div>
      </div>

      <TicketForm
        open={showTicketForm}
        onOpenChange={setShowTicketForm}
        onSuccess={() => toast({ title: 'Ticket created!', description: 'Check your tickets page for updates.' })}
      />
    </div>
  );
}
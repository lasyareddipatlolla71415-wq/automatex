import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (data) {
            setTickets(data);
            return;
          }
        }
      } catch (error) {
        console.warn('Supabase tickets fetch failed, using local storage:', error);
      }
      
      // Fallback to local storage
      const mockUser = JSON.parse(localStorage.getItem('mock-auth') || 'null');
      if (mockUser) {
        const allTickets = JSON.parse(localStorage.getItem('mock-tickets') || '[]');
        const userTickets = allTickets.filter((t: any) => t.user_id === mockUser.id);
        setTickets(userTickets.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6 glass-hover">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold gradient-text mb-6">My Tickets</h1>
        <div className="grid gap-4">
          {tickets.length === 0 ? (
            <Card className="glass p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎟️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets. Start a conversation with AIVA or create a ticket manually.
                </p>
                <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-secondary">
                  Start Chatting with AIVA
                </Button>
              </div>
            </Card>
          ) : (
            tickets.map((ticket) => (
              <Card key={ticket.id} className="glass p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <Badge className="bg-primary/20 text-primary">{ticket.ticket_number}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{ticket.category}</Badge>
                      <Badge 
                        className={`${
                          ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-700' :
                          ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-700' :
                          'bg-green-500/20 text-green-700'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        className={`${
                          ticket.priority === 'critical' ? 'bg-red-500/20 text-red-700' :
                          ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-700' :
                          ticket.priority === 'medium' ? 'bg-blue-500/20 text-blue-700' :
                          'bg-gray-500/20 text-gray-700'
                        }`}
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface LatestTicket {
  ticket_number: string;
  status: string;
  title: string;
}

export default function TicketWidget() {
  const [ticket, setTicket] = useState<LatestTicket | null>(null);

  useEffect(() => {
    const fetchLatestTicket = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('tickets')
            .select('ticket_number, status, title')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            setTicket(data);
            return;
          }
        }
      } catch (error) {
        console.warn('Supabase ticket fetch failed, checking local storage:', error);
      }
      
      // Fallback to local storage
      const mockUser = JSON.parse(localStorage.getItem('mock-auth') || 'null');
      if (mockUser) {
        const tickets = JSON.parse(localStorage.getItem('mock-tickets') || '[]');
        const userTickets = tickets.filter((t: any) => t.user_id === mockUser.id);
        if (userTickets.length > 0) {
          const latest = userTickets.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          setTicket({
            ticket_number: latest.ticket_number,
            status: latest.status,
            title: latest.title
          });
        }
      }
    };

    fetchLatestTicket();
  }, []);

  if (!ticket) return null;

  const getStatusIcon = () => {
    switch (ticket.status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'resolved':
      case 'closed':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <Card className="glass p-4 hover:scale-105 transition-transform cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Latest Ticket</p>
          <p className="font-semibold text-sm truncate">{ticket.ticket_number}</p>
        </div>
        <Badge className={getStatusColor()}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      </div>
    </Card>
  );
}
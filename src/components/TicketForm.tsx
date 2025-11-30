import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Ticket, Sparkles } from 'lucide-react';

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const categories = [
  'Network Issues',
  'Software Problems',
  'Hardware Malfunction',
  'Login Issues',
  'Email Problems',
  'Performance Issues',
  'Other'
];

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

export default function TicketForm({ open, onOpenChange, onSuccess }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userId = null;
      let ticketNumber = `TK-${Date.now()}`;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          
          const { data, error } = await supabase
            .from('tickets')
            .insert({
              user_id: user.id,
              title,
              description,
              category,
              priority: priority as any,
              status: 'open',
              ticket_number: ticketNumber
            })
            .select()
            .single();

          if (error) throw error;
          ticketNumber = data.ticket_number || ticketNumber;
        }
      } catch (supabaseError) {
        console.warn('Supabase ticket creation failed, using local storage:', supabaseError);
        
        // Fallback to local storage
        const mockUser = JSON.parse(localStorage.getItem('mock-auth') || 'null');
        if (!mockUser) throw new Error('Not authenticated');
        
        const tickets = JSON.parse(localStorage.getItem('mock-tickets') || '[]');
        const newTicket = {
          id: Date.now(),
          user_id: mockUser.id,
          title,
          description,
          category,
          priority,
          status: 'open',
          ticket_number: ticketNumber,
          created_at: new Date().toISOString()
        };
        
        tickets.push(newTicket);
        localStorage.setItem('mock-tickets', JSON.stringify(tickets));
      }

      toast({
        title: 'Ticket Created! 🎟️',
        description: `Your ticket ${ticketNumber} has been created successfully.`
      });

      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create ticket',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Create New Ticket</DialogTitle>
              <DialogDescription>
                Fill in the details below and we'll get back to you soon
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
              className="glass-hover"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="glass-hover">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="glass-hover">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              required
              rows={6}
              className="glass-hover resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
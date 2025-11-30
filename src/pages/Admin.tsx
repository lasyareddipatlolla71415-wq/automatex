import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Users, Settings, Shield } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const mockTickets = [
    { id: 1, ticket_number: 'TK-001', title: 'Login Issues', user: 'john@company.com', status: 'open', priority: 'high', created_at: '2024-01-15' },
    { id: 2, ticket_number: 'TK-002', title: 'Network Connectivity', user: 'sarah@company.com', status: 'in_progress', priority: 'critical', created_at: '2024-01-14' },
    { id: 3, ticket_number: 'TK-003', title: 'Software Bug', user: 'mike@company.com', status: 'resolved', priority: 'medium', created_at: '2024-01-13' },
    { id: 4, ticket_number: 'TK-004', title: 'Hardware Malfunction', user: 'lisa@company.com', status: 'open', priority: 'low', created_at: '2024-01-12' }
  ];

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateTicketStatus = (ticketId: number, newStatus: string) => {
    // In a real app, this would update the database
    console.log(`Updating ticket ${ticketId} to status: ${newStatus}`);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6 glass-hover">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage support tickets and system settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
            </div>
          </Card>
          <Card className="glass p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets, users, or ticket numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-hover"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 glass-hover">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tickets Table */}
        <Card className="glass overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold">All Tickets ({filteredTickets.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Ticket</th>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Created</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <Badge className="bg-primary/20 text-primary">{ticket.ticket_number}</Badge>
                    </td>
                    <td className="p-4 font-medium">{ticket.title}</td>
                    <td className="p-4 text-muted-foreground">{ticket.user}</td>
                    <td className="p-4">
                      <Badge 
                        className={`${
                          ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-700' :
                          ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-700' :
                          'bg-green-500/20 text-green-700'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Select onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Update" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Analytics() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Tickets', value: '24', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'Open Tickets', value: '8', icon: Clock, color: 'text-yellow-600' },
    { title: 'Resolved', value: '16', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Critical', value: '2', icon: AlertTriangle, color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => navigate('/')} variant="outline" className="mb-6 glass-hover">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your support ticket metrics and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass p-6 hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Ticket Categories</h3>
            <div className="space-y-3">
              {[
                { name: 'Network Issues', count: 8, percentage: 33 },
                { name: 'Software Problems', count: 6, percentage: 25 },
                { name: 'Hardware Issues', count: 5, percentage: 21 },
                { name: 'Login Issues', count: 3, percentage: 13 },
                { name: 'Other', count: 2, percentage: 8 }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Response Times</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Response Time</span>
                <span className="font-semibold">2.4 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fastest Response</span>
                <span className="font-semibold text-green-600">15 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Resolution Rate</span>
                <span className="font-semibold text-blue-600">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                <span className="font-semibold text-purple-600">4.8/5</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock } from 'lucide-react';

const RecentPayments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<{
    _id: string;
    title: string;
    finalPrice: number;
    paymentMethod: string;
    paidAt: string;
    professional: { firstName: string; lastName: string };
    status: string;
  }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.getTransactions(1, 10);
        if (res.success) setItems(res.data.transactions);
      } catch (err) {
        console.error('Failed to load payments', err);
        toast({ title: 'Error', description: 'Failed to load payments', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your payment history for completed services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 w-1/3 bg-muted/30 rounded mb-2" />
                <div className="h-3 w-1/4 bg-muted/20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Your payment history for completed services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No payments yet</div>
          ) : (
            items.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{tx.title} - {tx.professional?.firstName} {tx.professional?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.paidAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${tx.finalPrice?.toFixed?.(2)}</p>
                  <Badge variant="secondary" className="text-xs">Paid</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPayments;
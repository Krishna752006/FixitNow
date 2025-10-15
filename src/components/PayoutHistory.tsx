import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface Payout {
  _id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankAccount: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
  };
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failureReason?: string;
  notes?: string;
  transactionReference?: string;
}

const PayoutHistory: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayouts();
  }, [page]);

  const fetchPayouts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPayouts(page, 5);
      if (response.success) {
        setPayouts(response.data.payouts);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payout history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RotateCcw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'failed':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-orange-600';
    }
  };

  if (isLoading && payouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your withdrawal requests and their status</CardDescription>
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
        <CardTitle>Payout History</CardTitle>
        <CardDescription>Your withdrawal requests and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payout requests yet
            </div>
          ) : (
            payouts.map((payout) => (
              <div key={payout._id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">₹{payout.amount.toFixed(2)}</p>
                    <Badge 
                      variant={getStatusVariant(payout.status)} 
                      className="flex items-center gap-1"
                    >
                      <span className={getStatusColor(payout.status)}>
                        {getStatusIcon(payout.status)}
                      </span>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    To: {payout.bankAccount.bankName} • ****{payout.bankAccount.accountNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested: {new Date(payout.requestedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {payout.completedAt && (
                    <p className="text-sm text-green-600">
                      Completed: {new Date(payout.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {payout.transactionReference && (
                    <p className="text-xs text-muted-foreground">
                      Ref: {payout.transactionReference}
                    </p>
                  )}
                  {payout.failureReason && (
                    <p className="text-sm text-red-600 mt-1">
                      Reason: {payout.failureReason}
                    </p>
                  )}
                  {payout.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Note: {payout.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutHistory;
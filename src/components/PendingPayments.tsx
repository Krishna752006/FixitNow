import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Job } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CreditCard, DollarSign } from 'lucide-react';

const PendingPayments: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const res = await api.getJobsPendingPayment(1, 10);
      if (res.success) {
        setPendingJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load pending payments', err);
      toast({ 
        title: 'Error', 
        description: 'Failed to load pending payments', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (job: Job) => {
    if (job.paymentMethod === 'cash') {
      // Show cash payment confirmation dialog
      const event = new CustomEvent('openCashPaymentDialog', { detail: job });
      window.dispatchEvent(event);
    } else {
      // Show regular payment dialog
      const event = new CustomEvent('openPaymentDialog', { detail: job });
      window.dispatchEvent(event);
    }
  };

  if (loading) {
    return (
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Pending Payments
          </CardTitle>
          <CardDescription>Jobs completed and awaiting payment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 w-1/2 bg-muted/30 rounded mb-2" />
                <div className="h-3 w-1/3 bg-muted/20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingJobs.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Payments Up to Date
          </CardTitle>
          <CardDescription>All completed jobs have been paid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Great! You have no pending payments.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Pending Payments ({pendingJobs.length})
        </CardTitle>
        <CardDescription>
          These completed jobs require payment to release provider earnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingJobs.map((job) => (
            <div 
              key={job._id} 
              className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{job.title}</p>
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                    Payment Required
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed by {typeof job.professional === 'object' 
                    ? `${job.professional.firstName} ${job.professional.lastName}`
                    : 'Professional'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="font-bold text-lg">₹{job.finalPrice?.toFixed(2) || '0.00'}</p>
                  {job.commission && (
                    <p className="text-xs text-muted-foreground">
                      Provider earns: ₹{job.commission.providerEarnings?.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={() => handlePayNow(job)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingPayments;
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { DollarSign, Heart } from 'lucide-react';

interface CashPaymentProps {
  jobId: string;
  professionalId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CashPayment = ({
  jobId,
  professionalId,
  amount,
  onSuccess,
  onCancel
}: CashPaymentProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  const suggestedTips = [
    { label: '10%', value: Math.round(amount * 0.1) },
    { label: '15%', value: Math.round(amount * 0.15) },
    { label: '20%', value: Math.round(amount * 0.2) },
  ];

  const totalAmount = amount + tipAmount;

  const handleTipSelect = (value: number) => {
    setTipAmount(value);
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    const numValue = parseFloat(value) || 0;
    setTipAmount(numValue);
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    try {
      const response = await api.confirmPayment(jobId, tipAmount, undefined);
      if (response.success) {
        toast({
          title: 'Payment Confirmed',
          description: `Cash payment of ₹${totalAmount.toFixed(2)} confirmed successfully${tipAmount > 0 ? ` (includes ₹${tipAmount} tip)` : ''}`,
        });
        onSuccess();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to confirm cash payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error confirming cash payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm cash payment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Cash Payment
        </CardTitle>
        <CardDescription>
          Pay the professional directly and confirm the payment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Amount */}
        <div className="space-y-2">
          <Label>Service Amount</Label>
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-2xl font-bold">₹{amount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Fixed service rate</p>
          </div>
        </div>

        {/* Tip Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Add a Tip (Optional)
          </Label>
          <p className="text-xs text-muted-foreground">
            Show your appreciation for excellent service
          </p>

          {/* Suggested Tips */}
          <div className="grid grid-cols-3 gap-2">
            {suggestedTips.map((tip) => (
              <Button
                key={tip.label}
                type="button"
                variant={tipAmount === tip.value && !customTip ? "default" : "outline"}
                onClick={() => handleTipSelect(tip.value)}
                className="w-full"
              >
                <div className="text-center">
                  <div className="font-semibold">{tip.label}</div>
                  <div className="text-xs">₹{tip.value}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Custom Tip */}
          <div className="space-y-2">
            <Label htmlFor="customTip">Custom Tip Amount</Label>
            <Input
              id="customTip"
              type="number"
              placeholder="Enter custom tip amount"
              value={customTip}
              onChange={(e) => handleCustomTipChange(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Total Amount */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount to Pay</p>
              {tipAmount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Service: ₹{amount} + Tip: ₹{tipAmount}
                </p>
              )}
            </div>
            <p className="text-3xl font-bold text-primary">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Please pay ₹{totalAmount.toFixed(2)} in cash to the professional and click "Payment Completed" to confirm.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirmPayment} disabled={isLoading}>
          {isLoading ? 'Confirming...' : 'Payment Completed'}
        </Button>
      </CardFooter>
    </Card>
  );
};
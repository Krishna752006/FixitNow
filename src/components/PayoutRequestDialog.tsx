import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api, Professional } from '@/services/api';
import { DollarSign, AlertCircle, CreditCard, Loader2 } from 'lucide-react';

interface PayoutRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professional: Professional | null;
  availableBalance: number;
  onSuccess: () => void;
}

interface PayoutBalance {
  totalEarnings: number;
  totalPaidOut: number;
  pendingAmount: number;
  availableBalance: number;
  minimumPayout: number;
}

const PayoutRequestDialog: React.FC<PayoutRequestDialogProps> = ({
  isOpen,
  onOpenChange,
  professional,
  availableBalance: initialBalance,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [balanceData, setBalanceData] = useState<PayoutBalance | null>(null);
  const { toast } = useToast();

  if (!professional) {
    return null;
  }

  useEffect(() => {
    if (isOpen) {
      fetchPayoutBalance();
    }
  }, [isOpen]);

  const fetchPayoutBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getPayoutBalance();
      if (response.success) {
        setBalanceData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch payout balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestAmount = parseFloat(amount);
    
    if (!requestAmount || requestAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }

    if (!balanceData) {
      toast({
        title: 'Error',
        description: 'Unable to verify balance. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (requestAmount < balanceData.minimumPayout) {
      toast({
        title: 'Amount too low',
        description: `Minimum payout amount is ₹${balanceData.minimumPayout}.`,
        variant: 'destructive',
      });
      return;
    }

    if (requestAmount > balanceData.availableBalance) {
      toast({
        title: 'Insufficient balance',
        description: `Available balance is ₹${balanceData.availableBalance.toFixed(2)}.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.requestPayout(requestAmount, notes);
      
      if (response.success) {
        toast({
          title: 'Payout requested',
          description: 'Your payout request has been submitted successfully.',
        });
        setAmount('');
        setNotes('');
        onOpenChange(false);
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit payout request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasBankAccount = professional.bankAccount?.accountNumber;

  if (!hasBankAccount) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Bank Account Required
            </DialogTitle>
            <DialogDescription>
              You need to add your bank account details before requesting a payout.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-6">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Please add your bank account details in the profile settings to proceed with payout requests.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Request withdrawal of your available earnings
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingBalance ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading balance...</span>
          </div>
        ) : balanceData && (
          <>
            {/* Balance Summary */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Earnings:</span>
                <span className="font-medium">₹{balanceData.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Previous Payouts:</span>
                <span className="font-medium">₹{balanceData.totalPaidOut.toFixed(2)}</span>
              </div>
              {balanceData.pendingAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending Payouts:</span>
                  <span className="font-medium text-orange-600">₹{balanceData.pendingAmount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Available Balance:</span>
                <span className="font-bold text-green-600">₹{balanceData.availableBalance.toFixed(2)}</span>
              </div>
            </div>

            {/* Bank Account Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Payout to:</p>
              <p className="text-sm text-blue-700">
                {professional.bankAccount?.accountHolderName}
              </p>
              <p className="text-sm text-blue-700">
                {professional.bankAccount?.bankName} • ****{professional.bankAccount?.accountNumber?.slice(-4)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min={balanceData.minimumPayout}
                  max={balanceData.availableBalance}
                  step="0.01"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: ₹{balanceData.minimumPayout} • Maximum: ₹{balanceData.availableBalance.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes for this payout request"
                  maxLength={500}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    'Request Payout'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayoutRequestDialog;
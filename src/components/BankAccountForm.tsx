import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, Professional } from '@/services/api';
import { CreditCard, CheckCircle2, AlertCircle, Edit3, RefreshCw, Clock, XCircle } from 'lucide-react';

interface BankAccountFormProps {
  professional: Professional;
  onUpdate: (updatedProfessional: Professional) => void;
}

interface BankAccountFormData {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: 'savings' | 'current';
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  professional,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [formData, setFormData] = useState<BankAccountFormData>({
    accountHolderName: professional.bankAccount?.accountHolderName || '',
    accountNumber: professional.bankAccount?.accountNumber || '',
    ifscCode: professional.bankAccount?.ifscCode || '',
    bankName: professional.bankAccount?.bankName || '',
    branchName: professional.bankAccount?.branchName || '',
    accountType: professional.bankAccount?.accountType || 'savings',
  });
  const { toast } = useToast();

  // Check verification status on component mount if verification is pending
  useEffect(() => {
    if (professional.bankAccount?.verificationId && 
        professional.bankAccount?.verificationStatus === 'pending') {
      checkVerificationStatus();
    }
  }, [professional.bankAccount?.verificationId]);

  const checkVerificationStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const response = await api.getBankVerificationStatus();
      if (response.success && response.data.isVerified !== professional.bankAccount?.isVerified) {
        // Update professional data if verification status changed
        const updatedProfessional = {
          ...professional,
          bankAccount: {
            ...professional.bankAccount!,
            isVerified: response.data.isVerified,
            verificationStatus: response.data.status === 'completed' ? 'completed' : 
                              response.data.status === 'failed' ? 'failed' : 'pending'
          }
        };
        onUpdate(updatedProfessional);
        
        if (response.data.isVerified) {
          toast({
            title: 'Bank account verified',
            description: 'Your bank account has been successfully verified!',
          });
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRetryVerification = async () => {
    try {
      setIsVerifying(true);
      const response = await api.verifyBankAccount();
      
      if (response.success) {
        toast({
          title: 'Verification initiated',
          description: 'Bank account verification has been started. This may take a few minutes.',
        });
        onUpdate(response.data.professional);
      } else {
        toast({
          title: 'Verification failed',
          description: 'Failed to initiate bank verification. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to initiate verification.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const response = await api.updateBankAccount(formData);
      
      if (response.success) {
        toast({
          title: 'Bank account updated',
          description: 'Your bank account details have been updated successfully.',
        });
        onUpdate(response.data);
        setIsOpen(false);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update bank account details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BankAccountFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            Add your bank account details to receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {professional.bankAccount?.accountNumber ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {professional.bankAccount.isVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : professional.bankAccount.verificationStatus === 'pending' ? (
                  <Clock className="h-5 w-5 text-orange-600" />
                ) : professional.bankAccount.verificationStatus === 'failed' ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {professional.bankAccount.accountHolderName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {professional.bankAccount.bankName} • ****{professional.bankAccount.accountNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    IFSC: {professional.bankAccount.ifscCode}
                  </p>
                </div>
                <div className="text-right">
                  {professional.bankAccount.isVerified ? (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  ) : professional.bankAccount.verificationStatus === 'pending' ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {isCheckingStatus ? 'Checking...' : 'Verifying'}
                    </Badge>
                  ) : professional.bankAccount.verificationStatus === 'failed' ? (
                    <Badge variant="destructive">Failed</Badge>
                  ) : (
                    <Badge variant="outline">Not Verified</Badge>
                  )}
                </div>
              </div>
              
              {!professional.bankAccount.isVerified && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  {professional.bankAccount.verificationStatus === 'pending' ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-orange-700">
                        Bank verification is in progress. This may take a few minutes.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={checkVerificationStatus}
                        disabled={isCheckingStatus}
                      >
                        {isCheckingStatus ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : professional.bankAccount.verificationStatus === 'failed' ? (
                    <div>
                      <p className="text-sm text-red-700 mb-2">
                        Bank verification failed. Please check your account details and try again.
                      </p>
                      {professional.bankAccount.verificationError && (
                        <p className="text-xs text-red-600 mb-2">
                          Error: {professional.bankAccount.verificationError}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryVerification}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Retry Verification
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-orange-700 mb-2">
                        Bank account verification is required for payouts.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetryVerification}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Start Verification
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(true)}
                className="w-full"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Update Bank Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Add your bank account details to start receiving payouts from completed jobs.
              </p>
              <Button onClick={() => setIsOpen(true)} className="w-full">
                Add Bank Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {professional.bankAccount?.accountNumber ? 'Update' : 'Add'} Bank Account
            </DialogTitle>
            <DialogDescription>
              Enter your bank account details for receiving payouts
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountHolderName">Account Holder Name</Label>
              <Input
                id="accountHolderName"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                placeholder="Full name as per bank records"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={formData.ifscCode}
                onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                placeholder="e.g., SBIN0001234"
                maxLength={11}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="e.g., State Bank of India"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name (Optional)</Label>
              <Input
                id="branchName"
                value={formData.branchName}
                onChange={(e) => handleInputChange('branchName', e.target.value)}
                placeholder="e.g., Main Branch"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select 
                value={formData.accountType} 
                onValueChange={(value: 'savings' | 'current') => handleInputChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
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
                {isLoading ? 'Saving...' : 'Save Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BankAccountForm;
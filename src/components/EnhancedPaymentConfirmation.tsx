import React, { useState, useRef } from 'react';
import { api, Job } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X, 
  Loader2,
  Camera,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';

interface EnhancedPaymentConfirmationProps {
  job: Job;
  userType: 'professional' | 'customer';
  onClose: () => void;
  onSuccess: () => void;
}

const EnhancedPaymentConfirmation: React.FC<EnhancedPaymentConfirmationProps> = ({
  job,
  userType,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'initial' | 'upload' | 'verify' | 'dispute'>('initial');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [amount, setAmount] = useState(job.finalPrice?.toString() || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cashDetails = job.cashPaymentDetails;
  const isProfessionalMarked = cashDetails?.professionalMarkedReceived || false;
  const isCustomerConfirmed = cashDetails?.customerConfirmed || false;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setReceiptFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) return;

    try {
      setIsSubmitting(true);
      const response = await api.uploadReceipt(job._id, receiptFile);
      if (response.success) {
        toast({
          title: "Success",
          description: "Receipt uploaded successfully",
        });
        setStep('initial');
        setReceiptFile(null);
        setReceiptPreview(null);
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast({
        title: "Error",
        description: "Failed to upload receipt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkReceived = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.markPaymentReceived(
        job._id,
        paymentMethod,
        parseFloat(amount)
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Payment marked as received. Verification code sent to customer.",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error marking payment received:', error);
      toast({
        title: "Error",
        description: "Failed to mark payment as received",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setIsSubmitting(true);
      const response = await api.confirmPayment(job._id, verificationCode);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Payment confirmed successfully",
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the dispute",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.raisePaymentDispute(job._id, disputeReason);
      
      if (response.success) {
        toast({
          title: "Dispute Raised",
          description: "Our support team will review your case shortly",
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast({
        title: "Error",
        description: "Failed to raise dispute",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProfessionalView = () => {
    if (isProfessionalMarked && isCustomerConfirmed) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Confirmed</h3>
          <p className="text-muted-foreground">
            Both parties have confirmed the payment
          </p>
        </div>
      );
    }

    if (isProfessionalMarked) {
      return (
        <div className="space-y-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-semibold text-warning">Waiting for Customer Confirmation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  You've marked payment as received. Waiting for customer to confirm.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Verification Code: <span className="font-mono font-semibold">{cashDetails?.verificationCode}</span>
                </p>
              </div>
            </div>
          </div>

          {cashDetails?.receiptPhotos && cashDetails.receiptPhotos.length > 0 && (
            <div>
              <Label>Uploaded Receipts</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {cashDetails.receiptPhotos.map((photo: any, idx: number) => (
                  <img
                    key={idx}
                    src={photo.url}
                    alt="Receipt"
                    className="rounded-lg border"
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setStep('upload')}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Additional Receipt
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <Label>Payment Method</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
            >
              Cash
            </Button>
            <Button
              variant={paymentMethod === 'online' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('online')}
            >
              Online
            </Button>
          </div>
        </div>

        <div>
          <Label>Amount Received</Label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-9"
              placeholder="Enter amount"
            />
          </div>
        </div>

        <Button
          onClick={() => setStep('upload')}
          variant="outline"
          className="w-full"
        >
          <Camera className="h-4 w-4 mr-2" />
          Upload Receipt (Optional)
        </Button>

        <Button
          onClick={handleMarkReceived}
          disabled={isSubmitting || !amount}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark Payment Received
            </>
          )}
        </Button>
      </div>
    );
  };

  const renderCustomerView = () => {
    if (isProfessionalMarked && isCustomerConfirmed) {
      return (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Confirmed</h3>
          <p className="text-muted-foreground">
            Transaction completed successfully
          </p>
        </div>
      );
    }

    if (!isProfessionalMarked) {
      return (
        <div className="text-center py-8">
          <Clock className="h-16 w-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Waiting for Professional</h3>
          <p className="text-muted-foreground">
            The professional hasn't marked payment as received yet
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold">Confirm Payment</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Professional has marked payment as received
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">₹{cashDetails?.amount || job.finalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold capitalize">{job.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {cashDetails?.receiptPhotos && cashDetails.receiptPhotos.length > 0 && (
          <div>
            <Label>Receipt Photos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {cashDetails.receiptPhotos.map((photo: any, idx: number) => (
                <img
                  key={idx}
                  src={photo.url}
                  alt="Receipt"
                  className="rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Verification Code (Optional)</Label>
          <Input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the code provided by the professional
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Payment
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep('dispute')}
            disabled={isSubmitting}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Issue
          </Button>
        </div>
      </div>
    );
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div>
        <Label>Upload Receipt Photo</Label>
        <div className="mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {receiptPreview ? (
            <div className="relative">
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="w-full rounded-lg border"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setReceiptFile(null);
                  setReceiptPreview(null);
                }}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-dashed"
            >
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload receipt
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG or PDF (max 5MB)
                </p>
              </div>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('initial')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUploadReceipt}
          disabled={!receiptFile || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </Button>
      </div>
    </div>
  );

  const renderDisputeStep = () => (
    <div className="space-y-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h4 className="font-semibold text-destructive">Payment Issue</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Describe the issue with this payment. Our support team will review your case.
            </p>
          </div>
        </div>
      </div>

      <div>
        <Label>Reason for Dispute</Label>
        <Textarea
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          placeholder="Please explain the issue..."
          className="mt-2 min-h-[120px]"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('initial')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleRaiseDispute}
          disabled={isSubmitting || !disputeReason.trim()}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Raise Dispute'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' ? 'Upload Receipt' :
             step === 'dispute' ? 'Payment Issue' :
             'Payment Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {userType === 'professional' 
              ? 'Mark payment as received and wait for customer confirmation'
              : 'Confirm the payment details provided by the professional'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' ? renderUploadStep() :
           step === 'dispute' ? renderDisputeStep() :
           userType === 'professional' ? renderProfessionalView() : renderCustomerView()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedPaymentConfirmation;

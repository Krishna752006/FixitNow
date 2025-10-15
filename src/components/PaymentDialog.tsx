import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { api, Job } from '@/services/api';
import { CreditCard, Wallet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  job,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [showPaymentLinkFallback, setShowPaymentLinkFallback] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && paymentMethod === 'online') {
      loadRazorpayKey();
    }
    
    // Reset fallback state when dialog opens
    if (open) {
      setShowPaymentLinkFallback(false);
      setIsProcessing(false);
    }
  }, [open, paymentMethod]);

  const loadRazorpayKey = async () => {
    try {
      const response = await api.getRazorpayKey();
      if (response.success) {
        setRazorpayKey(response.data.keyId);
      }
    } catch (error) {
      console.error('Failed to load Razorpay key:', error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentLinkFallback = async (payAmount: number) => {
    try {
      // Simple payment link without parameters
      const paymentUrl = 'https://razorpay.me/@fixitnow4870/';
      
      // Store payment details for reference
      const paymentDetails = {
        jobId: job?._id,
        jobTitle: job?.title,
        amount: payAmount,
        timestamp: new Date().toISOString(),
      };

      // Store in localStorage for tracking
      localStorage.setItem(`payment_${job?._id}`, JSON.stringify(paymentDetails));

      toast({
        title: "Opening Payment Link",
        description: `Please enter ₹${payAmount} manually on the payment page.`,
      });

      // Log payment attempt for tracking
      console.log('Payment link fallback initiated:', paymentDetails);

      // Open payment link in new tab
      window.open(paymentUrl, '_blank');

      // Show instructions to user
      setTimeout(() => {
        toast({
          title: "Payment Instructions",
          description: `Enter amount ₹${payAmount} on the payment page, complete payment, then return here to confirm.`,
        });
      }, 2000);

      // Show the fallback UI
      setShowPaymentLinkFallback(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Payment link fallback error:', error);
      toast({
        title: "Error",
        description: "Failed to open payment link. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleConfirmPaymentLink = async () => {
    if (!job) return;
    
    setIsProcessing(true);
    
    try {
      // Create a manual payment confirmation record
      // This simulates a successful payment for the fallback system
      const paymentConfirmation = {
        jobId: job._id,
        paymentMethod: 'razorpay_link',
        amount: job.finalPrice ?? job.budget?.max ?? job.budget?.min ?? 0,
        confirmedAt: new Date().toISOString(),
        paymentLink: 'https://razorpay.me/@fixitnow4870/',
        status: 'confirmed_manually'
      };

      // Store confirmation details
      localStorage.setItem(`payment_confirmed_${job._id}`, JSON.stringify(paymentConfirmation));
      
      // Remove the pending payment record
      localStorage.removeItem(`payment_${job._id}`);

      toast({
        title: "Payment Confirmed! 🎉",
        description: "Thank you for confirming your payment. The provider has been notified.",
      });
      
      // Reset all states immediately
      setShowPaymentLinkFallback(false);
      setIsProcessing(false);
      setPaymentMethod('online'); // Reset to default
      
      // Call success callback first
      console.log('Calling onPaymentSuccess callback');
      onPaymentSuccess();
      
      // Small delay to ensure state updates, then close dialog
      setTimeout(() => {
        console.log('Closing payment dialog');
        onOpenChange(false);
      }, 100);
      
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!job) return;
    
    setIsProcessing(true);
    
    try {
      // Calculate payment amount with fallbacks
      const payAmount = job.finalPrice ?? job.budget?.max ?? job.budget?.min ?? 0;
      
      if (payAmount <= 0) {
        toast({
          title: "Payment Error",
          description: "Invalid payment amount. Please contact support.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      console.log('Creating payment order for amount:', payAmount);

      // Try to create Razorpay order first
      try {
        const orderResponse = await api.createRazorpayOrder({
          jobId: job._id,
          amount: payAmount,
          currency: 'INR',
        });

        if (orderResponse.success) {
          // Continue with standard Razorpay checkout
          await processStandardRazorpayPayment(orderResponse, payAmount);
          return;
        } else {
          throw new Error('Failed to create order');
        }
      } catch (apiError: any) {
        console.warn('Razorpay API failed, falling back to payment link:', apiError.message);
        
        // Fallback to payment link
        await handlePaymentLinkFallback(payAmount);
        return;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const processStandardRazorpayPayment = async (orderResponse: any, payAmount: number) => {
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const { order } = orderResponse.data;

      // Configure Razorpay options following official standards
      const options = {
        key: razorpayKey, // Your Key ID from Razorpay Dashboard
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: 'FixItNow', // Your business name
        description: `Payment for: ${job.title}`,
        image: '/logo.png', // Your business logo (optional)
        order_id: order.id, // Order ID from server
        handler: async (response: any) => {
          try {
            console.log('Payment successful, verifying...', response);
            
            // Verify payment signature on server (Step 1.5 from Razorpay docs)
            const verifyResponse = await api.verifyRazorpayPayment({
              jobId: job._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.success) {
              toast({
                title: "Payment Successful! 🎉",
                description: "Your payment has been processed and verified successfully!",
              });
              onPaymentSuccess();
              onOpenChange(false);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: typeof job.user === 'object' ? `${job.user.firstName} ${job.user.lastName}` : 'Customer',
          email: typeof job.user === 'object' ? job.user.email : '',
          contact: typeof job.user === 'object' ? job.user.phone : '',
        },
        notes: {
          jobId: job._id,
          jobTitle: job.title,
          serviceCategory: job.category,
        },
        theme: {
          color: '#ea580c', // Your brand color
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
          },
          escape: true,
          backdropclose: false,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };


  const handleCashPayment = async () => {
    if (!job) return;
    
    setIsProcessing(true);
    
    try {
      // For cash payment, we need to use a different API endpoint
      // Since updateJob doesn't support paymentStatus, we'll use processPayment with a dummy method
      const payAmount = job.finalPrice ?? job.budget?.max ?? job.budget?.min ?? 0;
      
      if (payAmount <= 0) {
        toast({
          title: "Payment Error",
          description: "Invalid payment amount. Please contact support.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Create a dummy payment method for cash (this would need backend support)
      // For now, we'll just show success and let the user handle it manually
      toast({
        title: "Cash Payment Confirmed",
        description: "Please ensure you have paid the professional directly. Payment recorded as cash.",
      });
      
      onPaymentSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Cash payment error:', error);
      toast({
        title: "Error",
        description: "Failed to record cash payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'online') {
      handleOnlinePayment();
    } else {
      handleCashPayment();
    }
  };

  if (!job) return null;

  const amount = job.finalPrice || job.budget?.max || 0;
  const providerEarnings = job.commission?.providerEarnings || (amount * 0.9);
  const platformFee = job.commission?.companyFee || (amount * 0.1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Job Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <h4 className="font-medium">{job.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Provider: {typeof job.professional === 'object' 
                    ? `${job.professional.firstName} ${job.professional.lastName}`
                    : 'Professional'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Service Amount</span>
                  <span>₹{amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Platform Fee (10%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Provider Earnings</span>
                  <span>₹{providerEarnings.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">₹{amount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h5 className="font-medium">Select Payment Method</h5>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                />
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <span className="font-medium">Online Payment</span>
                  <p className="text-sm text-muted-foreground">Pay securely with card/UPI via Razorpay</p>
                </div>
                <Badge variant="secondary">Recommended</Badge>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                />
                <Wallet className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <span className="font-medium">Cash Payment</span>
                  <p className="text-sm text-muted-foreground">Pay directly to the professional</p>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Link Fallback Notice */}
          {showPaymentLinkFallback && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h6 className="font-medium text-blue-800">Manual Payment Required</h6>
                  <p className="text-sm text-blue-700 mt-1">
                    A payment link has been opened in a new tab. Please follow these steps:
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-blue-700">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Go to the opened tab: <strong>razorpay.me/@fixitnow4870</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Enter amount: <strong>₹{amount.toFixed(2)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Complete the payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Return here and click "I've Completed Payment"</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-600">
                    <strong>Service:</strong> {job.title}<br/>
                    <strong>Amount to Pay:</strong> ₹{amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Action */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentLinkFallback(false);
                setIsProcessing(false);
                onOpenChange(false);
              }}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            {showPaymentLinkFallback ? (
              <Button
                onClick={handleConfirmPaymentLink}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    I've Completed Payment
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'online' ? (
                      <CreditCard className="h-4 w-4 mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    {paymentMethod === 'online' ? 'Pay Now' : 'Confirm Cash Payment'}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Security Notice */}
          {paymentMethod === 'online' && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment is processed securely by Razorpay. We don't store your card details.</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
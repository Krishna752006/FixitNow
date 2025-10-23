import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Play,
  XCircle,
  Star,
  ChevronDown,
  Loader2,
  CreditCard,
  Star as StarIcon,
  Eye,
  Zap
} from 'lucide-react';
import { Job, api, PaymentMethod } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTime } from '@/contexts/RealTimeContext';
import JobStatusBadge from './JobStatusBadge';
import { toast } from '@/components/ui/use-toast';
import ProfessionalProfileDialog from './ProfessionalProfileDialog';
import { JobTrackingTimeline } from '@/components/job';
import { Download, Printer, FileText } from 'lucide-react';

interface EnhancedJobCardProps {
  job: Job;
  showActions?: boolean;
  variant?: 'user' | 'professional' | 'available';
  onJobCompleted?: () => void;
}

const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({
  job,
  showActions = true,
  variant = 'user',
  onJobCompleted
}) => {
  // Hooks and state
  const navigate = useNavigate();
  const { userType } = useAuth();
  const { updateJobStatus, sendMessage, refreshData } = useRealTime();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionAmount, setCompletionAmount] = useState<number>(0);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState<number>(job.rating || 0);
  const [reviewText, setReviewText] = useState<string>(job.review || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [jobData, setJobData] = useState<Job>(job);

  // Show review dialog when job is completed and no rating exists
  useEffect(() => {
    if (job.status === 'completed' && !job.rating && variant === 'user') {
      const timer = setTimeout(() => {
        setShowReviewDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [job.status, job.rating, variant]);

  const handleGenerateInvoice = async () => {
    if (job.status !== 'completed') {
      toast({
        title: 'Error',
        description: 'Invoice can only be generated for completed jobs',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingInvoice(true);
    try {
      const response = await fetch(`/api/jobs/${job._id}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const data = await response.json();
      setJobData(prev => ({
        ...prev,
        invoice: data.invoice
      }));

      toast({
        title: 'Success',
        description: 'Invoice generated successfully',
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate invoice',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) return;
    
    try {
      setIsSubmittingReview(true);
      const response = await api.rateJob(job._id, rating, reviewText);
      
      if (response.success) {
        toast({
          title: "Thank you!",
          description: "Your review has been submitted successfully.",
        });
        setShowReviewDialog(false);
        await refreshData();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateJobStatus(job._id, newStatus);
      
      if (newStatus === 'completed' && onJobCompleted) {
        onJobCompleted();
      }
      
      await refreshData();
      
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderReviewDialog = () => (
    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate your experience</DialogTitle>
          <DialogDescription>
            How was your experience with {typeof job.professional === 'object' ? 
              job.professional?.businessName || 
              `${job.professional?.firstName} ${job.professional?.lastName}` : 
              'the professional'}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <StarIcon
                  className={`h-10 w-10 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium">
              Your review (optional)
            </label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || !rating}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Rest of your component JSX goes here
  return (
    <Card className="w-full mb-4">
      {renderReviewDialog()}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
            </p>
            <JobStatusBadge status={job.status} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </CardHeader>
      
      {showDetails && (
        <CardContent>
          <div className="space-y-6">
            {/* Job Tracking Timeline */}
            <div>
              <JobTrackingTimeline 
                currentStatus={job.status} 
                statusHistory={job.statusHistory || []}
              />
            </div>

            <Separator />

            {/* Job Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Job Information
              </h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="font-medium">
                    {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                  </span>
                </div>
                {job.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{job.estimatedDuration} hours</span>
                  </div>
                )}
                {job.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">₹{job.budget.min || 0} - ₹{job.budget.max || 0}</span>
                  </div>
                )}
                {job.finalPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Price:</span>
                    <span className="font-medium text-success">₹{job.finalPrice}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{job.location?.address || 'Address not specified'}</p>
                <p className="text-muted-foreground">
                  {job.location?.city}, {job.location?.state} {job.location?.zipCode}
                </p>
              </div>
            </div>

            {/* Professional Details (if assigned) */}
            {job.professional && typeof job.professional === 'object' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned Professional
                  </h4>
                  <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={job.professional.profileImage} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {job.professional.firstName?.[0]}{job.professional.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-semibold">
                          {job.professional.firstName} {job.professional.lastName}
                        </p>
                        {job.professional.businessName && (
                          <p className="text-sm text-muted-foreground">{job.professional.businessName}</p>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {job.professional.rating && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= (job.professional as any).rating?.average
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {(job.professional as any).rating?.average?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(job.professional as any).rating?.count || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Member Since */}
                      {job.professional.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Member since {new Date(job.professional.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {job.professional.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {job.professional.phone}
                          </div>
                        )}
                        {job.professional.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {job.professional.email}
                          </div>
                        )}
                      </div>

                      {/* View Profile Button */}
                      {variant === 'user' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => setShowProfileDialog(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* No Professional Assigned */}
            {!job.professional && variant === 'user' && (
              <>
                <Separator />
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    <strong>Waiting for professional</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Professionals in your area have been notified. You'll be updated once someone accepts your job.
                  </p>
                </div>
              </>
            )}

            {/* Invoice Section */}
            {job.status === 'completed' && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-semibold text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoice
                  </h4>
                  {jobData.invoice ? (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Invoice Number</p>
                          <p className="font-medium">{jobData.invoice.number}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(jobData.invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Invoice Items */}
                      <div className="border-t pt-3 space-y-2">
                        <p className="font-medium text-sm">Service Details</p>
                        {jobData.invoice.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <div className="flex-1">
                              <p className="text-muted-foreground text-xs">{item.description}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{item.total?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Totals */}
                      <div className="border-t pt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Subtotal</p>
                          <p className="font-medium">₹{jobData.invoice.subtotal?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-muted-foreground">Tax (18% GST)</p>
                          <p className="font-medium">₹{jobData.invoice.tax?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <p className="font-bold">Total Amount</p>
                          <p className="font-bold text-lg">₹{jobData.invoice.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">No invoice generated yet</p>
                      <Button
                        size="sm"
                        onClick={handleGenerateInvoice}
                        disabled={isGeneratingInvoice}
                        className="gap-2"
                      >
                        {isGeneratingInvoice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        Generate Invoice
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Actions */}
            {showActions && (
              <>
                <Separator />
                <div className="flex gap-2 pt-2">
                  {/* Cancel Job Button (for pending jobs) */}
                  {job.status === 'pending' && variant === 'user' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                      )}
                      Cancel Job
                    </Button>
                  )}

                  {/* Professional Actions */}
                  {job.status === 'pending' && variant === 'professional' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="mr-2 h-4 w-4" />
                      )}
                      Start Job
                    </Button>
                  )}
                  
                  {job.status === 'in_progress' && variant === 'professional' && (
                    <Button
                      size="sm"
                      onClick={() => setShowCompletionDialog(true)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Complete Job
                    </Button>
                  )}
                  
                  {job.status === 'completed' && !job.rating && variant === 'user' && (
                    <Button
                      size="sm"
                      onClick={() => setShowReviewDialog(true)}
                      disabled={isSubmittingReview}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Rate & Review
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}

      {/* Professional Profile Dialog */}
      {job.professional && (
        <ProfessionalProfileDialog
          professionalId={typeof job.professional === 'object' ? job.professional._id : job.professional}
          professionalData={typeof job.professional === 'object' ? job.professional : undefined}
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
        />
      )}
    </Card>
  );
};

export default EnhancedJobCard;

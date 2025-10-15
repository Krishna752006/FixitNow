import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Award,
  CheckCircle,
  Shield,
  Loader2,
  DollarSign
} from 'lucide-react';
import { Professional, api } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface ProfessionalProfileDialogProps {
  professionalId: string;
  professionalData?: any; // Optional: pass existing data to avoid extra API call
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfessionalProfileDialog: React.FC<ProfessionalProfileDialogProps> = ({
  professionalId,
  professionalData,
  open,
  onOpenChange
}) => {
  const [professional, setProfessional] = useState<any>(professionalData || null);
  const [isLoading, setIsLoading] = useState(!professionalData);

  useEffect(() => {
    if (open && professionalId && !professionalData) {
      loadProfessionalData();
    } else if (professionalData) {
      setProfessional(professionalData);
      setIsLoading(false);
    }
  }, [open, professionalId, professionalData]);

  const loadProfessionalData = async () => {
    if (!professionalId) {
      console.error('No professional ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getProfessionalById(professionalId);
      if (response.success) {
        console.log('Loaded professional data:', response.data.professional);
        setProfessional(response.data.professional);
      }
    } catch (error: any) {
      console.error('Error loading professional data:', error);
      
      // If API fails but we have basic data from job, use that
      if (professionalData) {
        console.log('Using fallback professional data:', professionalData);
        setProfessional(professionalData);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to load professional profile",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !professional) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Debug logging
  console.log('Professional data in dialog:', professional);
  console.log('Services:', professional.services);
  console.log('Experience:', professional.experience);
  console.log('Rating:', professional.rating);

  const initials = professional.firstName && professional.lastName
    ? `${professional.firstName[0]}${professional.lastName[0]}`.toUpperCase()
    : '??';

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Professional Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={professional.profileImage} alt={`${professional.firstName} ${professional.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">
                    {professional.firstName} {professional.lastName}
                  </h3>
                  {professional.businessName && (
                    <p className="text-muted-foreground">{professional.businessName}</p>
                  )}
                </div>
                {professional.verificationStatus === 'verified' && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                {renderStars(professional.rating?.average || 0)}
                <span className="text-lg font-semibold">
                  {professional.rating?.average?.toFixed(1) || '0.0'}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({professional.rating?.count || 0} reviews)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{professional.city}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Services Offered
            </h4>
            <div className="flex flex-wrap gap-2">
              {professional.services?.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {service}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Experience & Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Experience - Always show */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="text-xl font-bold">
                      {professional.experience || 0} years
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Jobs - Always show */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Jobs</p>
                    <p className="text-xl font-bold">
                      {professional.stats?.completedJobs ?? professional.rating?.count ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Earnings - only show if stats available */}
            {professional.stats?.totalEarnings !== undefined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <p className="text-xl font-bold">₹{professional.stats.totalEarnings.toFixed(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bio */}
          {professional.bio && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold">About</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {professional.bio}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold">Contact Information</h4>
            <div className="space-y-2">
              {professional.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.phone}</span>
                </div>
              )}
              {professional.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{professional.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Member Since */}
          {professional.createdAt && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Member since {new Date(professional.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </>
          )}

          {/* Verification Badge */}
          {professional.verificationStatus === 'verified' && (
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-semibold text-success">Verified Professional</p>
                    <p className="text-xs text-muted-foreground">
                      Identity and credentials verified by FixItNow
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          {professional.recentReviews && professional.recentReviews.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Recent Reviews
                </h4>
                <div className="space-y-3">
                  {professional.recentReviews.map((review: any, index: number) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{review.rating}.0</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.review && (
                          <p className="text-sm text-muted-foreground">"{review.review}"</p>
                        )}
                        {review.user && (
                          <p className="text-xs text-muted-foreground mt-2">
                            - {review.user.firstName} {review.user.lastName}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessionalProfileDialog;

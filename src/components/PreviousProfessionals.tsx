import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Heart, Star, MapPin, Calendar, Wrench, Loader2 } from 'lucide-react';
import ScheduleJobModal from '@/components/ScheduleJobModal';
import ProfessionalServiceCards from '@/components/ProfessionalServiceCards';
import { useAuth } from '@/contexts/AuthContext';

interface PreviousProfessional {
  professional: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    services: string[];
    rating: {
      average: number;
      count: number;
    };
    city: string;
  };
  lastServiceDate: string;
  totalServicesCompleted: number;
  lastRating?: number;
}

const PreviousProfessionals: React.FC = () => {
  const [professionals, setProfessionals] = useState<PreviousProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<PreviousProfessional | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadProfessionals();
    loadFavorites();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPreviousProfessionals();
      if (response.success) {
        setProfessionals(response.data.previousProfessionals);
      }
    } catch (error) {
      console.error('Error loading previous professionals:', error);
      toast({
        title: "Error",
        description: "Failed to load previous professionals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await api.getMyFavorites();
      if (response.success) {
        const ids = new Set(response.data.favorites.map((f: any) => f.professional._id));
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleToggleFavorite = async (professionalId: string) => {
    try {
      setTogglingFavorite(professionalId);
      const isFavorite = favoriteIds.has(professionalId);

      if (isFavorite) {
        await api.removeFavorite(professionalId);
        setFavoriteIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(professionalId);
          return newSet;
        });
        toast({
          title: "Success",
          description: "Removed from favorites",
        });
      } else {
        await api.addFavorite(professionalId);
        setFavoriteIds(prev => new Set(prev).add(professionalId));
        toast({
          title: "Success",
          description: "Added to favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setTogglingFavorite(null);
    }
  };

  const handleBookAgain = (professional: PreviousProfessional) => {
    setSelectedProfessional(professional);
    setShowServiceDialog(true);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowServiceDialog(false);
    setShowScheduleModal(true);
  };

  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
    setSelectedService(null);
    setSelectedProfessional(null);
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading professionals...</p>
        </CardContent>
      </Card>
    );
  }

  if (professionals.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No previous professionals yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Complete a job to see your service history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {professionals.map((item) => {
        const prof = item.professional;
        const initials = `${prof.firstName[0]}${prof.lastName[0]}`.toUpperCase();
        const isFavorite = favoriteIds.has(prof._id);

        return (
          <Card key={prof._id} className="glass-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={prof.profileImage} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {prof.firstName} {prof.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {prof.rating.average.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({prof.rating.count} reviews)
                          </span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {prof.city}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(prof._id)}
                      disabled={togglingFavorite === prof._id}
                      className={isFavorite ? "text-destructive hover:text-destructive" : ""}
                    >
                      {togglingFavorite === prof._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {prof.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Wrench className="h-3 w-3 mr-1" />
                        {service}
                      </Badge>
                    ))}
                    {prof.services.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prof.services.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {item.totalServicesCompleted} service{item.totalServicesCompleted !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last: {new Date(item.lastServiceDate).toLocaleDateString()}
                    </div>
                    {item.lastRating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>You rated: {item.lastRating}/5</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleBookAgain(item)}
                      className="flex-1"
                    >
                      Book Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.open(`/professional/${prof._id}`, '_blank');
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {/* Service Selection Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Service</DialogTitle>
            <DialogDescription>
              Choose a specific service you'd like to book with {selectedProfessional?.professional.firstName} {selectedProfessional?.professional.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedProfessional && (
            <div className="py-4 space-y-6">
              {selectedProfessional.professional.services.map((service, idx) => (
                <div key={idx}>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">{service} Services</h4>
                  <ProfessionalServiceCards
                    category={service}
                    onSelectService={(selectedService) => {
                      setSelectedService(selectedService.title);
                      setShowServiceDialog(false);
                      setShowScheduleModal(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Job Modal */}
      {selectedService && selectedProfessional && (
        <ScheduleJobModal
          open={showScheduleModal}
          onOpenChange={handleScheduleModalClose}
          category={selectedService}
          serviceName={selectedService}
          user={user}
          professionalId={selectedProfessional.professional._id}
          onJobScheduled={() => {
            handleScheduleModalClose();
            toast({
              title: "Job Scheduled!",
              description: `Your ${selectedService} service has been scheduled with ${selectedProfessional.professional.firstName} ${selectedProfessional.professional.lastName}.`,
            });
          }}
        />
      )}
    </>
  );
};

export default PreviousProfessionals;

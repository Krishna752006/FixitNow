import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Heart, Star, MapPin, Calendar, Wrench, Loader2 } from 'lucide-react';

interface FavoriteProfessional {
  _id: string;
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
    bio?: string;
  };
  lastServiceDate?: string;
  totalServicesCompleted: number;
  notes?: string;
}

const FavoriteProfessionals: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyFavorites();
      if (response.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorite professionals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (professionalId: string) => {
    try {
      setRemovingId(professionalId);
      const response = await api.removeFavorite(professionalId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Professional removed from favorites",
        });
        setFavorites(favorites.filter(f => f.professional._id !== professionalId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleBookAgain = (professionalId: string) => {
    // Navigate to booking with pre-selected professional
    window.dispatchEvent(new CustomEvent('bookWithProfessional', { 
      detail: { professionalId } 
    }));
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading favorites...</p>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No favorite professionals yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Mark professionals as favorites for quick access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => {
        const prof = favorite.professional;
        const initials = `${prof.firstName[0]}${prof.lastName[0]}`.toUpperCase();

        return (
          <Card key={favorite._id} className="glass-card hover-lift">
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
                      onClick={() => handleRemoveFavorite(prof._id)}
                      disabled={removingId === prof._id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {removingId === prof._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 fill-current" />
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

                  {prof.bio && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {prof.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {favorite.totalServicesCompleted} service{favorite.totalServicesCompleted !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {favorite.lastServiceDate && (
                      <div className="text-sm text-muted-foreground">
                        Last: {new Date(favorite.lastServiceDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleBookAgain(prof._id)}
                      className="flex-1"
                    >
                      Book Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // View professional profile
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
  );
};

export default FavoriteProfessionals;

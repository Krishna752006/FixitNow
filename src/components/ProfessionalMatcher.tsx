import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star, MapPin, Zap, Bell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone: string;
  profileImage?: string;
  skills: string[];
  rating?: {
    average: number;
    count: number;
  };
  location?: {
    city: string;
    state: string;
  };
  matchScore: number;
}

interface ProfessionalMatcherProps {
  jobId: string;
  professionals: Professional[];
  onNotify?: (professionalIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ProfessionalMatcher({
  jobId,
  professionals,
  onNotify,
  isLoading = false,
}: ProfessionalMatcherProps) {
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [isNotifying, setIsNotifying] = useState(false);
  const { toast } = useToast();

  const toggleProfessional = (profId: string) => {
    setSelectedProfessionals(prev =>
      prev.includes(profId)
        ? prev.filter(id => id !== profId)
        : [...prev, profId]
    );
  };

  const handleNotifyProfessionals = async () => {
    if (selectedProfessionals.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one professional',
        variant: 'destructive',
      });
      return;
    }

    setIsNotifying(true);
    try {
      if (onNotify) {
        await onNotify(selectedProfessionals);
      } else {
        // Default API call
        const response = await fetch('/api/chatbot/notify-professionals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            professionalIds: selectedProfessionals,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
      }

      toast({
        title: 'Success',
        description: `Notified ${selectedProfessionals.length} professional(s)`,
      });

      setSelectedProfessionals([]);
    } catch (error) {
      console.error('Notification error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to notify professionals',
        variant: 'destructive',
      });
    } finally {
      setIsNotifying(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (professionals.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No matching professionals found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top Matching Professionals</h3>
        <Badge variant="secondary">
          {professionals.length} Found
        </Badge>
      </div>

      {/* Professionals List */}
      <div className="space-y-3">
        {professionals.map(prof => (
          <Card
            key={prof._id}
            className={`cursor-pointer transition-all ${
              selectedProfessionals.includes(prof._id)
                ? 'border-primary bg-primary/5'
                : 'hover:border-gray-400'
            }`}
            onClick={() => toggleProfessional(prof._id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={prof.profileImage} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {prof.firstName[0]}{prof.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold">
                        {prof.firstName} {prof.lastName}
                      </h4>
                      {prof.businessName && (
                        <p className="text-sm text-gray-600">{prof.businessName}</p>
                      )}
                    </div>

                    {/* Rating */}
                    {prof.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(prof.rating!.average)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {prof.rating.average.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({prof.rating.count} reviews)
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    {prof.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {prof.location.city}, {prof.location.state}
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {prof.skills?.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Score & Checkbox */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-lg text-primary">
                      {prof.matchScore}%
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedProfessionals.includes(prof._id)}
                    onChange={() => toggleProfessional(prof._id)}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleNotifyProfessionals}
          disabled={selectedProfessionals.length === 0 || isNotifying}
          className="flex-1 gap-2"
        >
          {isNotifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          Notify {selectedProfessionals.length > 0 ? `(${selectedProfessionals.length})` : ''}
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedProfessionals([])}
          disabled={selectedProfessionals.length === 0}
        >
          Clear
        </Button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Select professionals and click Notify to send them job details
      </p>
    </div>
  );
}

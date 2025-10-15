import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageCircle } from 'lucide-react';
import { api, Professional } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const SavedProfessionals: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // For now, use top professionals as dynamic data.
        const res = await api.getProfessionals({ page: 1, limit: 6, sortBy: 'rating' });
        if (res.success) setProfessionals(res.data.professionals as any);
      } catch (err) {
        console.error('Failed to load professionals', err);
        toast({ title: 'Error', description: 'Failed to load saved professionals', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="hover-scale group">
            <CardContent className="p-6">
              <div className="h-6 bg-muted/40 rounded w-1/3 mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-1/2 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!professionals.length) {
    return <div className="text-center py-8 text-muted-foreground">No saved professionals yet</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {professionals.map((pro) => (
        <Card key={pro._id} className="hover-scale group">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={(pro as any).profileImage || '/placeholder.svg'} />
                <AvatarFallback>
                  {pro.firstName?.[0]}
                  {pro.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{pro.firstName} {pro.lastName}</h4>
                <p className="text-sm text-muted-foreground">{(pro as any).services?.[0] || 'Professional'}</p>
                <Badge variant="secondary" className="text-xs mt-1">{(pro as any).verificationStatus === 'verified' ? 'Verified Pro' : 'Pro'}</Badge>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{(pro as any).rating?.average?.toFixed?.(1) || 'New'}</span>
                {(pro as any).rating?.count ? (
                  <span className="text-sm text-muted-foreground">({(pro as any).rating.count} reviews)</span>
                ) : null}
              </div>
              {(pro as any).city && (
                <div className="text-sm text-muted-foreground">{(pro as any).city}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" size="sm" onClick={() => window.location.href = `/professionals/${pro._id}`}>View Profile</Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = `/professionals/${pro._id}?contact=true`}>
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedProfessionals;
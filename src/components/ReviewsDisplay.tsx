import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { Star, Loader2, MessageCircle, ThumbsUp } from 'lucide-react';

interface Review {
  _id: string;
  job: {
    _id: string;
    category: string;
    completedAt: string;
    title?: string;
  };
  customer?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  professional?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    services: string[];
    rating: {
      average: number;
      count: number;
    };
  };
  rating: number;
  review?: string;
  categories?: {
    quality?: number;
    punctuality?: number;
    professionalism?: number;
    communication?: number;
  };
  response?: {
    text: string;
    respondedAt: string;
  };
  helpfulVotes: number;
  createdAt: string;
}

interface ReviewsDisplayProps {
  type: 'given' | 'received';
  professionalId?: string;
}

const ReviewsDisplay: React.FC<ReviewsDisplayProps> = ({ type, professionalId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [type, professionalId, currentPage]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (type === 'given') {
        response = await api.getMyReviews(currentPage, 10);
      } else if (professionalId) {
        response = await api.getProfessionalReviews(professionalId, currentPage, 10);
      } else {
        return;
      }

      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderCategoryRatings = (categories?: Review['categories']) => {
    if (!categories) return null;

    const items = [
      { key: 'quality', label: 'Quality' },
      { key: 'punctuality', label: 'Punctuality' },
      { key: 'professionalism', label: 'Professionalism' },
      { key: 'communication', label: 'Communication' },
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {items.map(({ key, label }) => {
          const value = categories[key as keyof typeof categories];
          if (!value) return null;
          
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}:</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="font-medium">{value}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {type === 'given' ? 'No reviews given yet' : 'No reviews received yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {type === 'given' 
              ? 'Complete jobs and leave reviews for professionals'
              : 'Complete jobs to receive reviews from customers'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const person = type === 'given' ? review.professional : review.customer;
        if (!person) {
          console.warn('Review missing person data:', review);
          return null;
        }

        const initials = person.firstName && person.lastName 
          ? `${person.firstName[0]}${person.lastName[0]}`.toUpperCase()
          : '??';

        return (
          <Card key={review._id} className="glass-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarImage src={person.profileImage} alt={`${person.firstName} ${person.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {person.firstName} {person.lastName}
                      </h4>
                      {type === 'given' && review.professional?.services && (
                        <p className="text-xs text-muted-foreground">
                          {review.professional.services.join(', ')}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-foreground">
                          {review.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          • {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {review.job?.category || 'Service'}
                    </Badge>
                  </div>

                  {review.job?.title && (
                    <p className="text-sm font-medium text-muted-foreground mt-2">
                      Job: {review.job.title}
                    </p>
                  )}

                  {review.review && (
                    <p className="text-sm text-foreground mt-3 leading-relaxed">
                      "{review.review}"
                    </p>
                  )}

                  {renderCategoryRatings(review.categories)}

                  {review.response && (
                    <div className="mt-4 bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MessageCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-accent mb-1">
                            Professional Response
                          </p>
                          <p className="text-sm text-foreground">
                            {review.response.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Responded on {new Date(review.response.respondedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful ({review.helpfulVotes || 0})
                    </Button>
                    {review.job?.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        Completed: {new Date(review.job.completedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsDisplay;

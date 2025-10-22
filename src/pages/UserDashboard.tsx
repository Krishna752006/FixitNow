import ScheduleJobModal from '@/components/ScheduleJobModal';
import { CashPayment } from '@/components/CashPayment';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea'; // Add this line

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api, DashboardStats, Job, Notification, CreateJobData } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

import JobStatusBadge from '@/components/JobStatusBadge';
import EnhancedJobCard from '@/components/EnhancedJobCard';
import PaymentMethods from '@/components/PaymentMethods';
import RecentPayments from '@/components/RecentPayments';
import PendingPayments from '@/components/PendingPayments';
import PaymentDialog from '@/components/PaymentDialog';
import LocationPicker from '@/components/LocationPicker';
import FavoriteProfessionals from '@/components/FavoriteProfessionals';
import PreviousProfessionals from '@/components/PreviousProfessionals';
import ReviewsDisplay from '@/components/ReviewsDisplay';
import EnhancedPaymentConfirmation from '@/components/EnhancedPaymentConfirmation';
import AddressManager from '@/components/AddressManager';
import ServiceCards from '@/components/ServiceCards';
import Support from '@/components/Support';
import { useRealTime } from '@/contexts/RealTimeContext';
import { Loader2, Users } from 'lucide-react';
import {
  Calendar,
  Clock,
  Star,
  MessageCircle,
  CreditCard,
  User,
  Bell,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  Wrench,
  Heart,
  Filter,
  Plus,
  Zap,
  Home,
  Car,
  Hammer,
  Scissors,
  PaintBucket,
  Lightbulb,
  LogOut,
  Settings,
  HelpCircle
} from 'lucide-react';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      coordinates: undefined as { lat: number; lng: number } | undefined
    }
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{title: string; price: string; duration: string; category: string} | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const navigate = useNavigate();
  const { user, userType, isAuthenticated, logout, isLoading, refreshUser } = useAuth();
  const { jobs, notifications, unreadCount, refreshData, markNotificationAsRead } = useRealTime();

  // Reviews state for composing ratings
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedJobForPayment, setSelectedJobForPayment] = useState<Job | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedJobForReview, setSelectedJobForReview] = useState<Job | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');

  const [showCashPaymentDialog, setShowCashPaymentDialog] = useState(false);
  const [selectedJobForCashPayment, setSelectedJobForCashPayment] = useState<Job | null>(null);
  const [showEnhancedPaymentDialog, setShowEnhancedPaymentDialog] = useState(false);
  const [selectedJobForEnhancedPayment, setSelectedJobForEnhancedPayment] = useState<Job | null>(null);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);

  const completedJobsWithReviews = jobs.filter(j => j.status === 'completed' && typeof j.rating === 'number');
  const completedJobsPendingReview = jobs.filter(j => j.status === 'completed' && (j.rating === undefined || j.rating === null));

  const averageGivenRating = completedJobsWithReviews.length
    ? (completedJobsWithReviews.reduce((sum, j) => sum + (j.rating || 0), 0) / completedJobsWithReviews.length)
    : 0;

  const handleOpenReviewDialog = (job: Job) => {
    setSelectedJobForReview(job);
    setRating(job.rating || 5);
    setReviewText(job.review || '');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedJobForReview) return;
    
    try {
      setSubmittingReviewId(selectedJobForReview._id);
      const response = await api.rateJob(selectedJobForReview._id, rating, reviewText);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Thank you for your review!",
        });
        await refreshData();
        setShowReviewDialog(false);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReviewId(null);
    }
  };

  // Redirect if not authenticated or not a user
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'user')) {
      navigate('/login/user');
    }
  }, [isAuthenticated, userType, isLoading, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardStats();
      refreshData();
      loadServiceCategories();

      // Initialize profile data
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'India',
          coordinates: user.address?.coordinates
        }
      });
    }
  }, [isAuthenticated, user]);

  // Listen for payment dialog events
  useEffect(() => {
    const handlePaymentDialog = (event: CustomEvent) => {
      setSelectedJobForPayment(event.detail);
      setShowPaymentDialog(true);
    };

    window.addEventListener('openPaymentDialog', handlePaymentDialog as EventListener);
    
    return () => {
      window.removeEventListener('openPaymentDialog', handlePaymentDialog as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleCashPaymentDialog = (event: CustomEvent) => {
      setSelectedJobForCashPayment(event.detail);
      setShowCashPaymentDialog(true);
    };

    window.addEventListener('openCashPaymentDialog', handleCashPaymentDialog as EventListener);
    
    return () => {
      window.removeEventListener('openCashPaymentDialog', handleCashPaymentDialog as EventListener);
    };
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      loadDashboardStats();
      refreshData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadServiceCategories = async () => {
    try {
      setIsLoadingServices(true);
      // Remove city-based filtering to show all services
      const response = await api.getServiceCategories();
      if (response.success && response.data.categories.length > 0) {
        setServiceCategories(response.data.categories);
      } else {
        // Fallback to all available categories if API fails
        setServiceCategories([
          { _id: 'Plumbing', count: 0 },
          { _id: 'Electrical', count: 0 },
          { _id: 'Cleaning', count: 0 },
          { _id: 'Handyman', count: 0 },
          { _id: 'Painting', count: 0 },
          { _id: 'Automotive', count: 0 },
          { _id: 'HVAC', count: 0 },
          { _id: 'Carpentry', count: 0 },
          { _id: 'Landscaping', count: 0 },
          { _id: 'Moving', count: 0 },
          { _id: 'Pest Control', count: 0 },
          { _id: 'Pet Care', count: 0 },
          { _id: 'Security', count: 0 },
          { _id: 'Locksmith', count: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error loading service categories:', error);
      // Always fall back to all available services if API fails
      setServiceCategories([
        { _id: 'Plumbing', count: 0 },
        { _id: 'Electrical', count: 0 },
        { _id: 'Cleaning', count: 0 },
        { _id: 'Handyman', count: 0 },
        { _id: 'Painting', count: 0 },
        { _id: 'Automotive', count: 0 },
        { _id: 'HVAC', count: 0 },
        { _id: 'Carpentry', count: 0 },
        { _id: 'Landscaping', count: 0 },
        { _id: 'Moving', count: 0 },
        { _id: 'Pest Control', count: 0 },
        { _id: 'Pet Care', count: 0 },
        { _id: 'Security', count: 0 },
        { _id: 'Locksmith', count: 0 }
      ]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const loadJobs = async (_status?: string) => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing jobs:', error);
      toast({
        title: "Error",
        description: "Failed to refresh jobs",
        variant: "destructive",
      });
    }
  };

  const loadNotifications = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead();
      if (response.success) {
        await refreshData();
        toast({
          title: "Success",
          description: "All notifications marked as read",
        });
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = (location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  }) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        street: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode,
        coordinates: location.coordinates
      }
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      console.log('Sending profile data:', profileData);
      const response = await api.updateProfile(profileData);
      if (response.success) {
        await refreshUser();
        // Also refresh service categories if city changed
        await loadServiceCategories();
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      console.error('Error details:', error.errors);
      
      // Show detailed validation errors if available
      let errorMessage = "Failed to update profile";
      if (error.errors && Array.isArray(error.errors)) {
        console.log('Validation errors:', JSON.stringify(error.errors, null, 2));
        errorMessage = error.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        console.log('Error message to display:', errorMessage);
      } else {
        console.log('No detailed errors available');
      }
      
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen dashboard-bg-user flex items-center justify-center">
        <div className="text-center glass-card p-8 rounded-xl animate-pulse-glow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || userType !== 'user' || !user) {
    return null;
  }

  // Derived job counts from RealTimeContext (place outside renderParticles())
  const activeJobsCount = jobs.filter(j => j.status === 'accepted' || j.status === 'in_progress').length;
  const upcomingJobsCount = jobs.filter(j => j.status === 'pending').length;
  const completedJobsCount = jobs.filter(j => j.status === 'completed').length;

  // Generate user initials for avatar
  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  // Format user's full name
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  // Create animated particles for background
  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const size = Math.floor(Math.random() * 40) + 10;

      const left = Math.floor(Math.random() * 100);
      const animationDuration = Math.floor(Math.random() * 20) + 10;
      const delay = Math.floor(Math.random() * 10);

      particles.push(
        <div
          key={i}
          className="particle animate-float"
          style={{
            width: size + 'px',
            height: size + 'px',
            left: left + '%',
            top: Math.floor(Math.random() * 100) + '%',
            opacity: Math.random() * 0.3,
            animation: `particleFloat ${animationDuration}s ease-in-out ${delay}s infinite`
          }}
        />
      );
    }
    return particles;
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.getAddresses();
        if (response.success) {
          // Update state with addresses
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    
    fetchAddresses();
  }, []);

  return (
    <div className="min-h-screen dashboard-bg-user">
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
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
                  <Star
                    className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label htmlFor="review" className="text-sm font-medium">
                Your Review (Optional)
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
                disabled={submittingReviewId === selectedJobForReview?._id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReviewId === selectedJobForReview?._id}
              >
                {submittingReviewId === selectedJobForReview?._id ? (
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

      {/* Animated background particles */}
      {renderParticles()}

      {/* Enhanced Header */}
      <header className="border-b glass-nav sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center animate-pulse-glow">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {user.firstName}!</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 hover-glow">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {user.isEmailVerified ? 'Verified User' : 'Unverified User'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-primary/10 hover:border-primary/50 hover-lift"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-destructive text-destructive-foreground px-1 py-0 text-xs animate-pulse">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-accent/10 hover:border-accent/50 hover-lift">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive hover-lift">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover-glow">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-6xl grid-cols-11 h-12 glass-card rounded-xl p-1 interactive-tabs">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Overview</TabsTrigger>
              <TabsTrigger value="book-service" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Book Service</TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Jobs</TabsTrigger>
              <TabsTrigger value="previous" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Previous</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Favorites</TabsTrigger>

              <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Notifications {unreadCount > 0 ? `( ${unreadCount} new )` : ''}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-[60vh] overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`flex items-start gap-3 p-3 rounded-lg border ${!n.isRead ? 'bg-primary/5 border-primary/20' : ''}`}>
                          <div className="mt-1">
                            <Bell className={`h-4 w-4 ${!n.isRead ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{n.title}</h4>
                              <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{n.message}</p>
                          </div>
                          {!n.isRead && (
                            <Button size="sm" variant="outline" onClick={async () => { await markNotificationAsRead(n._id); }}>
                              Mark as read
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Payments</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Reviews</TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Profile</TabsTrigger>
              <TabsTrigger value="edit-profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">Edit Profile</TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover-glow">
                <HelpCircle className="h-4 w-4 mr-1" />
                Support
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">
                Home services at your doorstep
              </h1>
            </div>

            {/* Service Selection Card */}
            <Card className="max-w-4xl mx-auto glass-card border-0 shadow-elegant">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
                  What are you looking for?
                </h2>

                {/* Service Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Plumbing */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Plumbing');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 dark:hover:from-blue-900/40 dark:hover:to-blue-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <Wrench className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      Electrician, Plumber & Carpenter
                    </span>
                  </button>

                  {/* Painting */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Painting');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 dark:hover:from-purple-900/40 dark:hover:to-purple-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <PaintBucket className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      Painting & Water proofing
                    </span>
                  </button>

                  {/* Cleaning */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Cleaning');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <Scissors className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      Cleaning & Pest Control
                    </span>
                  </button>

                  {/* Appliance Repair */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Appliance Repair');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 dark:from-teal-950/30 dark:to-teal-900/30 dark:hover:from-teal-900/40 dark:hover:to-teal-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <Zap className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      AC & Appliance Repair
                    </span>
                  </button>

                  {/* HVAC */}
                  <button
                    onClick={() => {
                      setSelectedCategory('HVAC');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 dark:from-cyan-950/30 dark:to-cyan-900/30 dark:hover:from-cyan-900/40 dark:hover:to-cyan-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative"
                  >
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">Sale</Badge>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <Lightbulb className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      Native Water Purifier
                    </span>
                  </button>

                  {/* Handyman */}
                  <button
                    onClick={() => {
                      setSelectedCategory('Handyman');
                      setIsScheduleModalOpen(true);
                    }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30 dark:hover:from-amber-900/40 dark:hover:to-amber-800/40 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <Hammer className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      Wall makeover by Revamp
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments - Below service selection */}
            <PendingPayments />
          </TabsContent>

          {/* Book Service Tab */}
          <TabsContent value="book-service" className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Book a Service</h2>
              <p className="text-muted-foreground">Browse all available services by category</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategory === 'Plumbing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Plumbing')}
                className="rounded-full"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Plumbing
              </Button>
              <Button
                variant={selectedCategory === 'Electrical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Electrical')}
                className="rounded-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Electrical
              </Button>
              <Button
                variant={selectedCategory === 'Cleaning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Cleaning')}
                className="rounded-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Cleaning
              </Button>
              <Button
                variant={selectedCategory === 'Painting' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Painting')}
                className="rounded-full"
              >
                <PaintBucket className="h-4 w-4 mr-2" />
                Painting
              </Button>
              <Button
                variant={selectedCategory === 'Landscaping' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Landscaping')}
                className="rounded-full"
              >
                <Hammer className="h-4 w-4 mr-2" />
                Landscaping
              </Button>
              <Button
                variant={selectedCategory === 'HVAC' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('HVAC')}
                className="rounded-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                HVAC
              </Button>
              <Button
                variant={selectedCategory === 'Carpentry' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Carpentry')}
                className="rounded-full"
              >
                <Hammer className="h-4 w-4 mr-2" />
                Carpentry
              </Button>
              <Button
                variant={selectedCategory === 'Appliance Repair' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Appliance Repair')}
                className="rounded-full"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Auto Repair
              </Button>
              <Button
                variant={selectedCategory === 'Handyman' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Handyman')}
                className="rounded-full"
              >
                <Hammer className="h-4 w-4 mr-2" />
                Handyman
              </Button>
              <Button
                variant={selectedCategory === 'Other' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('Other')}
                className="rounded-full"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Moving
              </Button>
            </div>

            {/* Service Category Header */}
            {selectedCategory && (
              <div className="flex items-center gap-3 py-4">
                <Wrench className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">{selectedCategory} Services</h3>
                  <p className="text-sm text-muted-foreground">Professional {selectedCategory.toLowerCase()} services</p>
                </div>
              </div>
            )}

            {/* Service Cards Grid */}
            <ServiceCards 
              selectedCategory={selectedCategory}
              onBookService={(service) => {
                if (service) {
                  // Set category from the service being booked
                  setSelectedCategory(service.category);
                  setSelectedService(service);
                  setIsScheduleModalOpen(true);
                }
              }}
            />
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Jobs</h2>
            </div>

            <Tabs defaultValue="current" className="space-y-4">
              <TabsList>
                <TabsTrigger value="current">Current Jobs ({activeJobsCount})</TabsTrigger>
                <TabsTrigger value="past">Past Jobs ({completedJobsCount})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({upcomingJobsCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                {jobs.filter(j => ['accepted','in_progress'].includes(j.status)).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No current jobs</div>
                ) : (
                  <div className="grid gap-4">
                    {(() => {
                      const filteredJobs = jobs.filter(j => ['accepted','in_progress'].includes(j.status));
                      const jobElements = [];
                      for (let i = 0; i < filteredJobs.length; i++) {
                        jobElements.push(<EnhancedJobCard key={filteredJobs[i]._id} job={filteredJobs[i]} variant="user" />);
                      }
                      return jobElements;
                    })()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {jobs.filter(j => j.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending jobs</div>
                ) : (
                  <div className="grid gap-4">
                    {(() => {
                      const filteredJobs = jobs.filter(j => j.status === 'pending');
                      const jobElements = [];
                      for (let i = 0; i < filteredJobs.length; i++) {
                        jobElements.push(<EnhancedJobCard key={filteredJobs[i]._id} job={filteredJobs[i]} variant="user" />);
                      }
                      return jobElements;
                    })()}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {jobs.filter(j => j.status === 'completed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No past jobs</div>
                ) : (
                  <div className="grid gap-4">
                    {(() => {
                      const filteredJobs = jobs.filter(j => j.status === 'completed');
                      const jobElements = [];
                      for (let i = 0; i < filteredJobs.length; i++) {
                        jobElements.push(<EnhancedJobCard key={filteredJobs[i]._id} job={filteredJobs[i]} showActions={true} variant="user" />);
                      }
                      return jobElements;
                    })()}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Previous Professionals Tab */}
          <TabsContent value="previous" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Providers</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Auto-Assign Best Professional</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const newValue = !autoAssignEnabled;
                      await api.toggleAutoAssignment(newValue);
                      setAutoAssignEnabled(newValue);
                      toast({
                        title: "Success",
                        description: `Auto-assignment ${newValue ? 'enabled' : 'disabled'}`,
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update preference",
                        variant: "destructive",
                      });
                    }
                  }}
                  className={autoAssignEnabled ? "bg-success/10 text-success" : ""}
                >
                  {autoAssignEnabled ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Previously Used Professionals
                </CardTitle>
                <CardDescription>
                  Professionals you've worked with before, with ratings and service history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreviousProfessionals />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Favorite Providers</h2>
              <Button onClick={() => navigate('/professionals')}>
                <Heart className="h-4 w-4 mr-2" />
                Find More
              </Button>
            </div>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  Your Favorite Professionals
                </CardTitle>
                <CardDescription>
                  Quick access to your preferred service providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FavoriteProfessionals />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-6">
            <PendingPayments />
            <PaymentMethods />
            <RecentPayments />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-warning text-warning" />
                <span className="text-lg font-bold">{averageGivenRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({completedJobsWithReviews.length} reviews given)</span>
              </div>
            </div>

            <Tabs defaultValue="given" className="space-y-4">
              <TabsList>
                <TabsTrigger value="given">Reviews Given</TabsTrigger>
                <TabsTrigger value="pending">Pending Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="given" className="space-y-4">
                <ReviewsDisplay type="given" />
              </TabsContent>

              <TabsContent value="pending-old" className="space-y-4">
                {completedJobsWithReviews.length === 0 ? (
                  <Card className="hover-scale">
                    <CardContent className="p-6 text-muted-foreground">No reviews yet.</CardContent>
                  </Card>
                ) : (
                  completedJobsWithReviews.map((job) => (
                    <Card key={job._id} className="hover-scale">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {(job.professional?.firstName?.[0] || '?')}{(job.professional?.lastName?.[0] || '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{job.professional?.firstName} {job.professional?.lastName}</h4>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= (job.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            {job.review ? (
                              <p className="text-muted-foreground mb-2">{job.review}</p>
                            ) : null}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{job.title}</span>
                              {job.finalPrice ? <span>${job.finalPrice.toFixed(2)}</span> : null}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {completedJobsPendingReview.length === 0 ? (
                  <Card className="hover-scale">
                    <CardContent className="p-6 text-muted-foreground">No pending reviews.</CardContent>
                  </Card>
                ) : (
                  completedJobsPendingReview.map(job => (
                    <Card key={job._id} className="hover-scale">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {(job.professional?.firstName?.[0] || '?')}{(job.professional?.lastName?.[0] || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{job.professional?.firstName} {job.professional?.lastName}</h4>
                              <p className="text-muted-foreground">{job.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">Completed • Leave a review</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Rating</label>
                            <div className="flex items-center gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewNotes(prev => ({ ...prev, [job._id+':rating']: star as any }))}
                                  aria-label={`Rate ${star}`}
                                  className="focus:outline-none hover:scale-110 transition-transform"
                                >
                                  <Star 
                                    className={`h-6 w-6 ${star <= (Number(reviewNotes[job._id+':rating'] || 0)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="md:col-span-4">
                            <label className="text-sm font-medium">Review (optional)</label>
                            <Textarea
                              placeholder="Share your experience..."
                              value={reviewNotes[job._id] || ''}
                              onChange={(e) => setReviewNotes(prev => ({ ...prev, [job._id]: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={async () => {
                              const rating = Number(reviewNotes[job._id+':rating'] || 0);
                              if (!rating) return;
                              setSubmittingReviewId(job._id);
                              try {
                                const res = await api.rateJob(job._id, rating, reviewNotes[job._id]);
                                if (res.success) {
                                  await refreshData();
                                  setReviewNotes(prev => ({ ...prev, [job._id]: '', [job._id+':rating']: '' as any }));
                                  toast({ title: 'Thank you!', description: 'Your review has been submitted.' });
                                }
                              } catch (err) {
                                console.error('Rate job failed', err);
                                toast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
                              } finally {
                                setSubmittingReviewId(null);
                              }
                            }}
                            disabled={submittingReviewId === job._id || !Number(reviewNotes[job._id+':rating'] || 0)}
                          >
                            {submittingReviewId === job._id ? 'Submitting...' : 'Submit Review'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">{fullName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.isEmailVerified ? "default" : "secondary"}>
                    {user.isEmailVerified ? "Email Verified" : "Email Unverified"}
                  </Badge>
                  <Badge variant={user.isPhoneVerified ? "default" : "secondary"}>
                    {user.isPhoneVerified ? "Phone Verified" : "Phone Unverified"}
                  </Badge>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium">{user.firstName}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium">{user.lastName}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium">{user.email}</p>
                      {user.isEmailVerified && (
                        <p className="text-xs text-success mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium">{user.phone}</p>
                      {user.isPhoneVerified && (
                        <p className="text-xs text-success mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">User Type</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium capitalize">{user.userType}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('edit-profile')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {isLoadingStats ? '...' : dashboardStats?.completedJobs || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs Completed</div>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="text-2xl font-bold text-accent">
                      ${isLoadingStats ? '...' : dashboardStats?.totalSpent || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                  </div>
                  <div className="text-center p-4 bg-success/5 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      {isLoadingStats ? '...' : dashboardStats?.averageRating || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Addresses Section */}
            <AddressManager />
          </TabsContent>

          {/* Edit Profile Tab */}
          <TabsContent value="edit-profile" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold">Edit Profile</h2>
                <p className="text-muted-foreground">Update your personal information and address</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <p className="font-medium text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialAddress={profileData.address.street}
              initialCoordinates={profileData.address.coordinates}
              title="Your Address"
              description="Update your address and location for better service matching"
            />

            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Optional address information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <select
                    value={profileData.address.country}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, country: e.target.value }
                    }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdatingProfile}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isUpdatingProfile ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Settings className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('profile')}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Support userType="user" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        job={selectedJobForPayment}
        onPaymentSuccess={() => {
          setSelectedJobForPayment(null);
          refreshData();
        }}
      />

      {/* Cash Payment Dialog */}
      {showCashPaymentDialog && selectedJobForCashPayment && (
        <Dialog open={showCashPaymentDialog} onOpenChange={setShowCashPaymentDialog}>
          <DialogContent>
            <CashPayment
              jobId={selectedJobForCashPayment._id}
              professionalId={typeof selectedJobForCashPayment.professional === 'string' 
                ? selectedJobForCashPayment.professional 
                : selectedJobForCashPayment.professional?._id || ''}
              amount={selectedJobForCashPayment.finalPrice || 0}
              onSuccess={() => {
                setShowCashPaymentDialog(false);
                refreshData();
              }}
              onCancel={() => setShowCashPaymentDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Enhanced Payment Confirmation Dialog */}
      {showEnhancedPaymentDialog && selectedJobForEnhancedPayment && (
        <EnhancedPaymentConfirmation
          job={selectedJobForEnhancedPayment}
          userType="customer"
          onClose={() => {
            setShowEnhancedPaymentDialog(false);
            setSelectedJobForEnhancedPayment(null);
          }}
          onSuccess={() => {
            refreshData();
          }}
        />
      )}

      {/* Schedule Job Modal */}
      {(selectedCategory || selectedService?.category) && (
        <ScheduleJobModal
          category={selectedService?.category || selectedCategory || 'Plumbing'}
          serviceName={selectedService?.title}
          servicePrice={selectedService?.price ? parseFloat(selectedService.price.replace('$', '')) : undefined}
          serviceDuration={selectedService?.duration}
          user={user}
          onJobScheduled={() => {
            setIsScheduleModalOpen(false);
            setSelectedService(null);
            refreshData();
          }}
          open={isScheduleModalOpen}
          onOpenChange={(open) => {
            setIsScheduleModalOpen(open);
            if (!open) {
              setSelectedService(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;